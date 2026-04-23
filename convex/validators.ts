import { v } from "convex/values";

export const luggageSizeValidator = v.union(
  v.literal("S"),
  v.literal("M"),
  v.literal("L"),
  v.literal("XL"),
  v.literal("OVS"),
);

export const bookingStatusValidator = v.union(
  v.literal("reserved"),
  v.literal("stored"),
  v.literal("payment_pending"),
  v.literal("payment_in_progress"),
  v.literal("paid"),
  v.literal("completed"),
  v.literal("cancelled"),
);

export const paymentMethodValidator = v.union(
  v.literal("card"),
  v.literal("fps"),
);

export const paymentStatusValidator = v.union(
  v.literal("started"),
  v.literal("cancelled"),
  v.literal("succeeded"),
);

export const cellStatusValidator = v.union(
  v.literal("available"),
  v.literal("reserved"),
  v.literal("occupied"),
);

export const telemetryEventTypeValidator = v.union(
  v.literal("booking_created"),
  v.literal("cell_reserved"),
  v.literal("payment_started"),
  v.literal("payment_succeeded"),
  v.literal("payment_cancelled"),
  v.literal("no_cells_available"),
  v.literal("booking_completed"),
  v.literal("cell_released"),
);
