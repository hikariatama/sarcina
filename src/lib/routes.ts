import { env } from "@/lib/env";
import type { Screen } from "@/store/navigation-store";

export const SCREEN_PATHS: Record<Screen, string> = {
  home: "home",
  "check-luggage": "check-luggage",
  "luggage-deposit": "luggage-deposit",
  "luggage-deposited": "luggage-deposited",
  payment: "payment",
  "pay-by-card": "pay-by-card",
  "pay-by-fps": "pay-by-fps",
  "payment-successful": "payment-successful",
  "payment-cancelled": "payment-cancelled",
  final: "final",
  support: "support",
  "no-free-cells": "no-free-cells",
};

function matchesBasePath(pathname: string) {
  if (env.basePath === "/") {
    return pathname === "/";
  }

  return pathname === env.basePath || pathname === `${env.basePath}/`;
}

export function resolveScreenFromLocation(
  pathname: string,
  search: string,
): Screen {
  if (!matchesBasePath(pathname)) {
    return "home";
  }

  const searchParams = new URLSearchParams(search);
  const screenParam = searchParams.get("screen");
  const matchingScreen = Object.entries(SCREEN_PATHS).find(
    ([, path]) => path === screenParam,
  )?.[0] as Screen | undefined;

  return matchingScreen ?? "home";
}

export function createScreenUrl(screen: Screen) {
  const basePath = env.basePath === "/" ? "/" : env.basePath;

  if (screen === "home") {
    return basePath;
  }

  return `${basePath}?screen=${SCREEN_PATHS[screen]}`;
}
