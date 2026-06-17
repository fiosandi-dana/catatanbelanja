import type { HTMLAttributes, ReactNode } from "react";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

/**
 * FIAT 2.5 card surface. White background, 12px radius, 16px padding,
 * very soft shadow. Use to group meaningful content on the gray page.
 */
export function Card({ children, className = "", ...rest }: CardProps) {
  return (
    <div
      className={`bg-bg-card rounded-md p-fiat-l shadow-fiat-card ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
