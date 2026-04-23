import type { Id } from "../../convex/_generated/dataModel";
import { create } from "zustand";

import type {
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/shared/contracts";
import type { LuggageSizeName } from "@/shared/luggage-sizes";
import { createCorrelationId } from "@/lib/session";

export type BookingSession = {
  bookingId: Id<"bookings">;
  bookingNumber: string;
  claimCode: string;
  requestedSize: LuggageSizeName;
  allocatedSize: LuggageSizeName;
  cellId: number;
  status: BookingStatus;
  correlationId: string;
  pricePerDayRub: number;
  createdAt: number;
  reservedAt: number;
  storedAt: number | null;
  claimStartedAt: number | null;
  paymentStartedAt: number | null;
  paymentCompletedAt: number | null;
  completedAt: number | null;
  route: string;
  currentAmountRub?: number;
  isUpsized?: boolean;
};

export type LatestPaymentSession = {
  paymentId: Id<"payments">;
  attempt: number;
  amountRub: number;
  method: PaymentMethod;
  status?: PaymentStatus;
  startedAt?: number;
  finishedAt?: number | null;
};

type StateStore = {
  correlationId: string;
  currentBooking: BookingSession | null;
  latestPayment: LatestPaymentSession | null;
  startNewSession: () => string;
  resetSession: () => void;
  setCurrentBooking: (booking: BookingSession | null) => void;
  setLatestPayment: (payment: LatestPaymentSession | null) => void;
};

export const useStateStore = create<StateStore>((set) => ({
  correlationId: createCorrelationId(),
  currentBooking: null,
  latestPayment: null,
  startNewSession: () => {
    const correlationId = createCorrelationId();
    set({
      correlationId,
      currentBooking: null,
      latestPayment: null,
    });

    return correlationId;
  },
  resetSession: () =>
    set({
      correlationId: createCorrelationId(),
      currentBooking: null,
      latestPayment: null,
    }),
  setCurrentBooking: (booking) => set({ currentBooking: booking }),
  setLatestPayment: (payment) => set({ latestPayment: payment }),
}));
