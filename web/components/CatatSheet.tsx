"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (qty: number, notes: string, priceIdr: number | null) => void;
  skuId: string;
  skuName: string;
  unit: string;
  icon: string;
  /** PIHPS price in IDR. `null` means custom "add other" item with no anchor — user can fill manually. */
  priceIdr: number | null;
  /** True when the item isn't in our SKU registry (typed via "Add other"). */
  isCustom?: boolean;
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

const UNIT_OPTIONS = ["kg", "L", "butir", "ikat", "dus", "pack"] as const;

export function CatatSheet({
  open,
  onClose,
  onConfirm,
  skuId,
  skuName,
  unit: initialUnit,
  icon,
  priceIdr,
  isCustom = false,
}: Props) {
  const [unit, setUnit] = useState<string>(initialUnit);
  const step = STEP_FOR_UNIT[unit] ?? 1;
  const [qty, setQty] = useState<number>(1);
  const [notes, setNotes] = useState<string>("");
  const [customPrice, setCustomPrice] = useState<string>(""); // string for empty-state UX
  const notesRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setQty(1);
      setNotes("");
      setUnit(initialUnit);
      setCustomPrice("");
    }
  }, [open, skuId, initialUnit]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const parsedCustomPrice = customPrice
    ? Math.max(0, Math.round(parseFloat(customPrice.replace(/\D/g, "")) || 0))
    : 0;
  const effectivePrice =
    priceIdr ?? (parsedCustomPrice > 0 ? parsedCustomPrice : null);
  const lineTotal =
    effectivePrice != null ? Math.round(effectivePrice * qty) : null;
  const canConfirm = qty > 0 && skuName.trim().length > 0;

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
                {priceIdr != null
                  ? `Harga PIHPS · ${formatIdr(priceIdr)} / ${unit}`
                  : isCustom
                    ? "Item lain · belum ada harga PIHPS"
                    : `Belum ada harga PIHPS · ${unit}`}
              </p>
            </div>
          </div>

          {/* Custom-item: unit picker */}
          {isCustom && (
            <div className="mt-fiat-l">
              <label className="text-body-s font-semibold text-text-strong">
                Satuan
              </label>
              <div className="mt-fiat-s flex flex-wrap gap-fiat-xs">
                {UNIT_OPTIONS.map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => setUnit(u)}
                    className={`px-fiat-m py-fiat-xs rounded-full text-body-s font-medium transition-colors ${
                      u === unit
                        ? "bg-dana-blue text-white"
                        : "bg-bg-base text-text-medium hover:bg-outline-base"
                    }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Custom-item: optional manual price */}
          {priceIdr == null && (
            <div className="mt-fiat-l">
              <label
                htmlFor="catat-custom-price"
                className="text-body-s font-semibold text-text-strong"
              >
                Harga per {unit}{" "}
                <span className="font-normal text-text-subtle">
                  (opsional)
                </span>
              </label>
              <div className="mt-fiat-s flex items-center gap-fiat-xs">
                <span className="text-body-l text-text-medium">Rp</span>
                <input
                  id="catat-custom-price"
                  type="text"
                  inputMode="numeric"
                  value={customPrice}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "").slice(0, 9);
                    setCustomPrice(digits);
                  }}
                  placeholder="0"
                  className="flex-1 rounded-md border border-outline-base bg-bg-base focus:bg-bg-card focus:border-dana-blue focus:outline-none focus:ring-2 focus:ring-dana-blue/30 px-fiat-m py-fiat-s text-body-l font-semibold text-text-strong"
                />
              </div>
            </div>
          )}

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
              {lineTotal != null ? formatIdr(lineTotal) : "—"}
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
              onClick={() =>
                onConfirm(qty, notes.trim(), effectivePrice ?? null)
              }
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
