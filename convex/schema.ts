import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

import {
  bookingStatusValidator,
  cellStatusValidator,
  luggageSizeValidator,
  paymentMethodValidator,
  paymentStatusValidator,
  telemetryEventTypeValidator,
} from "./validators";

export default defineSchema({
  cells: defineTable({
    cellId: v.number(),
    size: luggageSizeValidator,
    status: cellStatusValidator,
    activeBookingId: v.optional(v.id("bookings")),
    lastChangedAt: v.number(),
  })
    .index("by_cell_id", ["cellId"])
    .index("by_status_size_cell_id", ["status", "size", "cellId"])
    .index("by_size_status_cell_id", ["size", "status", "cellId"]),
  bookings: defineTable({
    bookingNumber: v.string(),
    claimCode: v.string(),
    requestedSize: luggageSizeValidator,
    allocatedSize: luggageSizeValidator,
    cellId: v.number(),
    cellRef: v.id("cells"),
    status: bookingStatusValidator,
    correlationId: v.string(),
    route: v.string(),
    pricePerDayRub: v.number(),
    createdAt: v.number(),
    reservedAt: v.number(),
    storedAt: v.optional(v.number()),
    claimStartedAt: v.optional(v.number()),
    paymentStartedAt: v.optional(v.number()),
    paymentCompletedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    cancelledAt: v.optional(v.number()),
  })
    .index("by_booking_number", ["bookingNumber"])
    .index("by_claim_code", ["claimCode"])
    .index("by_status_created_at", ["status", "createdAt"])
    .index("by_cell_id_status", ["cellId", "status"]),
  payments: defineTable({
    bookingId: v.id("bookings"),
    bookingNumber: v.string(),
    method: paymentMethodValidator,
    status: paymentStatusValidator,
    amountRub: v.number(),
    correlationId: v.string(),
    route: v.string(),
    attempt: v.number(),
    startedAt: v.number(),
    finishedAt: v.optional(v.number()),
  })
    .index("by_booking_started_at", ["bookingId", "startedAt"])
    .index("by_status_started_at", ["status", "startedAt"]),
  telemetryEvents: defineTable({
    timestamp: v.number(),
    eventType: telemetryEventTypeValidator,
    bookingId: v.optional(v.id("bookings")),
    bookingNumber: v.optional(v.string()),
    cellId: v.optional(v.number()),
    correlationId: v.string(),
    route: v.string(),
    requestedSize: v.optional(luggageSizeValidator),
    allocatedSize: v.optional(luggageSizeValidator),
    paymentMethod: v.optional(paymentMethodValidator),
    paymentStatus: v.optional(paymentStatusValidator),
    bookingStatus: v.optional(bookingStatusValidator),
    amountRub: v.optional(v.number()),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_event_type_timestamp", ["eventType", "timestamp"]),
});
