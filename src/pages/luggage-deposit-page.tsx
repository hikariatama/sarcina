import { IconLoader2 } from "@tabler/icons-react";
import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { PageLayout } from "@/components/page-layout";
import { Schema } from "@/components/schema";
import { LUGGAGE_SIZES } from "@/shared/luggage-sizes";
import { useNavigationStore } from "@/store/navigation-store";
import { type BookingSession, useStateStore } from "@/store/state-store";
import { api } from "../../convex/_generated/api";

function toSessionBooking(booking: BookingSession | null) {
  if (!booking) {
    return null;
  }

  return booking;
}

export default function LuggageDepositPage() {
  const navigateTo = useNavigationStore((state) => state.navigateTo);
  const selectedSize = useNavigationStore((state) => state.selectedSize);
  const sizeInfo = LUGGAGE_SIZES.find((size) => size.name === selectedSize);
  const correlationId = useStateStore((state) => state.correlationId);
  const currentBooking = useStateStore((state) => state.currentBooking);
  const setCurrentBooking = useStateStore((state) => state.setCurrentBooking);
  const startBooking = useMutation(api.bookings.startBooking);
  const confirmDeposit = useMutation(api.bookings.confirmDeposit);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedSize === null) {
      navigateTo("check-luggage", { replace: true });
      return;
    }

    if (currentBooking || loading) {
      return;
    }

    setLoading(true);

    void startBooking({
      requestedSize: selectedSize,
      correlationId,
      route: "deposit-selection",
    })
      .then((booking) => {
        if (booking === null) {
          setCurrentBooking(null);
          navigateTo("no-free-cells", { replace: true });
          return;
        }

        setCurrentBooking(toSessionBooking(booking));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    correlationId,
    currentBooking,
    loading,
    navigateTo,
    selectedSize,
    setCurrentBooking,
    startBooking,
  ]);

  if (selectedSize === null || !sizeInfo) {
    return null;
  }

  return (
    <PageLayout
      headerButton={
        <Button onClick={() => navigateTo("support")}>Support</Button>
      }
    >
      <div className="flex flex-col gap-8">
        <div className="flex gap-8">
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -30, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
          >
            <Card className="items-start gap-0 px-5 py-4">
              <div className="text-3xl font-black">{sizeInfo.name}</div>
              <div className="text-2xl font-black text-black/50">
                {sizeInfo.dimensions}
              </div>
              <div className="text-2xl font-black">{sizeInfo.price}₽ / day</div>
            </Card>
          </motion.div>
          <motion.div
            className="flex-1"
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 30, opacity: 0 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
          >
            <Card className="h-full items-center justify-center gap-0 px-6 py-4 text-3xl font-black">
              {!currentBooking || loading ? (
                <div className="flex items-center gap-3">
                  <IconLoader2 className="size-8 animate-spin" />
                  Looking for a free cell...
                </div>
              ) : (
                <>
                  <div>
                    Deposit the luggage in{" "}
                    <span className="text-brand">
                      cell {currentBooking.cellId}
                    </span>
                  </div>
                  <div>Then close the door</div>
                </>
              )}
            </Card>
          </motion.div>
        </div>
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
          onClick={() => {
            if (!currentBooking || loading) {
              return;
            }

            setLoading(true);
            void confirmDeposit({
              bookingId: currentBooking.bookingId,
              route: "deposit-confirmed",
            })
              .then((booking) => {
                setCurrentBooking(toSessionBooking(booking));
                navigateTo("luggage-deposited");
              })
              .finally(() => {
                setLoading(false);
              });
          }}
        >
          <Schema highlightCell={currentBooking?.cellId} />
        </motion.div>
      </div>
    </PageLayout>
  );
}
