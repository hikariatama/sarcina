"use client";

import { IconCreditCard, IconFaceId, IconLoader2 } from "@tabler/icons-react";
import { QrcodeCanvas } from "react-qrcode-pretty";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export function TotallyGenericPOSTerminalNotBelongingToAnyParticularBank({
  onPayment,
  amount,
}: {
  onPayment: () => void;
  amount: number;
}) {
  const [paid, setPaid] = useState(false);

  return (
    <motion.div
      className="absolute inset-0 m-auto flex items-center justify-center bg-black/50 backdrop-blur-xs"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="flex flex-col rounded-2xl bg-stone-300 px-2 pb-6 shadow-[inset_0px_0px_8px_0px_rgba(255,255,255,1.00)]"
        initial={{ y: "100vh" }}
        animate={{ y: 0 }}
        exit={{
          y: "100vh",
          transition: {
            type: "spring",
            duration: 0.7,
            bounce: 0.3,
            delay: 0.6,
          },
        }}
        transition={{ type: "spring", duration: 0.7, bounce: 0.3 }}
      >
        <div className="flex items-center justify-center gap-2.5 py-1.5">
          <div className="relative size-3">
            <div className="absolute inset-0 m-auto h-3 w-3 rounded-full bg-black/80"></div>
            <div className="absolute inset-0 m-auto h-1.5 w-1.5 rounded-full bg-black"></div>
          </div>
        </div>
        <div className="flex size-96 flex-col items-start justify-between gap-4 rounded-2xl bg-linear-to-br from-[#0D1112] to-[#25552F] p-4">
          <div className="flex flex-col items-start justify-start">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{
                opacity: 0,
                y: -10,
                transition: { duration: 0.15, delay: 0.3 },
              }}
              transition={{ duration: 0.15, delay: 0.3 }}
              className="justify-start text-2xl font-black text-white"
            >
              Payment
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{
                opacity: 0,
                y: -10,
                transition: { duration: 0.15, delay: 0.2 },
              }}
              transition={{ duration: 0.15, delay: 0.4 }}
              className="justify-start text-3xl font-black text-white"
            >
              {amount},00₽
            </motion.div>
          </div>
          <div className="relative flex w-full flex-1 justify-end">
            <AnimatePresence initial={false}>
              {!paid && (
                <motion.div
                  className="grid grid-cols-2 grid-rows-2 gap-2"
                  onClick={() => {
                    setPaid(true);
                    setTimeout(() => {
                      onPayment();
                    }, 1500);
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15, delay: 0.5 }}
                    className="row-span-2 flex flex-col items-start justify-between rounded-2xl bg-black/25 p-4"
                  >
                    <QrcodeCanvas
                      value="https://qr.nspk.ru/FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF?type=00&bank=000000000000&sum=0&cur=RUB&crc=0000"
                      size={512}
                      bgColor="#00000000"
                      internalProps={{
                        style: { width: "100%", aspectRatio: "1 / 1" },
                      }}
                      variant={{ eyes: "circle", body: "fluid" }}
                      color={{
                        eyes: "#fff",
                        body: "#fff",
                      }}
                    />
                    <div className="text-xl font-semibold text-white">
                      Scan the
                      <br />
                      QR Code
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15, delay: 0.6 }}
                    className="flex flex-col items-start justify-between rounded-2xl bg-black/25 p-4"
                  >
                    <IconCreditCard className="size-8 text-white" />
                    <div className="text-xl font-semibold text-white">
                      Tap the card
                    </div>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15, delay: 0.6 }}
                    className="flex flex-col items-start justify-between rounded-2xl bg-[#82F24C] p-4"
                  >
                    <IconFaceId className="size-8 text-green-950" />
                    <div className="text-xl font-semibold text-green-950">
                      Pay with a smile
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {paid && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.15 }}
                >
                  <IconLoader2 className="absolute inset-0 m-auto size-8 -translate-y-1/2 animate-spin text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
