import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { PageLayout } from "@/components/page-layout";
import { useNavigationStore } from "@/store/navigation-store";
import { useStateStore } from "@/store/state-store";

export default function PaymentCancelledPage() {
  const navigateTo = useNavigationStore((state) => state.navigateTo);
  const resetSession = useStateStore((state) => state.resetSession);
  const [timer, setTimer] = useState(10);

  useEffect(() => {
    if (timer === 0) {
      resetSession();
      navigateTo("home", { replace: true });
      return;
    }

    const intervalId = setInterval(() => {
      setTimer((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [navigateTo, resetSession, timer]);

  return (
    <PageLayout
      headerButton={
        <Button onClick={() => navigateTo("home")}>Back to menu</Button>
      }
    >
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -30, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
      >
        <Card className="text-center text-3xl font-black">
          <div className="text-brand">Payment is cancelled!</div>
          <div>Take the luggage claim card</div>
        </Card>
      </motion.div>
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -30, opacity: 0 }}
        transition={{ type: "spring", duration: 0.3, bounce: 0.2, delay: 0.1 }}
        className="text-center text-2xl font-bold text-black/50"
      >
        Returning to main menu in {timer} seconds...
      </motion.div>
    </PageLayout>
  );
}
