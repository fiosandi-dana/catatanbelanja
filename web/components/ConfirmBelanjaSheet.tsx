"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { confirmBelanja } from "@/app/actions/catat";
import { notifyCatat } from "@/lib/catat-events";
import type { CatatanItemRow } from "@/lib/queries/catatan";

const ICONS: Record<string, string> = {
  beras_premium: "🍚", beras_medium: "🍚", telur_ayam_ras: "🥚",
  daging_ayam_ras: "🍗", daging_sapi: "🥩",
  minyak_goreng_curah: "🛢️", minyak_goreng_kemasan: "🛢️",
  gula_pasir: "🍬", bawang_merah: "🧅", bawang_putih: "🧄",
  cabai_merah_keriting: "🌶️", cabai_merah_besar: "🌶️", cabai_rawit_merah: "🌶️",
};
function iconFor(skuId: string): string {
  if (skuId.startsWith("custom_")) return "🛒";
  return ICONS[skuId] ?? "🛒";
}

function formatIdr(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export function ConfirmBelanjaSheet({
  items,
  totalPihpsIdr,
  open,
  onClose,
}: {
  items: CatatanItemRow[];
  totalPihpsIdr: number;
  open: boolean;
  onClose: () => void;
}) {
  const [pasarLabel, setPasarLabel] = useState("");
  const [actuals, setActuals] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setActuals({});
      setErrorMsg(null);
      // Warm Riwayat — user is about to land there.
      router.prefetch("/riwayat");
    }
  }, [open, router]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const totalActualIdr = useMemo(() => {
    let sum = 0;
    let hasAny = false;
    let allFilled = true;
    for (const it of items) {
      const raw = actuals[it.item_id]?.replace(/\D/g, "") ?? "";
      const v = raw ? parseInt(raw, 10) : 0;
      if (v > 0) {
        sum += Math.round(v * it.qty);
        hasAny = true;
      } else {
        allFilled = false;
      }
    }
    return { total: sum, hasAny, allFilled };
  }, [actuals, items]);

  if (!open) return null;

  function handleConfirm() {
    setErrorMsg(null);
    const itemCount = items.length;
    const actualPrices: Record<string, number | null> = {};
    for (const it of items) {
      const raw = actuals[it.item_id]?.replace(/\D/g, "") ?? "";
      const v = raw ? parseInt(raw, 10) : 0;
      actualPrices[it.item_id] = v > 0 ? v : null;
    }
    notifyCatat("cleared", 0);
    onClose();
    // Navigate immediately — Riwayat list shows the new entry via revalidatePath
    // once the Server Action lands. Skeleton renders in the meantime.
    router.push("/riwayat");
    startTransition(async () => {
      const result = await confirmBelanja({
        pasarLabel: pasarLabel.trim(),
        actualPrices,
      });
      if (!result.ok) {
        notifyCatat("set", itemCount);
        setErrorMsg(result.error);
        router.push("/catatan");
      } else {
        setPasarLabel("");
      }
    });
  }

  const diff = totalActualIdr.hasAny ? totalActualIdr.total - totalPihpsIdr : null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Konfirmasi belanja"
      className="fixed inset-0 z-30 flex items-end justify-center"
    >
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div className="relative w-full max-w-md bg-bg-card rounded-t-2xl shadow-xl max-h-[92vh] flex flex-col animate-sheet-up">
        <div className="px-fiat-l pt-fiat-m pb-fiat-s shrink-0">
          <div className="mx-auto h-1 w-10 rounded-full bg-outline-base" />
        </div>

        <div className="px-fiat-l overflow-y-auto">
          <h2 className="text-section-title font-bold text-text-strong">
            Sudah belanja?
          </h2>
          <p className="text-body-s text-text-medium mt-fiat-xs">
            Periksa harga yang benar-benar kamu bayar. Bisa kosongkan kalau
            sama dengan PIHPS.
          </p>

          <div className="mt-fiat-l">
            <label htmlFor="pasar" className="text-body-s font-semibold text-text-strong">
              Belanja di mana?{" "}
              <span className="font-normal text-text-subtle">(opsional)</span>
            </label>
            <input
              id="pasar"
              type="text"
              value={pasarLabel}
              onChange={(e) => setPasarLabel(e.target.value.slice(0, 60))}
              placeholder="Pasar Kranji, Indomaret, Warung Bu Ani…"
              className="mt-fiat-s w-full rounded-md border border-outline-base bg-bg-base focus:bg-bg-card focus:border-dana-blue focus:outline-none focus:ring-2 focus:ring-dana-blue/30 px-fiat-m py-fiat-s text-body-m text-text-strong placeholder:text-text-subtle"
            />
          </div>

          <div className="mt-fiat-l">
            <p className="text-body-s font-semibold text-text-strong">
              Harga yang kamu bayar
            </p>
            <ul className="mt-fiat-s divide-y divide-outline-base">
              {items.map((it) => {
                const raw = actuals[it.item_id]?.replace(/\D/g, "") ?? "";
                const parsed = raw ? parseInt(raw, 10) : 0;
                const delta = parsed > 0 ? parsed - it.price_at_add_idr : null;
                return (
                  <li
                    key={it.item_id}
                    className="flex items-start gap-fiat-m py-fiat-m"
                  >
                    <span className="text-[24px] leading-none w-9 text-center shrink-0" aria-hidden>
                      {iconFor(it.sku_id)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-body-m font-semibold text-text-strong truncate">
                        {it.name_id}
                      </p>
                      <p className="text-caption text-text-subtle">
                        {it.qty} {it.unit} · PIHPS {formatIdr(it.price_at_add_idr)}
                      </p>
                      <div className="mt-fiat-xs flex items-center gap-fiat-xs">
                        <span className="text-body-s text-text-medium">Rp</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={raw ? Number(raw).toLocaleString("id-ID") : ""}
                          onChange={(e) =>
                            setActuals((cur) => ({
                              ...cur,
                              [it.item_id]: e.target.value
                                .replace(/\D/g, "")
                                .slice(0, 9),
                            }))
                          }
                          placeholder={String(it.price_at_add_idr)}
                          className="w-24 rounded-md border border-outline-base bg-bg-base focus:bg-bg-card focus:border-dana-blue focus:outline-none focus:ring-2 focus:ring-dana-blue/30 px-fiat-s py-fiat-xs text-body-m text-text-strong text-right"
                        />
                        <span className="text-body-s text-text-medium">/ {it.unit}</span>
                        {delta !== null && (
                          <span
                            className={`text-caption font-medium ml-fiat-xs ${
                              delta < 0
                                ? "text-feedback-success"
                                : delta > 0
                                  ? "text-feedback-warning"
                                  : "text-text-subtle"
                            }`}
                          >
                            {delta < 0 ? "−" : delta > 0 ? "+" : "="}
                            {Math.abs(delta).toLocaleString("id-ID")}
                          </span>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-fiat-l p-fiat-m bg-bg-base rounded-lg space-y-fiat-xs">
            <div className="flex items-baseline justify-between">
              <span className="text-body-s text-text-medium">Total PIHPS</span>
              <span className="text-body-m font-semibold text-text-strong">
                {formatIdr(totalPihpsIdr)}
              </span>
            </div>
            {totalActualIdr.hasAny && (
              <div className="flex items-baseline justify-between">
                <span className="text-body-s text-text-medium">
                  Total dibayar
                  {!totalActualIdr.allFilled && (
                    <span className="text-text-subtle font-normal"> (sebagian)</span>
                  )}
                </span>
                <span
                  className={`text-body-l font-bold ${
                    diff != null && diff < 0
                      ? "text-feedback-success"
                      : diff != null && diff > 0
                        ? "text-feedback-warning"
                        : "text-text-strong"
                  }`}
                >
                  {formatIdr(totalActualIdr.total)}
                  {diff != null && diff !== 0 && (
                    <span className="ml-fiat-xs text-body-s font-medium">
                      ({diff < 0 ? "−" : "+"}
                      {formatIdr(Math.abs(diff))})
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          {errorMsg && (
            <p className="mt-fiat-s text-body-s text-feedback-error">⚠️ {errorMsg}</p>
          )}

          <div className="mt-fiat-l pb-fiat-l flex gap-fiat-s">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="flex-1 rounded-md border border-outline-base bg-bg-card hover:bg-bg-base transition-colors text-text-strong text-body-l font-semibold py-fiat-m disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={pending}
              className="flex-[2] rounded-md bg-dana-blue hover:bg-dana-blue-60 active:bg-dana-blue-60 transition-colors text-white text-body-l font-semibold py-fiat-m disabled:opacity-50"
            >
              {pending ? "Menyimpan…" : "Simpan ke riwayat"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
