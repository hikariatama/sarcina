import { type ComponentType, useEffect, useState } from "react";
import { IconCircleCaretUp } from "@tabler/icons-react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery } from "convex/react";

import { ConvexAppProvider } from "@/convex";
import { env } from "@/lib/env";
import HomePage from "@/pages/home-page";
import CheckLuggagePage from "@/pages/check-luggage-page";
import LuggageDepositPage from "@/pages/luggage-deposit-page";
import OperatorPage from "@/pages/operator-page";
import SupportPage from "@/pages/support-page";
import { type Screen, useNavigationStore } from "@/store/navigation-store";
import { api } from "../convex/_generated/api";
import { Button } from "./components/button";
import LuggageDepositedPage from "./pages/luggage-deposited-page";
import PaymentPage from "./pages/payment-page";
import PayByCardPage from "./pages/pay-by-card-page";
import PayByFPSPage from "./pages/pay-by-fps-page";
import PaymentSuccessfulPage from "./pages/payment-successful-page";
import FinalPage from "./pages/final-page";
import PaymentCancelledPage from "./pages/payment-cancelled-page";
import NoFreeCellsPage from "./pages/no-free-cells-page";
import { useStateStore } from "./store/state-store";

const pages: Record<Screen, ComponentType> = {
  home: HomePage,
  "check-luggage": CheckLuggagePage,
  "luggage-deposit": LuggageDepositPage,
  "luggage-deposited": LuggageDepositedPage,
  support: SupportPage,
  payment: PaymentPage,
  "pay-by-card": PayByCardPage,
  "pay-by-fps": PayByFPSPage,
  "payment-successful": PaymentSuccessfulPage,
  final: FinalPage,
  "payment-cancelled": PaymentCancelledPage,
  "no-free-cells": NoFreeCellsPage,
};

export function App() {
  return (
    <ConvexAppProvider>
      <AppRouter />
    </ConvexAppProvider>
  );
}

function getOperatorPath() {
  return env.basePath === "/" ? "/operator" : `${env.basePath}/operator`;
}

function normalizePathname(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

function AppRouter() {
  const [pathname, setPathname] = useState(() =>
    typeof window === "undefined" ? "/" : window.location.pathname,
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updatePathname = () => {
      setPathname(window.location.pathname);
    };

    window.addEventListener("popstate", updatePathname);

    return () => {
      window.removeEventListener("popstate", updatePathname);
    };
  }, []);

  if (normalizePathname(pathname) === normalizePathname(getOperatorPath())) {
    return <OperatorPage />;
  }

  return <AppShell />;
}

function AppShell() {
  const currentScreen = useNavigationStore((state) => state.currentScreen);
  const navigateTo = useNavigationStore((state) => state.navigateTo);
  const syncFromLocation = useNavigationStore(
    (state) => state.syncFromLocation,
  );
  const ensureSeedData = useMutation(api.cells.ensureSeedData);
  const startClaim = useMutation(api.bookings.startClaim);
  const claimableBookingHint = useQuery(api.cells.getClaimableBookingHint);
  const setCurrentBooking = useStateStore((state) => state.setCurrentBooking);
  const correlationId = useStateStore((state) => state.correlationId);
  const [backendState, setBackendState] = useState<
    "loading" | "ready" | "error"
  >("loading");

  useEffect(() => {
    let isCancelled = false;

    void ensureSeedData({})
      .then(() => {
        if (!isCancelled) {
          setBackendState("ready");
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setBackendState("error");
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [ensureSeedData]);

  useEffect(() => {
    syncFromLocation();

    const handlePopState = () => {
      syncFromLocation();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [syncFromLocation]);

  const CurrentPage = pages[currentScreen];

  return (
    <div className="hor:flex-row flex h-screen w-full flex-col items-center justify-center bg-black p-8">
      <div className="size-fit bg-[url('/frame.png')] bg-cover p-8 shadow-[0_0_16px_8px_color-mix(in_srgb,var(--color-brand)_30%,transparent)]">
        <div className="bg-white p-12" style={{ width: 835, height: 626 }}>
          {backendState === "ready" ? (
            <AnimatePresence mode="wait">
              <CurrentPage key={currentScreen} />
            </AnimatePresence>
          ) : (
            <div className="flex size-full items-center justify-center text-3xl font-bold text-black">
              {backendState === "loading"
                ? "Starting the luggage terminal..."
                : "The luggage terminal is unavailable right now."}
            </div>
          )}
        </div>
      </div>
      <AnimatePresence>
        {claimableBookingHint && currentScreen === "home" && (
          <motion.div
            initial={{ width: 0, height: 0, margin: 0 }}
            animate={{ width: "auto", height: "auto", margin: "2.5rem" }}
            exit={{ width: 0, height: 0, margin: 0 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.2 }}
            className="overflow-hidden whitespace-pre"
          >
            <div className="p-1">
              <Button
                variant="system"
                onClick={() => {
                  void startClaim({
                    bookingId: claimableBookingHint.bookingId,
                    correlationId,
                    route: "home-shortcut",
                  }).then((booking) => {
                    setCurrentBooking(booking);
                    navigateTo("payment");
                  });
                }}
              >
                <IconCircleCaretUp />
                Emulate claim
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
