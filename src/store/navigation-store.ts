import { create } from "zustand";

import { createScreenUrl, resolveScreenFromLocation } from "@/lib/routes";
import type { LuggageSizeName } from "@/shared/luggage-sizes";

export type Screen =
  | "home"
  | "check-luggage"
  | "luggage-deposit"
  | "luggage-deposited"
  | "payment"
  | "pay-by-card"
  | "pay-by-fps"
  | "payment-successful"
  | "payment-cancelled"
  | "final"
  | "support"
  | "no-free-cells";

type NavigationState = {
  currentScreen: Screen;
  supportReturnScreen: Screen | null;
  selectedSize: LuggageSizeName | null;
  navigateTo: (screen: Screen, options?: { replace?: boolean }) => void;
  selectSize: (size: LuggageSizeName) => void;
  syncFromLocation: () => void;
  goBack: () => void;
  resetFlow: () => void;
};

function updateHistory(screen: Screen, replace = false) {
  if (typeof window === "undefined") {
    return;
  }

  const nextUrl = createScreenUrl(screen);

  if (replace) {
    window.history.replaceState(null, "", nextUrl);
    return;
  }

  window.history.pushState(null, "", nextUrl);
}

function getInitialScreen(): Screen {
  if (typeof window === "undefined") {
    return "home";
  }

  return resolveScreenFromLocation(
    window.location.pathname,
    window.location.search,
  );
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  currentScreen: getInitialScreen(),
  supportReturnScreen: null,
  selectedSize: null,
  navigateTo: (screen, options) => {
    updateHistory(screen, options?.replace ?? false);

    set((state) => {
      if (screen === "support") {
        return {
          currentScreen: "support",
          supportReturnScreen:
            state.currentScreen === "support"
              ? state.supportReturnScreen
              : state.currentScreen,
        };
      }

      return {
        currentScreen: screen,
        supportReturnScreen: state.supportReturnScreen,
      };
    });
  },
  selectSize: (size) => {
    updateHistory("luggage-deposit");
    set({
      currentScreen: "luggage-deposit",
      selectedSize: size,
      supportReturnScreen: null,
    });
  },
  syncFromLocation: () => {
    if (typeof window === "undefined") {
      return;
    }

    const screen = resolveScreenFromLocation(
      window.location.pathname,
      window.location.search,
    );

    if (screen !== get().currentScreen) {
      set({ currentScreen: screen });
    }
  },
  goBack: () => {
    const fallbackScreen = get().supportReturnScreen ?? "home";
    updateHistory(fallbackScreen, true);
    set({
      currentScreen: fallbackScreen,
      supportReturnScreen: null,
    });
  },
  resetFlow: () => {
    updateHistory("home", true);
    set({
      currentScreen: "home",
      selectedSize: null,
      supportReturnScreen: null,
    });
  },
}));
