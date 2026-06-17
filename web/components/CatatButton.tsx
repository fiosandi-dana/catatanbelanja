"use client";

import { useEffect, useState } from "react";
import { CatatSheet } from "./CatatSheet";

/**
 * "+ Catat" trigger. Opens a quick-add bottom sheet (PRD §5.7 step 4–5) where
 * the user picks qty + optional notes, then confirms. Phase 0 confirm is
 * local-only — toast feedback only. Wires to Supabase via Server Action once
 * `pasar-backend` exposes the addCatat RPC.
 */
export function CatatButton({
  skuId,
  skuName,
  unit,
  priceIdr,
  icon,
}: {
  skuId: string;
  skuName: string;
  unit: string;
  priceIdr: number;
  icon: string;
}) {
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  function handleConfirm(qty: number, notes: string) {
    setOpen(false);
    const qtyStr = Number.isInteger(qty) ? `${qty}` : qty.toString();
    const suffix = notes ? ` · ${notes}` : "";
    setToast(`${skuName} tercatat · ${qtyStr} ${unit}${suffix}`);
    // TODO: call addCatat Server Action when backend lands.
    void skuId;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 rounded-md bg-dana-blue hover:bg-dana-blue-60 active:bg-dana-blue-60 transition-colors text-white text-body-m font-semibold px-fiat-m py-fiat-s"
      >
        + Catat
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
