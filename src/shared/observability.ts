import type { DashboardMetrics, PaymentStatus } from "@/shared/contracts";

type BookingMetricsInput = {
  createdAt: number;
  status: string;
  paymentCompletedAt?: number | null;
};

type PaymentMetricsInput = {
  status: PaymentStatus;
};

export function calculateDashboardMetrics(input: {
  bookings: readonly BookingMetricsInput[];
  payments: readonly PaymentMetricsInput[];
  noFreeCellsCount: number;
}): DashboardMetrics {
  const totalBookingAttempts = input.bookings.length;
  const successfulBookings = input.bookings.filter(
    (booking) => booking.status === "completed" || booking.status === "paid",
  ).length;
  const cancelledPayments = input.payments.filter(
    (payment) => payment.status === "cancelled",
  ).length;
  const succeededPayments = input.payments.filter(
    (payment) => payment.status === "succeeded",
  ).length;
  const paymentAttempts = cancelledPayments + succeededPayments;
  const activeBookingsCount = input.bookings.filter((booking) =>
    ["stored", "payment_pending", "payment_in_progress", "paid"].includes(
      booking.status,
    ),
  ).length;
  const paymentLeadTimes = input.bookings
    .filter(
      (booking) =>
        booking.paymentCompletedAt !== undefined &&
        booking.paymentCompletedAt !== null,
    )
    .map((booking) => booking.paymentCompletedAt! - booking.createdAt);
  const averageMinutesToPaymentSuccess =
    paymentLeadTimes.length === 0
      ? null
      : Math.round(
          paymentLeadTimes.reduce((sum, value) => sum + value, 0) /
            paymentLeadTimes.length /
            60000,
        );

  return {
    totalBookingAttempts,
    successfulBookings,
    paymentSuccessRate:
      paymentAttempts === 0
        ? 0
        : Math.round((succeededPayments / paymentAttempts) * 1000) / 10,
    paymentCancellationRate:
      paymentAttempts === 0
        ? 0
        : Math.round((cancelledPayments / paymentAttempts) * 1000) / 10,
    noFreeCellsCount: input.noFreeCellsCount,
    activeBookingsCount,
    averageMinutesToPaymentSuccess,
  };
}
