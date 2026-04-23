import type {
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/shared/contracts";
import {
  getBillableRate,
  type LuggageSizeName,
  formatStorageWindow,
} from "@/shared/luggage-sizes";

const allowedTransitions: Record<BookingStatus, readonly BookingStatus[]> = {
  reserved: ["stored", "cancelled"],
  stored: ["payment_pending", "cancelled"],
  payment_pending: ["payment_in_progress", "cancelled"],
  payment_in_progress: ["payment_pending", "paid", "cancelled"],
  paid: ["completed"],
  completed: [],
  cancelled: [],
};

export function canTransitionBooking(
  currentStatus: BookingStatus,
  nextStatus: BookingStatus,
) {
  return allowedTransitions[currentStatus].includes(nextStatus);
}

export function assertBookingTransition(
  currentStatus: BookingStatus,
  nextStatus: BookingStatus,
) {
  if (!canTransitionBooking(currentStatus, nextStatus)) {
    throw new Error(
      `Booking transition is not allowed: ${currentStatus} -> ${nextStatus}`,
    );
  }
}

export function calculateBillableStorageDays(
  startedAt: number,
  finishedAt: number,
) {
  const durationMs = Math.max(finishedAt - startedAt, 0);
  const days = Math.ceil(durationMs / (1000 * 60 * 60 * 24));

  return Math.max(1, days);
}

export function calculateBookingCharge(
  size: LuggageSizeName,
  startedAt: number,
  finishedAt: number,
) {
  return (
    getBillableRate(size) * calculateBillableStorageDays(startedAt, finishedAt)
  );
}

export function getPaymentLabel(method: PaymentMethod) {
  return method === "card" ? "Card" : "FPS";
}

export function getPaymentStatusLabel(status: PaymentStatus) {
  if (status === "started") {
    return "In progress";
  }

  if (status === "cancelled") {
    return "Cancelled";
  }

  return "Succeeded";
}

export function getBookingStatusLabel(status: BookingStatus) {
  switch (status) {
    case "reserved":
      return "Reserved";
    case "stored":
      return "Stored";
    case "payment_pending":
      return "Awaiting payment";
    case "payment_in_progress":
      return "Paying";
    case "paid":
      return "Paid";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
  }
}

export function describeStorageDuration(startedAt: number, now: number) {
  return formatStorageWindow(Math.max(now - startedAt, 0));
}
