import type { LuggageSizeName } from "@/shared/luggage-sizes";

export type BookingStatus =
  | "reserved"
  | "stored"
  | "payment_pending"
  | "payment_in_progress"
  | "paid"
  | "completed"
  | "cancelled";

export type PaymentMethod = "card" | "fps";

export type PaymentStatus = "started" | "cancelled" | "succeeded";

export type CellStatus = "available" | "reserved" | "occupied";

export type TelemetryEventType =
  | "booking_created"
  | "cell_reserved"
  | "payment_started"
  | "payment_succeeded"
  | "payment_cancelled"
  | "no_cells_available"
  | "booking_completed"
  | "cell_released";

export type DashboardMetrics = {
  totalBookingAttempts: number;
  successfulBookings: number;
  paymentSuccessRate: number;
  paymentCancellationRate: number;
  noFreeCellsCount: number;
  activeBookingsCount: number;
  averageMinutesToPaymentSuccess: number | null;
};

export type OccupancyBySize = {
  size: LuggageSizeName;
  occupied: number;
  reserved: number;
  available: number;
  total: number;
};

export type TelemetryEventView = {
  id: string;
  timestamp: number;
  eventType: TelemetryEventType;
  bookingNumber: string | null;
  cellId: number | null;
  correlationId: string;
  route: string;
};
