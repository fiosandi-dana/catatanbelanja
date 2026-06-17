import type { ReactNode } from "react";

type SectionTitleProps = {
  children: ReactNode;
  className?: string;
};

/**
 * FIAT section title. 24–28px bold, Text/Base/Strong.
 * Used at the top of cards or major content groups.
 */
export function SectionTitle({ children, className = "" }: SectionTitleProps) {
  return (
    <h2 className={`text-section-title text-text-strong ${className}`}>
      {children}
    </h2>
  );
}
