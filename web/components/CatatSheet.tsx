"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (qty: number, notes: string) => void;
  skuId: string;
  skuName: string;
  unit: string;
  icon: string;
  priceIdr: number;
};

function formatIdr(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

const STEP_FOR_UNIT: Record<string, number> = {
  kg: 0.5,
  L: 0.5,
  butir: 1,
  ikat: 1,
  dus: 1,
};

export function CatatSheet({
  open,
  onClose,
  onConfirm,
  skuId,
  skuName,
  unit,
  icon,
  priceIdr,
}: Props) {
  const step = STEP_FOR_UNIT[unit] ?? 1;
  const [qty, setQty] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");
  const notesRef = useRef<HTMLTextAreaElement>(null);

  // Reset state every time the sheet reopens for a different SKU
  useEffect(() => {
    if (open) {
      setQty(1);
      setNotes("");
    }
  }, [open, skuId]);

  // Escape key closes
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const lineTotal = Math.round(priceIdr * qty);
  const canConfirm = qty > 0;

  function bump(delta: number) {
    setQty((q) => {
      const next = Math.max(step, Math.round((q + delta) * 100) / 100);
      return next;
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Catat ${skuName}`}
      className="fixed inset-0 z-30 flex items-end justify-center"
    >
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative w-full max-w-md bg-bg-card rounded-t-2xl shadow-xl max-h-[90vh] flex flex-col animate-sheet-up">
        {/* drag handle */}
        <div className="px-fiat-l pt-fiat-m pb-fiat-s shrink-0">
          <div className="mx-auto h-1 w-10 rounded-full bg-outline-base" />
        </div>

        <div className="px-fiat-l pb-fiat-l overflow-y-auto">
          {/* SKU header */}
          <div className="flex items-center gap-fiat-m">
            <span
              className="text-[32px] leading-none w-12 text-center"
              aria-hidden
            >
              {icon}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-body-l font-bold text-text-strong truncate">
                {skuName}
              </p>
              <p className="text-body-s text-text-medium">
                Harga PIHPS · {formatIdr(priceIdr)} / {unit}
              </p>
            </div>
          </div>

          {/* Qty stepper */}
          <div className="mt-fiat-l">
            <label className="text-body-s font-semibold text-text-strong">
              Jumlah
            </label>
            <div className="mt-fiat-s flex items-center gap-fiat-m">
              <button
                type="button"
                onClick={() => bump(-step)}
                disabled={qty <= step}
                aria-label="Kurangi jumlah"
                className="w-11 h-11 rounded-full bg-bg-base hover:bg-outline-base active:bg-outline-base transition-colors text-text-strong text-section-title font-bold flex items-center justify-center disabled:opacity-40"
              >
                −
              </button>
              <div className="flex-1 flex items-center justify-center gap-fiat-xs">
                <input
                  type="number"
                  inputMode="decimal"
                  step={step}
                  min={step}
                  value={qty}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    if (!Number.isNaN(v) && v > 0) setQty(v);
                  }}
                  className="w-20 text-center text-section-title font-bold text-text-strong bg-transparent focus:outline-none focus:ring-2 focus:ring-dana-blue rounded-md"
                />
                <span className="text-body-l text-text-medium">{unit}</span>
              </div>
              <button
                type="button"
                onClick={() => bump(step)}
                aria-label="Tambah jumlah"
                className="w-11 h-11 rounded-full bg-dana-blue/10 hover:bg-dana-blue/20 active:bg-dana-blue/20 transition-colors text-dana-blue text-section-title font-bold flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-fiat-l">
            <label
              htmlFor="catat-notes"
              className="text-body-s font-semibold text-text-strong"
            >
              Catatan{" "}
              <span className="font-normal text-text-subtle">(opsional)</span>
            </label>
            <textarea
              id="catat-notes"
              ref={notesRef}
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 140))}
              rows={2}
              placeholder="Misal: merk tertentu, untuk lebaran, jangan yang terlalu pedas…"
              className="mt-fiat-s w-full rounded-md border border-outline-base bg-bg-base focus:bg-bg-card focus:border-dana-blue focus:outline-none focus:ring-2 focus:ring-dana-blue/30 px-fiat-m py-fiat-s text-body-m text-text-strong placeholder:text-text-subtle resize-none"
            />
            <div className="mt-fiat-xs text-right text-caption text-text-subtle">
              {notes.length}/140
            </div>
          </div>

          {/* Estimasi total */}
          <div className="mt-fiat-l flex items-center justify-between p-fiat-m bg-bg-base rounded-lg">
            <span className="text-body-s text-text-medium">Estimasi total</span>
            <span className="text-body-l font-bold text-text-strong">
              {formatIdr(lineTotal)}
            </span>
          </div>

          {/* Actions */}
          <div className="mt-fiat-l flex gap-fiat-s">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-outline-base bg-bg-card hover:bg-bg-base active:bg-bg-base transition-colors text-text-strong text-body-l font-semibold py-fiat-m"
            >
              Batal
            </button>
            <button
              type="button"
              disabled={!canConfirm}
              onClick={() => onConfirm(qty, notes.trim())}
              className="flex-[2] rounded-md bg-dana-blue hover:bg-dana-blue-60 active:bg-dana-blue-60 transition-colors text-white text-body-l font-semibold py-fiat-m disabled:opacity-50"
            >
              Catat ke daftar belanja
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
