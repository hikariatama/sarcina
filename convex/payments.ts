import { v } from "convex/values";

import {
  assertBookingTransition,
  calculateBookingCharge,
} from "@/shared/booking-rules";
import { mutation, query } from "./_generated/server";
import { getBookingById, getLatestPaymentAttempt } from "./lib";
import { recordTelemetryEvent } from "./telemetry";
import { paymentMethodValidator } from "./validators";

export const startPayment = mutation({
  args: {
    bookingId: v.id("bookings"),
    method: paymentMethodValidator,
    correlationId: v.string(),
    route: v.string(),
  },
  handler: async (ctx, args) => {
    const booking = await getBookingById(ctx, args.bookingId);

    if (!booking) {
      throw new Error("Booking was not found");
    }

    if (booking.status === "payment_pending") {
      assertBookingTransition(booking.status, "payment_in_progress");
    } else if (booking.status !== "payment_in_progress") {
      throw new Error(
        `Booking ${booking.bookingNumber} cannot start payment from ${booking.status}`,
      );
    }

    const now = Date.now();
    const latestPaymentAttempt = await getLatestPaymentAttempt(
      ctx,
      booking._id,
    );
    const amountRub = calculateBookingCharge(
      booking.allocatedSize,
      booking.storedAt ?? booking.createdAt,
      now,
    );

    if (
      latestPaymentAttempt?.status === "started" &&
      latestPaymentAttempt.method === args.method
    ) {
      return {
        paymentId: latestPaymentAttempt._id,
        attempt: latestPaymentAttempt.attempt,
        amountRub: latestPaymentAttempt.amountRub,
        method: latestPaymentAttempt.method,
      };
    }

    const paymentId = await ctx.db.insert("payments", {
      bookingId: booking._id,
      bookingNumber: booking.bookingNumber,
      method: args.method,
      status: "started",
      amountRub,
      correlationId: args.correlationId,
      route: args.route,
      attempt: (latestPaymentAttempt?.attempt ?? 0) + 1,
      startedAt: now,
    });

    await ctx.db.patch(booking._id, {
      status: "payment_in_progress",
      paymentStartedAt: now,
      route: args.route,
      correlationId: args.correlationId,
    });

    await recordTelemetryEvent(ctx, {
      timestamp: now,
      eventType: "payment_started",
      bookingId: booking._id,
      bookingNumber: booking.bookingNumber,
      cellId: booking.cellId,
      correlationId: args.correlationId,
      route: args.route,
      requestedSize: booking.requestedSize,
      allocatedSize: booking.allocatedSize,
      bookingStatus: "payment_in_progress",
      paymentMethod: args.method,
      paymentStatus: "started",
      amountRub,
    });

    return {
      paymentId,
      attempt: (latestPaymentAttempt?.attempt ?? 0) + 1,
      amountRub,
      method: args.method,
    };
  },
});

export const cancelPayment = mutation({
  args: {
    bookingId: v.id("bookings"),
    route: v.string(),
  },
  handler: async (ctx, args) => {
    const booking = await getBookingById(ctx, args.bookingId);

    if (!booking) {
      throw new Error("Booking was not found");
    }

    const latestPaymentAttempt = await getLatestPaymentAttempt(
      ctx,
      booking._id,
    );

    if (latestPaymentAttempt?.status !== "started") {
      throw new Error("No running payment attempt was found");
    }

    const now = Date.now();

    await ctx.db.patch(latestPaymentAttempt._id, {
      status: "cancelled",
      finishedAt: now,
      route: args.route,
    });
    await ctx.db.patch(booking._id, {
      status: "payment_pending",
      route: args.route,
    });

    await recordTelemetryEvent(ctx, {
      timestamp: now,
      eventType: "payment_cancelled",
      bookingId: booking._id,
      bookingNumber: booking.bookingNumber,
      cellId: booking.cellId,
      correlationId: latestPaymentAttempt.correlationId,
      route: args.route,
      requestedSize: booking.requestedSize,
      allocatedSize: booking.allocatedSize,
      bookingStatus: "payment_pending",
      paymentMethod: latestPaymentAttempt.method,
      paymentStatus: "cancelled",
      amountRub: latestPaymentAttempt.amountRub,
    });

    return {
      bookingId: booking._id,
      paymentId: latestPaymentAttempt._id,
    };
  },
});

export const completePayment = mutation({
  args: {
    bookingId: v.id("bookings"),
    route: v.string(),
  },
  handler: async (ctx, args) => {
    const booking = await getBookingById(ctx, args.bookingId);

    if (!booking) {
      throw new Error("Booking was not found");
    }

    const latestPaymentAttempt = await getLatestPaymentAttempt(
      ctx,
      booking._id,
    );

    if (latestPaymentAttempt?.status !== "started") {
      throw new Error("No running payment attempt was found");
    }

    if (booking.status === "payment_in_progress") {
      assertBookingTransition(booking.status, "paid");
    } else {
      throw new Error(
        `Booking ${booking.bookingNumber} cannot finish payment from ${booking.status}`,
      );
    }

    const now = Date.now();

    await ctx.db.patch(latestPaymentAttempt._id, {
      status: "succeeded",
      finishedAt: now,
      route: args.route,
    });
    await ctx.db.patch(booking._id, {
      status: "paid",
      paymentCompletedAt: now,
      route: args.route,
    });

    await recordTelemetryEvent(ctx, {
      timestamp: now,
      eventType: "payment_succeeded",
      bookingId: booking._id,
      bookingNumber: booking.bookingNumber,
      cellId: booking.cellId,
      correlationId: latestPaymentAttempt.correlationId,
      route: args.route,
      requestedSize: booking.requestedSize,
      allocatedSize: booking.allocatedSize,
      bookingStatus: "paid",
      paymentMethod: latestPaymentAttempt.method,
      paymentStatus: "succeeded",
      amountRub: latestPaymentAttempt.amountRub,
    });

    return {
      bookingId: booking._id,
      paymentId: latestPaymentAttempt._id,
      cellId: booking.cellId,
      bookingNumber: booking.bookingNumber,
    };
  },
});

export const getLatestPayment = query({
  args: {
    bookingId: v.id("bookings"),
  },
  handler: async (ctx, args) => {
    const payment = await getLatestPaymentAttempt(ctx, args.bookingId);

    if (!payment) {
      return null;
    }

    return {
      paymentId: payment._id,
      attempt: payment.attempt,
      amountRub: payment.amountRub,
      method: payment.method,
      status: payment.status,
      startedAt: payment.startedAt,
      finishedAt: payment.finishedAt ?? null,
    };
  },
});
