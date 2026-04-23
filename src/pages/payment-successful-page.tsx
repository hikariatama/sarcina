import { useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { PageLayout } from "@/components/page-layout";
import { Schema } from "@/components/schema";
import { useNavigationStore } from "@/store/navigation-store";
import { useStateStore } from "@/store/state-store";
import { api } from "../../convex/_generated/api";

export default function PaymentSuccessfulPage() {
  const navigateTo = useNavigationStore((state) => state.navigateTo);
  const currentBooking = useStateStore((state) => state.currentBooking);
  const setCurrentBooking = useStateStore((state) => state.setCurrentBooking);
  const completeBooking = useMutation(api.bookings.completeBooking);
  const booking = useQuery(
    api.bookings.getBooking,
    currentBooking ? { bookingId: currentBooking.bookingId } : "skip",
  );

  useEffect(() => {
    if (booking) {
      setCurrentBooking(booking);
    }
  }, [booking, setCurrentBooking]);

  if (!currentBooking) {
    navigateTo("home", { replace: true });
    return null;
  }

  return (
    <PageLayout
      headerButton={
        <Button onClick={() => navigateTo("support")}>Support</Button>
      }
    >
      <motion.div
        className="flex-1"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -30, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
      >
        <Card className="w-full items-center justify-center gap-0 text-3xl font-black">
          <div>
            <span className="text-brand">Cell {currentBooking.cellId}</span> has
            been opened
          </div>
          <div>Please, take your luggage</div>
          <div>Then close the door</div>
        </Card>
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
        onClick={() => {
          void completeBooking({
            bookingId: currentBooking.bookingId,
            route: "retrieval-complete",
          }).then(() => {
            navigateTo("final");
          });
        }}
      >
        <Schema highlightCell={currentBooking.cellId} />
      </motion.div>
    </PageLayout>
  );
}
