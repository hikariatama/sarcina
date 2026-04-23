import {
  LUGGAGE_SIZES,
  type CellSelectionInput,
  type LuggageSizeName,
  selectSmallestFittingCell,
} from "../src/shared/luggage-sizes";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";
import { recordTelemetryEvent } from "./telemetry";

export const ensureSeedData = mutation({
  args: {},
  handler: async (ctx) => {
    const existingCell = await ctx.db.query("cells").first();

    if (existingCell !== null) {
      return { seeded: false };
    }

    const now = Date.now();

    for (const size of LUGGAGE_SIZES) {
      for (const cellId of size.ids) {
        await ctx.db.insert("cells", {
          cellId,
          size: size.name,
          status: "available",
          lastChangedAt: now,
        });
      }
    }

    return { seeded: true };
  },
});

export const getTerminalOverview = query({
  args: {},
  handler: async (ctx) => {
    const cells = await ctx.db.query("cells").collect();
    const activeBookings = await ctx.db
      .query("bookings")
      .withIndex("by_status_created_at", (query) =>
        query.eq("status", "stored"),
      )
      .order("desc")
      .take(5);

    return {
      totalCells: cells.length,
      availableCells: cells.filter((cell) => cell.status === "available")
        .length,
      occupiedCells: cells.filter((cell) => cell.status === "occupied").length,
      reservedCells: cells.filter((cell) => cell.status === "reserved").length,
      latestStoredBookings: activeBookings.map((booking) => ({
        bookingId: booking._id,
        bookingNumber: booking.bookingNumber,
        claimCode: booking.claimCode,
        cellId: booking.cellId,
        requestedSize: booking.requestedSize,
        allocatedSize: booking.allocatedSize,
        status: booking.status,
        createdAt: booking.createdAt,
        storedAt: booking.storedAt ?? null,
      })),
    };
  },
});

export const getClaimableBookingHint = query({
  args: {},
  handler: async (ctx) => {
    const booking = await ctx.db
      .query("bookings")
      .withIndex("by_status_created_at", (query) =>
        query.eq("status", "stored"),
      )
      .order("asc")
      .first();

    if (!booking) {
      return null;
    }

    return {
      bookingId: booking._id,
      bookingNumber: booking.bookingNumber,
      claimCode: booking.claimCode,
      cellId: booking.cellId,
    };
  },
});

export const getCellStatuses = query({
  args: {},
  handler: async (ctx) => {
    const cells = await ctx.db
      .query("cells")
      .withIndex("by_cell_id")
      .order("asc")
      .collect();

    return cells.map((cell) => ({
      cellId: cell.cellId,
      size: cell.size,
      status: cell.status,
    }));
  },
});

export const resetDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    const cells = await ctx.db.query("cells").collect();
    const bookings = await ctx.db.query("bookings").collect();
    const payments = await ctx.db.query("payments").collect();
    const telemetryEvents = await ctx.db.query("telemetryEvents").collect();
    const now = Date.now();

    for (const payment of payments) {
      await ctx.db.delete(payment._id);
    }

    for (const event of telemetryEvents) {
      await ctx.db.delete(event._id);
    }

    for (const booking of bookings) {
      await ctx.db.delete(booking._id);
    }

    for (const cell of cells) {
      await ctx.db.patch(cell._id, {
        status: "available",
        activeBookingId: undefined,
        lastChangedAt: now,
      });
    }

    return { reset: true };
  },
});

export async function findBestAvailableCell(
  ctx: MutationCtx | QueryCtx,
  requestedSize: LuggageSizeName,
) {
  const cells = await ctx.db.query("cells").collect();

  return selectSmallestFittingCell(
    cells.map(
      (cell): CellSelectionInput => ({
        cellId: cell.cellId,
        size: cell.size,
        status: cell.status,
      }),
    ),
    requestedSize,
  );
}

export async function markNoCellsAvailable(
  ctx: MutationCtx,
  args: {
    correlationId: string;
    route: string;
    requestedSize: LuggageSizeName;
  },
) {
  await recordTelemetryEvent(ctx, {
    timestamp: Date.now(),
    eventType: "no_cells_available",
    correlationId: args.correlationId,
    route: args.route,
    requestedSize: args.requestedSize,
  });
}
