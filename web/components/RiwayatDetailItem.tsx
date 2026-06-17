"use client";

import { useState, useTransition } from "react";
import { updateActualPrice } from "@/app/actions/catat";

function formatIdr(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export function RiwayatDetailItem({
  itemId,
  pihpsPrice,
  initialActual,
  unit,
  qty,
}: {
  itemId: string;
  pihpsPrice: number;
  initialActual: number | null;
  unit: string;
  qty: number;
}) {
  const [actual, setActual] = useState<string>(
    initialActual != null ? String(initialActual) : "",
  );
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [pending, startTransition] = useTransition();

  function handleBlur() {
    const trimmed = actual.replace(/\D/g, "");
    const value = trimmed ? parseInt(trimmed, 10) : null;
    startTransition(async () => {
      const res = await updateActualPrice(itemId, value);
      if (res.ok) setSavedAt(Date.now());
    });
  }

  const parsed = parseInt(actual.replace(/\D/g, ""), 10);
  const delta =
    Number.isFinite(parsed) && parsed > 0
      ? Math.round((parsed - pihpsPrice) * qty)
      : null;

  return (
    <div className="flex flex-col gap-fiat-xs">
      <div className="flex items-center gap-fiat-xs">
        <span className="text-body-s text-text-medium shrink-0">Bayar Rp</span>
        <input
          type="text"
          inputMode="numeric"
          value={actual}
          onChange={(e) => setActual(e.target.value.replace(/\D/g, "").slice(0, 9))}
          onBlur={handleBlur}
          placeholder="—"
          className="w-28 rounded-md border border-outline-base bg-bg-base focus:bg-bg-card focus:border-dana-blue focus:outline-none focus:ring-2 focus:ring-dana-blue/30 px-fiat-s py-fiat-xs text-body-m text-text-strong text-right"
        />
        <span className="text-body-s text-text-medium">/ {unit}</span>
        {pending && (
          <span className="text-caption text-text-subtle ml-fiat-xs">...</span>
        )}
        {!pending && savedAt && Date.now() - savedAt < 3000 && (
          <span className="text-caption text-feedback-success ml-fiat-xs">✓</span>
        )}
      </div>
      {delta !== null && (
        <p
          className={`text-caption font-medium ${
            delta < 0 ? "text-feedback-success" : delta > 0 ? "text-feedback-warning" : "text-text-subtle"
          }`}
        >
          {delta < 0
            ? `Lebih hemat ${formatIdr(-delta)} dari PIHPS`
            : delta > 0
              ? `Lebih mahal ${formatIdr(delta)} dari PIHPS`
              : "Sama dengan PIHPS"}
        </p>
      )}
    </div>
  );
}
