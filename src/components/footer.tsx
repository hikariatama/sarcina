import { env } from "@/lib/env";

export function Footer() {
  return (
    <div className="flex w-full items-end justify-between">
      <div className="text-2xl font-semibold text-black/50">
        Support: {env.supportPhone}
      </div>
      <div className="flex items-center gap-2 text-black">
        <div className="text-xl font-bold text-black">{env.terminalName}</div>
      </div>
    </div>
  );
}
