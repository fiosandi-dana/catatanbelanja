"use client";

import { useEffect, useState, useTransition } from "react";
import { CatatSheet } from "./CatatSheet";
import { addCatat } from "@/app/actions/catat";

/**
 * "+ Catat" trigger. Opens a quick-add bottom sheet (PRD §5.7 step 4–5) where
 * the user picks qty + optional notes, then confirms. On confirm, calls the
 * `addCatat` Server Action — which (a) upserts the SKU registry (for custom
 * "+ Tambah" items), (b) finds/creates the active catatan, (c) inserts the
 * line item. Then revalidates layout so the BottomNav badge updates.
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
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  function handleConfirm(qty: number, notes: string, price: number | null) {
    startTransition(async () => {
      const result = await addCatat({
        skuId,
        skuName,
        unit,
        qty,
        priceIdr: price,
        notes: notes || undefined,
      });
      setOpen(false);
      if (result.ok) {
        const qtyStr = Number.isInteger(qty) ? `${qty}` : qty.toString();
        const suffix = notes ? ` · ${notes}` : "";
        setToast(`${skuName} tercatat · ${qtyStr} ${unit}${suffix}`);
        onAfterConfirm?.();
      } else {
        setToast(`Gagal: ${result.error}`);
      }
    });
  }

  const triggerClass =
    variant === "primary"
      ? "shrink-0 rounded-md bg-dana-blue hover:bg-dana-blue-60 active:bg-dana-blue-60 transition-colors text-white text-body-m font-semibold px-fiat-m py-fiat-s disabled:opacity-50"
      : "shrink-0 rounded-md border border-dashed border-dana-blue text-dana-blue hover:bg-dana-blue/10 transition-colors text-body-m font-semibold px-fiat-m py-fiat-s disabled:opacity-50";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={pending}
        className={triggerClass}
      >
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
