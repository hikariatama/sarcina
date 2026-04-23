import { useEffect, useMemo } from "react";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { CardIcon } from "@/components/icons/card-icon";
import { FPSIcon } from "@/components/icons/fps-icon";
import { PageLayout } from "@/components/page-layout";
import { LUGGAGE_SIZES } from "@/shared/luggage-sizes";
import { useNavigationStore } from "@/store/navigation-store";
import { useStateStore } from "@/store/state-store";
import { api } from "../../convex/_generated/api";

export default function PaymentPage() {
  const navigateTo = useNavigationStore((state) => state.navigateTo);
  const currentBooking = useStateStore((state) => state.currentBooking);
  const setCurrentBooking = useStateStore((state) => state.setCurrentBooking);
  const setLatestPayment = useStateStore((state) => state.setLatestPayment);
  const booking = useQuery(
    api.bookings.getBooking,
    currentBooking ? { bookingId: currentBooking.bookingId } : "skip",
  );

  useEffect(() => {
    if (booking) {
      setCurrentBooking(booking);
    }
  }, [booking, setCurrentBooking]);

  const sizeInfo = useMemo(() => {
    if (!currentBooking) {
      return null;
    }

    return (
      LUGGAGE_SIZES.find(
        (size) => size.name === currentBooking.allocatedSize,
      ) ?? null
    );
  }, [currentBooking]);

  if (!currentBooking) {
    navigateTo("home", { replace: true });
    return null;
  }

  const amountRub =
    booking?.currentAmountRub ?? currentBooking.currentAmountRub ?? 0;

  const daysStored = booking?.storedAt
    ? Math.ceil(
        (Date.now() - new Date(booking.storedAt).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : -1;

  return (
    <PageLayout
      headerButton={
        <Button
          onClick={() => {
            setLatestPayment(null);
            navigateTo("payment-cancelled");
          }}
        >
          Cancel
        </Button>
      }
    >
      <div className="flex flex-col items-center gap-8">
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
          className="text-4xl font-bold"
        >
          Choose the payment method
        </motion.div>
        <div className="flex gap-8">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -30, opacity: 0 }}
            transition={{
              type: "spring",
              duration: 0.3,
              bounce: 0.2,
              delay: 0.1,
            }}
          >
            <Card className="h-full items-start gap-0 px-5 py-4 text-2xl font-black">
              <div className="text-3xl">
                {sizeInfo?.name ?? currentBooking.allocatedSize}
              </div>
              <div className="text-black/50">
                {sizeInfo?.dimensions ?? `Cell ${currentBooking.cellId}`}
              </div>
              <div>{amountRub}₽</div>
              <div className="text-black/50">
                Stored for{" "}
                {daysStored !== -1
                  ? `${daysStored} day${daysStored > 1 ? "1" : ""}`
                  : "…"}
              </div>
            </Card>
          </motion.div>
          <div className="flex flex-col gap-8">
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 30, opacity: 0 }}
              transition={{
                type: "spring",
                duration: 0.3,
                bounce: 0.2,
                delay: 0.2,
              }}
              className="w-full"
            >
              <Button
                onClick={() => {
                  setLatestPayment(null);
                  navigateTo("pay-by-card");
                }}
                className="w-full text-3xl"
              >
                <div className="flex items-center gap-4 py-2">
                  <CardIcon className="text-brand size-8" />
                  By card
                </div>
              </Button>
            </motion.div>
            <motion.div
              initial={{ x: 30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 30, opacity: 0 }}
              transition={{
                type: "spring",
                duration: 0.3,
                bounce: 0.2,
                delay: 0.2,
              }}
              className="w-full"
            >
              <Button
                onClick={() => {
                  setLatestPayment(null);
                  navigateTo("pay-by-fps");
                }}
                className="w-full justify-between text-3xl"
              >
                <div className="flex items-center gap-4 py-2">
                  <FPSIcon className="size-8" />
                  FPS
                </div>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
