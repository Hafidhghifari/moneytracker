import type { HTMLAttributes, ReactNode } from "react";

interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Panel({ className = "", children, ...rest }: PanelProps) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface shadow-[0_1px_2px_rgba(23,33,43,0.04)] ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}