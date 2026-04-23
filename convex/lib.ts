import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

export async function getCellByCellId(
  ctx: MutationCtx | QueryCtx,
  cellId: number,
) {
  return ctx.db
    .query("cells")
    .withIndex("by_cell_id", (query) => query.eq("cellId", cellId))
    .first();
}

export async function getBookingById(
  ctx: MutationCtx | QueryCtx,
  bookingId: Id<"bookings">,
) {
  return ctx.db.get(bookingId);
}

export async function getLatestPaymentAttempt(
  ctx: MutationCtx | QueryCtx,
  bookingId: Id<"bookings">,
) {
  return ctx.db
    .query("payments")
    .withIndex("by_booking_started_at", (query) =>
      query.eq("bookingId", bookingId),
    )
    .order("desc")
    .first();
}

export function toBookingSummary(booking: Doc<"bookings">) {
  return {
    bookingId: booking._id,
    bookingNumber: booking.bookingNumber,
    claimCode: booking.claimCode,
    requestedSize: booking.requestedSize,
    allocatedSize: booking.allocatedSize,
    cellId: booking.cellId,
    status: booking.status,
    correlationId: booking.correlationId,
    pricePerDayRub: booking.pricePerDayRub,
    createdAt: booking.createdAt,
    reservedAt: booking.reservedAt,
    storedAt: booking.storedAt ?? null,
    claimStartedAt: booking.claimStartedAt ?? null,
    paymentStartedAt: booking.paymentStartedAt ?? null,
    paymentCompletedAt: booking.paymentCompletedAt ?? null,
    completedAt: booking.completedAt ?? null,
    route: booking.route,
  };
}
