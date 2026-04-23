import { describe, expect, test } from "bun:test";

import {
  assertBookingTransition,
  calculateBillableStorageDays,
  calculateBookingCharge,
} from "@/shared/booking-rules";

describe("pricing and transitions", () => {
  test("charges at least one day", () => {
    const startedAt = Date.UTC(2026, 0, 1, 10, 0, 0);
    const finishedAt = Date.UTC(2026, 0, 1, 14, 0, 0);

    expect(calculateBillableStorageDays(startedAt, finishedAt)).toBe(1);
    expect(calculateBookingCharge("M", startedAt, finishedAt)).toBe(1000);
  });

  test("rounds partial days up", () => {
    const startedAt = Date.UTC(2026, 0, 1, 10, 0, 0);
    const finishedAt = Date.UTC(2026, 0, 3, 9, 0, 0);

    expect(calculateBillableStorageDays(startedAt, finishedAt)).toBe(2);
    expect(calculateBookingCharge("XL", startedAt, finishedAt)).toBe(4000);
  });

  test("allows the happy-path status chain", () => {
    expect(() => assertBookingTransition("reserved", "stored")).not.toThrow();
    expect(() =>
      assertBookingTransition("stored", "payment_pending"),
    ).not.toThrow();
    expect(() =>
      assertBookingTransition("payment_pending", "payment_in_progress"),
    ).not.toThrow();
    expect(() =>
      assertBookingTransition("payment_in_progress", "paid"),
    ).not.toThrow();
    expect(() => assertBookingTransition("paid", "completed")).not.toThrow();
  });

  test("blocks invalid transitions", () => {
    expect(() => assertBookingTransition("reserved", "paid")).toThrow();
    expect(() => assertBookingTransition("completed", "stored")).toThrow();
  });
});
