import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { QrcodeCanvas } from "react-qrcode-pretty";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { FPSIcon } from "@/components/icons/fps-icon";
import { PageLayout } from "@/components/page-layout";
import { useNavigationStore } from "@/store/navigation-store";
import { useStateStore } from "@/store/state-store";
import { api } from "../../convex/_generated/api";

export default function PayByFPSPage() {
  const navigateTo = useNavigationStore((state) => state.navigateTo);
  const currentBooking = useStateStore((state) => state.currentBooking);
  const latestPayment = useStateStore((state) => state.latestPayment);
  const setLatestPayment = useStateStore((state) => state.setLatestPayment);
  const correlationId = useStateStore((state) => state.correlationId);
  const startPayment = useMutation(api.payments.startPayment);
  const completePayment = useMutation(api.payments.completePayment);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!currentBooking || startedRef.current) {
      return;
    }

    startedRef.current = true;

    void startPayment({
      bookingId: currentBooking.bookingId,
      method: "fps",
      correlationId,
      route: "payment-fps",
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
          className="text-4xl font-black"
        >
          Scan the QR code with your phone
        </motion.div>
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
          <Card
            className="relative h-full p-4"
            onClick={() => {
              void completePayment({
                bookingId: currentBooking.bookingId,
                route: "payment-fps-success",
              }).then(() => {
                navigateTo("payment-successful");
              });
            }}
          >
            <QrcodeCanvas
              value={`https://qr.nspk.ru/FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF?type=00&bank=000000000000&sum=${amountRub}&cur=RUB&crc=0000`}
              size={512}
              bgColor="#00000000"
              internalProps={{
                style: { width: "256px", height: "256px" },
              }}
              variant={{ eyes: "circle", body: "fluid" }}
            />
            <div className="absolute inset-0 z-50 m-auto flex size-fit items-center justify-center rounded-lg bg-white p-2">
              <FPSIcon className="size-12" />
            </div>
          </Card>
        </motion.div>
      </div>
    </PageLayout>
  );
}
