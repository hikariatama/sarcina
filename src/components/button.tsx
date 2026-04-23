import type { ButtonHTMLAttributes } from "react";
import { IconHandClick } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "bg-white outline-brand font-title flex items-center justify-center font-bold text-black disabled:cursor-not-allowed disabled:opacity-60",
  {
    variants: {
      variant: {
        default: "gap-4 rounded-full px-6 py-2 text-2xl outline-4",
        system:
          "gap-1 rounded-lg pl-3 has-[svg]:pl-2.5 pr-3 py-1 text-base [&>svg]:size-4.5 outline-2 hover:-translate-y-0.5 active:translate-y-0.5 transition-transform cursor-pointer",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ButtonProps
  extends
    ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({
  children,
  className,
  variant,
  ...props
}: ButtonProps) {
  const buttonType = props.type ?? "button";

  return (
    <button
      type={buttonType}
      className={cn(buttonVariants({ variant, className }), "text-wdth-115")}
      {...props}
    >
      {variant === "system" ? (
        children
      ) : (
        <>
          <div className="flex items-center gap-2">{children}</div>
          <IconHandClick className="size-6" />
        </>
      )}
    </button>
  );
}
