import type { PropsWithChildren, ReactNode } from "react";
import { Header } from "./header";
import { Footer } from "./footer";

export function PageLayout({
  headerButton,
  children,
}: PropsWithChildren<{ headerButton: ReactNode }>) {
  return (
    <div className="flex size-full flex-col items-center justify-between">
      <Header>{headerButton}</Header>
      <div className="flex w-full flex-col gap-8 pb-4">{children}</div>
      <Footer />
    </div>
  );
}
