import { z } from "zod";

declare global {
  interface Window {
    __APP_CONFIG__?: unknown;
  }
}

const runtimeConfigSchema = z.object({
  convexUrl: z.string().url(),
  basePath: z.string().min(1),
  terminalName: z.string().min(1),
  supportPhone: z.string().min(1),
  supportChat: z.string().min(1),
});

function isRuntimeConfigRecord(
  value: unknown,
): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getRuntimeConfigValue(key: keyof z.infer<typeof runtimeConfigSchema>) {
  if (typeof window === "undefined") {
    return undefined;
  }

  if (!isRuntimeConfigRecord(window.__APP_CONFIG__)) {
    return undefined;
  }

  const value = window.__APP_CONFIG__;

  if (!(key in value)) {
    return undefined;
  }

  const runtimeValue = value[key];

  if (typeof runtimeValue !== "string" || runtimeValue.length === 0) {
    return undefined;
  }

  return runtimeValue;
}

function normalizeBasePath(basePath: string) {
  if (basePath === "/" || basePath.length === 0) {
    return "/";
  }

  const withLeadingSlash = basePath.startsWith("/") ? basePath : `/${basePath}`;

  return withLeadingSlash.endsWith("/")
    ? withLeadingSlash.slice(0, -1)
    : withLeadingSlash;
}

const parsedConfig = runtimeConfigSchema.parse({
  convexUrl:
    getRuntimeConfigValue("convexUrl") ?? import.meta.env.VITE_CONVEX_URL,
  basePath:
    getRuntimeConfigValue("basePath") ??
    import.meta.env.VITE_APP_BASE_PATH ??
    import.meta.env.BASE_URL,
  terminalName:
    getRuntimeConfigValue("terminalName") ??
    import.meta.env.VITE_APP_TERMINAL_NAME,
  supportPhone:
    getRuntimeConfigValue("supportPhone") ??
    import.meta.env.VITE_APP_SUPPORT_PHONE,
  supportChat:
    getRuntimeConfigValue("supportChat") ??
    import.meta.env.VITE_APP_SUPPORT_CHAT,
});

export const env = {
  ...parsedConfig,
  basePath: normalizeBasePath(parsedConfig.basePath),
};
