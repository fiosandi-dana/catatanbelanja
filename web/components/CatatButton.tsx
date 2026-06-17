"use client";

import { useEffect, useState } from "react";
import { CatatSheet } from "./CatatSheet";
import { addCatat } from "@/app/actions/catat";
import { notifyCatat } from "@/lib/catat-events";

/**
 * "+ Catat" trigger. Opens a quick-add bottom sheet (PRD §5.7 step 4–5) where
 * the user picks qty + optional notes, then confirms.
 *
 * Optimistic UX: the moment the user taps "Catat ke daftar belanja", the
 * sheet closes, the toast shows, and the BottomNav badge increments — without
 * waiting for the DB round-trip. The Server Action runs in the background; on
 * failure we roll back the badge and surface the error.
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
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  function handleConfirm(qty: number, notes: string, price: number | null) {
    // Close sheet + show toast IMMEDIATELY; do not wait for the DB.
    setOpen(false);
    const qtyStr = Number.isInteger(qty) ? `${qty}` : qty.toString();
    const suffix = notes ? ` · ${notes}` : "";
    setToast(`${skuName} tercatat · ${qtyStr} ${unit}${suffix}`);
    notifyCatat("added", 1);
    onAfterConfirm?.();

    // Fire-and-forget; rollback if the server rejects.
    addCatat({
      skuId,
      skuName,
      unit,
      qty,
      priceIdr: price,
      notes: notes || undefined,
    })
      .then((result) => {
        if (!result.ok) {
          notifyCatat("removed", 1);
          setToast(`Gagal menyimpan: ${result.error}`);
        }
      })
      .catch((err) => {
        notifyCatat("removed", 1);
        setToast(
          `Gagal menyimpan: ${err instanceof Error ? err.message : String(err)}`,
        );
      });
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
