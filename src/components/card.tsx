import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "outline-brand flex flex-col items-center justify-center gap-4 rounded-4xl bg-white p-8 text-black outline-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
