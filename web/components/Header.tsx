import type { ReactNode } from "react";

type HeaderProps = {
  title: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
};

/**
 * FIAT 2.5 blue header. ~120px tall, white text, DANA blue background.
 * Acts as the top brand container; first card on the page should overlap it.
 */
export function Header({ title, leftSlot, rightSlot }: HeaderProps) {
  return (
    <header className="bg-dana-blue text-white pt-fiat-l pb-fiat-2xl px-fiat-l">
      <div className="flex items-center justify-between min-h-[40px]">
        <div className="flex-1 min-w-0 text-left">{leftSlot}</div>
        <div className="flex-1 min-w-0 text-right">{rightSlot}</div>
      </div>
      <h1 className="mt-fiat-m text-[20px] font-bold leading-7">{title}</h1>
    </header>
  );
}
