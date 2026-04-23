import { describe, expect, test } from "bun:test";

import { calculateDashboardMetrics } from "@/shared/observability";

describe("observability metrics", () => {
  test("aggregates booking and payment outcomes", () => {
    const metrics = calculateDashboardMetrics({
      bookings: [
        {
          createdAt: Date.UTC(2026, 0, 1, 10, 0, 0),
          status: "completed",
          paymentCompletedAt: Date.UTC(2026, 0, 1, 10, 25, 0),
        },
        {
          createdAt: Date.UTC(2026, 0, 1, 11, 0, 0),
          status: "payment_pending",
          paymentCompletedAt: null,
        },
      ],
      payments: [{ status: "succeeded" }, { status: "cancelled" }],
      noFreeCellsCount: 3,
    });

    expect(metrics.totalBookingAttempts).toBe(2);
    expect(metrics.successfulBookings).toBe(1);
    expect(metrics.paymentSuccessRate).toBe(50);
    expect(metrics.paymentCancellationRate).toBe(50);
    expect(metrics.activeBookingsCount).toBe(1);
    expect(metrics.averageMinutesToPaymentSuccess).toBe(25);
    expect(metrics.noFreeCellsCount).toBe(3);
  });
});
