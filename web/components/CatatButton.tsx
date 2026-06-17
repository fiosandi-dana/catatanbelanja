"use client";

import { useEffect, useState } from "react";
import { CatatSheet } from "./CatatSheet";

/**
 * "+ Catat" trigger. Opens a quick-add bottom sheet (PRD §5.7 step 4–5).
 * Supports both registry SKUs (with PIHPS price) and custom "add other" items
 * (priceIdr=null, isCustom=true).
 */
export function CatatButton({
  skuId,
  skuName,
  unit,
  priceIdr,
  icon,
  isCustom = false,
  label = "+ Catat",
  variant = "primary",
  onAfterConfirm,
}: {
  skuId: string;
  skuName: string;
  unit: string;
  priceIdr: number | null;
  icon: string;
  isCustom?: boolean;
  label?: string;
  variant?: "primary" | "ghost";
  onAfterConfirm?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  function handleConfirm(qty: number, notes: string, _price: number | null) {
    setOpen(false);
    const qtyStr = Number.isInteger(qty) ? `${qty}` : qty.toString();
    const suffix = notes ? ` · ${notes}` : "";
    setToast(`${skuName} tercatat · ${qtyStr} ${unit}${suffix}`);
    void skuId;
    void _price;
    onAfterConfirm?.();
  }

  const triggerClass =
    variant === "primary"
      ? "shrink-0 rounded-md bg-dana-blue hover:bg-dana-blue-60 active:bg-dana-blue-60 transition-colors text-white text-body-m font-semibold px-fiat-m py-fiat-s"
      : "shrink-0 rounded-md border border-dashed border-dana-blue text-dana-blue hover:bg-dana-blue/10 transition-colors text-body-m font-semibold px-fiat-m py-fiat-s";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClass}>
        {label}
      </button>

      <CatatSheet
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        skuId={skuId}
        skuName={skuName}
        unit={unit}
        icon={icon}
        priceIdr={priceIdr}
        isCustom={isCustom}
      />

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-[88px] left-1/2 -translate-x-1/2 z-40 bg-text-strong text-white px-fiat-l py-fiat-s rounded-lg shadow-lg text-body-s font-medium max-w-[90vw] text-center animate-fade-in"
        >
          {toast}
        </div>
      )}
    </>
  );
}
