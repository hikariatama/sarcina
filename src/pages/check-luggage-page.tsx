import { IconHandClick } from "@tabler/icons-react";
import { motion } from "framer-motion";

import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { PageLayout } from "@/components/page-layout";
import { LUGGAGE_SIZES } from "@/shared/luggage-sizes";
import { useNavigationStore } from "@/store/navigation-store";
import { useStateStore } from "@/store/state-store";

export default function CheckLuggagePage() {
  const resetFlow = useNavigationStore((state) => state.resetFlow);
  const selectSize = useNavigationStore((state) => state.selectSize);
  const startNewSession = useStateStore((state) => state.startNewSession);

  return (
    <PageLayout
      headerButton={<Button onClick={() => resetFlow()}>Back to menu</Button>}
    >
      <div className="flex flex-col items-center gap-8">
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
          className="text-4xl font-bold"
        >
          Choose the size
        </motion.div>
        <div className="flex flex-wrap justify-center gap-8">
          {LUGGAGE_SIZES.map((size, index) => (
            <motion.button
              key={size.name}
              type="button"
              initial={{ x: -30, opacity: 0 }}
              animate={{
                x: 0,
                opacity: 1,
                transition: { delay: 0.1 + index * 0.05 },
              }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
              className="text-left"
              onClick={() => {
                startNewSession();
                selectSize(size.name);
              }}
            >
              <Card className="items-start gap-0 px-5 py-4">
                <div className="flex w-full justify-between">
                  <div className="text-3xl font-black">{size.name}</div>
                  <IconHandClick className="size-6" />
                </div>
                <div className="text-2xl font-black text-black/50">
                  {size.dimensions}
                </div>
                <div className="text-2xl font-black">{size.price}₽ / day</div>
              </Card>
            </motion.button>
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
