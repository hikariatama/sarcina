import { motion } from "framer-motion";
import type { PropsWithChildren } from "react";

export function Header({ children }: PropsWithChildren) {
  return (
    <div className="flex w-full justify-between">
      <div className="font-title text-wdth-115 flex items-center gap-1.5 text-4xl font-bold tracking-wider">
        <div>{"["}</div>
        <div className="text-wdth-300 text-brand font-[1000]">Sarcina</div>
        <div>{"]"}</div>
      </div>
      <motion.div
        layout
        layoutId="header-button"
        transition={{
          type: "spring",
          duration: 0.3,
          bounce: 0.2,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
