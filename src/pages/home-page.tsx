import { motion } from "framer-motion";

import { Button } from "@/components/button";
import { Or } from "@/components/or";
import { PageLayout } from "@/components/page-layout";
import { useNavigationStore } from "@/store/navigation-store";

export default function HomePage() {
  const navigateTo = useNavigationStore((state) => state.navigateTo);

  return (
    <PageLayout
      headerButton={
        <Button onClick={() => navigateTo("support")}>Support</Button>
      }
    >
      <div className="flex flex-col items-center gap-8">
        <motion.div
          key="homepage-insert-card"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
          className="text-4xl font-bold"
        >
          Insert the luggage claim card
        </motion.div>
        <motion.div
          key="homepage-or"
          className="w-full"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{
            type: "spring",
            duration: 0.3,
            bounce: 0.2,
            delay: 0.1,
          }}
        >
          <Or />
        </motion.div>
        <motion.div
          key="homepage-check-luggage"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          transition={{
            type: "spring",
            duration: 0.3,
            bounce: 0.2,
            delay: 0.2,
          }}
        >
          <Button onClick={() => navigateTo("check-luggage")}>
            Check luggage
          </Button>
        </motion.div>
      </div>
    </PageLayout>
  );
}
