import type { ButtonHTMLAttributes, ReactNode } from "react";

type PrimaryButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

/**
 * FIAT 2.5 primary CTA. DANA blue background, white label, 1–2 word
 * Indonesian copy. Disabled state lowers opacity per FIAT guidance.
 */
export function PrimaryButton({
  children,
  className = "",
  disabled,
  ...rest
}: PrimaryButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={`bg-dana-blue text-white text-body-l font-semibold rounded-md px-fiat-l py-fiat-m transition active:bg-dana-blue-60 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
