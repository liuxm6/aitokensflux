import type { ReactNode } from "react";

export function Pill({ children }: { children: ReactNode }) {
  return <span className="pill pill-flux pill-dot">{children}</span>;
}
