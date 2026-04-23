import { IconArrowDown } from "@tabler/icons-react";
import { useMutation } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { PageLayout } from "@/components/page-layout";
import { TotallyGenericPOSTerminalNotBelongingToAnyParticularBank } from "@/components/pos-terminal";
import { LUGGAGE_SIZES } from "@/shared/luggage-sizes";
import { useNavigationStore } from "@/store/navigation-store";
import { useStateStore } from "@/store/state-store";
import { api } from "../../convex/_generated/api";

export default function PayByCardPage() {
  const navigateTo = useNavigationStore((state) => state.navigateTo);
  const currentBooking = useStateStore((state) => state.currentBooking);
  const setLatestPayment = useStateStore((state) => state.setLatestPayment);
  const latestPayment = useStateStore((state) => state.latestPayment);
  const correlationId = useStateStore((state) => state.correlationId);
  const startPayment = useMutation(api.payments.startPayment);
  const completePayment = useMutation(api.payments.completePayment);
  const startedRef = useRef(false);
  const [showPOS, setShowPOS] = useState(false);

  useEffect(() => {
    if (!currentBooking || startedRef.current) {
      return;
    }

    startedRef.current = true;

    void startPayment({
      bookingId: currentBooking.bookingId,
      method: "card",
      correlationId,
      route: "payment-card",
    }).then((payment) => {
      setLatestPayment({
        paymentId: payment.paymentId,
        attempt: payment.attempt,
        amountRub: payment.amountRub,
        method: payment.method,
        status: "started",
      });
    });
  }, [correlationId, currentBooking, setLatestPayment, startPayment]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPOS(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
    latestPayment?.amountRub ?? currentBooking.currentAmountRub ?? 0;

  return (
    <PageLayout
      headerButton={<Button onClick={() => navigateTo("payment")}>Back</Button>}
    >
      <div className="flex flex-col items-center gap-8">
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
        >
          <Card className="h-full items-start gap-0 px-5 py-4 text-3xl font-black">
            <div>{amountRub}₽</div>
            <div className="text-black/50">
              Payment by card for{" "}
              {sizeInfo?.name ?? currentBooking.allocatedSize}
            </div>
          </Card>
        </motion.div>
        <div className="flex flex-col items-center gap-4 text-4xl font-black">
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{
              type: "spring",
              duration: 0.3,
              bounce: 0.2,
              delay: 0.1,
            }}
          >
            Follow instructions on the POS Terminal
          </motion.div>
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -30, opacity: 0 }}
            transition={{
              type: "spring",
              duration: 0.3,
              bounce: 0.2,
              delay: 0.2,
            }}
          >
            <IconArrowDown className="text-brand size-16" />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {showPOS && (
          <TotallyGenericPOSTerminalNotBelongingToAnyParticularBank
            amount={amountRub}
            onPayment={() => {
              setShowPOS(false);
              void completePayment({
                bookingId: currentBooking.bookingId,
                route: "payment-card-success",
              }).then(() => {
                setTimeout(() => {
                  navigateTo("payment-successful");
                }, 750);
              });
            }}
          />
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
