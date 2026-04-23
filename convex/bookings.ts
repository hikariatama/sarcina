import { v } from "convex/values";

import {
  assertBookingTransition,
  calculateBookingCharge,
  describeStorageDuration,
  getBookingStatusLabel,
} from "@/shared/booking-rules";
import { getBillableRate } from "@/shared/luggage-sizes";
import { mutation, query } from "./_generated/server";
import { markNoCellsAvailable, findBestAvailableCell } from "./cells";
import { getBookingById, toBookingSummary } from "./lib";
import { recordTelemetryEvent } from "./telemetry";
import { luggageSizeValidator } from "./validators";

function createBookingNumber(now: number) {
  return `SRC-${now.toString(36).slice(-6).toUpperCase()}`;
}

function createClaimCode(now: number) {
  return `L${now.toString(36).slice(-4).toUpperCase()}`;
}

export const startBooking = mutation({
  args: {
    requestedSize: luggageSizeValidator,
    correlationId: v.string(),
    route: v.string(),
  },
  handler: async (ctx, args) => {
    const matchedCell = await findBestAvailableCell(ctx, args.requestedSize);

    if (!matchedCell) {
      await markNoCellsAvailable(ctx, args);

      return null;
    }

    const now = Date.now();
    const cell = await ctx.db
      .query("cells")
      .withIndex("by_cell_id", (query) =>
        query.eq("cellId", matchedCell.cellId),
      )
      .first();

    if (!cell) {
      throw new Error(`Cell ${matchedCell.cellId} was not found`);
    }

    const bookingId = await ctx.db.insert("bookings", {
      bookingNumber: createBookingNumber(now),
      claimCode: createClaimCode(now),
      requestedSize: args.requestedSize,
      allocatedSize: matchedCell.size,
      cellId: matchedCell.cellId,
      cellRef: cell._id,
      status: "reserved",
      correlationId: args.correlationId,
      route: args.route,
      pricePerDayRub: getBillableRate(matchedCell.size),
      createdAt: now,
      reservedAt: now,
    });

    const booking = await ctx.db.get(bookingId);

    if (!booking) {
      throw new Error("Booking creation failed");
    }

    await ctx.db.patch(cell._id, {
      status: "reserved",
      activeBookingId: bookingId,
      lastChangedAt: now,
    });

    await recordTelemetryEvent(ctx, {
      timestamp: now,
      eventType: "booking_created",
      bookingId,
      bookingNumber: booking.bookingNumber,
      cellId: booking.cellId,
      correlationId: args.correlationId,
      route: args.route,
      requestedSize: booking.requestedSize,
      allocatedSize: booking.allocatedSize,
      bookingStatus: booking.status,
    });
    await recordTelemetryEvent(ctx, {
      timestamp: now,
      eventType: "cell_reserved",
      bookingId,
      bookingNumber: booking.bookingNumber,
      cellId: booking.cellId,
      correlationId: args.correlationId,
      route: args.route,
      requestedSize: booking.requestedSize,
      allocatedSize: booking.allocatedSize,
      bookingStatus: booking.status,
    });

    return {
      ...toBookingSummary(booking),
      isUpsized: booking.requestedSize !== booking.allocatedSize,
    };
  },
});

export const confirmDeposit = mutation({
  args: {
    bookingId: v.id("bookings"),
    route: v.string(),
  },
  handler: async (ctx, args) => {
    const booking = await getBookingById(ctx, args.bookingId);

    if (!booking) {
      throw new Error("Booking was not found");
    }

    assertBookingTransition(booking.status, "stored");

    const now = Date.now();

    await ctx.db.patch(booking._id, {
      status: "stored",
      storedAt: now,
      route: args.route,
    });
    await ctx.db.patch(booking.cellRef, {
      status: "occupied",
      lastChangedAt: now,
    });

    const updatedBooking = await ctx.db.get(booking._id);

    if (!updatedBooking) {
      throw new Error("Updated booking was not found");
    }

    return toBookingSummary(updatedBooking);
  },
});

export const startClaim = mutation({
  args: {
    bookingId: v.id("bookings"),
    correlationId: v.string(),
    route: v.string(),
  },
  handler: async (ctx, args) => {
    const booking = await getBookingById(ctx, args.bookingId);

    if (!booking) {
      throw new Error("Booking was not found");
    }

    if (booking.status === "stored") {
      assertBookingTransition(booking.status, "payment_pending");

      await ctx.db.patch(booking._id, {
        status: "payment_pending",
        claimStartedAt: Date.now(),
        route: args.route,
        correlationId: args.correlationId,
      });
    } else if (
      booking.status !== "payment_pending" &&
      booking.status !== "payment_in_progress" &&
      booking.status !== "paid"
    ) {
      throw new Error(
        `Booking ${booking.bookingNumber} cannot be claimed from ${booking.status}`,
      );
    }

    const updatedBooking = await ctx.db.get(booking._id);

    if (!updatedBooking) {
      throw new Error("Booking was not found after claim start");
    }

    return {
      ...toBookingSummary(updatedBooking),
      currentAmountRub: calculateBookingCharge(
        updatedBooking.allocatedSize,
        updatedBooking.storedAt ?? updatedBooking.createdAt,
        Date.now(),
      ),
    };
  },
});

export const completeBooking = mutation({
  args: {
    bookingId: v.id("bookings"),
    route: v.string(),
  },
  handler: async (ctx, args) => {
    const booking = await getBookingById(ctx, args.bookingId);

    if (!booking) {
      throw new Error("Booking was not found");
    }

    assertBookingTransition(booking.status, "completed");

    const now = Date.now();

    await ctx.db.patch(booking._id, {
      status: "completed",
      completedAt: now,
      route: args.route,
    });
    await ctx.db.patch(booking.cellRef, {
      status: "available",
      activeBookingId: undefined,
      lastChangedAt: now,
    });

    await recordTelemetryEvent(ctx, {
      timestamp: now,
      eventType: "booking_completed",
      bookingId: booking._id,
      bookingNumber: booking.bookingNumber,
      cellId: booking.cellId,
      correlationId: booking.correlationId,
      route: args.route,
      requestedSize: booking.requestedSize,
      allocatedSize: booking.allocatedSize,
      bookingStatus: "completed",
    });
    await recordTelemetryEvent(ctx, {
      timestamp: now,
      eventType: "cell_released",
      bookingId: booking._id,
      bookingNumber: booking.bookingNumber,
      cellId: booking.cellId,
      correlationId: booking.correlationId,
      route: args.route,
      requestedSize: booking.requestedSize,
      allocatedSize: booking.allocatedSize,
      bookingStatus: "completed",
    });

    return {
      bookingNumber: booking.bookingNumber,
      cellId: booking.cellId,
    };
  },
});

export const getBooking = query({
  args: {
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    const booking = await getBookingById(ctx, args.bookingId);

    if (!booking) {
      return null;
    }

    return {
      ...toBookingSummary(booking),
      currentAmountRub: calculateBookingCharge(
        booking.allocatedSize,
        booking.storedAt ?? booking.createdAt,
        Date.now(),
      ),
    };
  },
});

export const getBookingByClaimCode = query({
  args: {
    claimCode: v.string(),
  },
  handler: async (ctx, args) => {
    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_claim_code", (query) =>
        query.eq("claimCode", args.claimCode),
      )
      .first();

    return booking ? toBookingSummary(booking) : null;
  },
});

export const listActiveBookings = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const candidateStatuses = [
      "stored",
      "payment_pending",
      "payment_in_progress",
      "paid",
    ] as const;
    const bookings = (
      await Promise.all(
        candidateStatuses.map((status) =>
          ctx.db
            .query("bookings")
            .withIndex("by_status_created_at", (query) =>
              query.eq("status", status),
            )
            .order("desc")
            .take(20),
        ),
      )
    ).flat();

    return bookings
      .sort((left, right) => right.createdAt - left.createdAt)
      .map((booking) => ({
        ...toBookingSummary(booking),
        statusLabel: getBookingStatusLabel(booking.status),
        currentAmountRub: calculateBookingCharge(
          booking.allocatedSize,
          booking.storedAt ?? booking.createdAt,
          now,
        ),
        durationLabel:
          booking.storedAt === undefined
            ? "Waiting for deposit"
            : describeStorageDuration(booking.storedAt, now),
      }));
  },
});
