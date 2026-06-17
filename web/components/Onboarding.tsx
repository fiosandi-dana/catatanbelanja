"use client";

import { useEffect, useState } from "react";

const COOKIE = "pasar_onboarded";

function hasCookie(): boolean {
  if (typeof document === "undefined") return true;
  return document.cookie.split("; ").some((c) => c.startsWith(`${COOKIE}=1`));
}

function setCookie() {
  if (typeof document === "undefined") return;
  // 1 year, sameSite Lax, no httpOnly so we can write it client-side.
  const exp = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${COOKIE}=1; Path=/; Expires=${exp}; SameSite=Lax`;
}

const STEPS = [
  {
    icon: "🛒",
    title: "Cek harga sembako",
    body: "Harga PIHPS Bank Indonesia per kota, diperbarui setiap pagi. 117+ kebutuhan harian.",
  },
  {
    icon: "📝",
    title: "Catat sebelum belanja",
    body: "Tap “+ Catat”, isi jumlah dan catatan kecil — daftar belanjamu siap dibawa ke pasar.",
  },
  {
    icon: "💰",
    title: "Sudah belanja? Konfirmasi",
    body: "Masukkan harga yang benar-benar kamu bayar. Lihat di mana kamu hemat atau over-budget.",
  },
  {
    icon: "📊",
    title: "Insight bulanan",
    body: "Total pengeluaran, breakdown kategori, pasar favorit — semua terlacak otomatis.",
  },
];

export function Onboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!hasCookie()) setOpen(true);
  }, []);

  function dismiss() {
    setCookie();
    setOpen(false);
  }

  if (!open) return null;

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step]!;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Selamat datang di Catatan Belanja"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 animate-fade-in"
    >
      <div className="relative w-full max-w-md bg-bg-card rounded-t-2xl shadow-xl animate-sheet-up max-h-[92vh] overflow-y-auto">
        <div className="px-fiat-l pt-fiat-m pb-fiat-s">
          <div className="mx-auto h-1 w-10 rounded-full bg-outline-base" />
        </div>

        <div className="px-fiat-l pb-fiat-l">
          {/* Progress dots */}
          <div className="flex items-center justify-center gap-fiat-xs mb-fiat-l">
            {STEPS.map((_, i) => (
              <span
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i === step
                    ? "w-8 bg-dana-blue"
                    : i < step
                      ? "w-2 bg-dana-blue/40"
                      : "w-2 bg-outline-base"
                }`}
              />
            ))}
          </div>

          <div className="text-center">
            <div className="text-[80px] leading-none mb-fiat-m" aria-hidden>
              {current.icon}
            </div>
            <h2 className="text-section-title font-bold text-text-strong">
              {current.title}
            </h2>
            <p className="mt-fiat-s text-body-l text-text-medium px-fiat-s">
              {current.body}
            </p>
          </div>

          <div className="mt-fiat-2xl flex gap-fiat-s">
            <button
              type="button"
              onClick={dismiss}
              className="flex-1 rounded-md border border-outline-base bg-bg-card hover:bg-bg-base transition-colors text-text-medium text-body-m font-medium py-fiat-m"
            >
              Skip
            </button>
            <button
              type="button"
              onClick={() => (isLast ? dismiss() : setStep((s) => s + 1))}
              className="flex-[2] rounded-md bg-dana-blue hover:bg-dana-blue-60 active:bg-dana-blue-60 transition-colors text-white text-body-l font-semibold py-fiat-m"
            >
              {isLast ? "Mulai catat sekarang" : "Lanjut"}
            </button>
          </div>

          <p className="mt-fiat-m text-center text-caption text-text-subtle">
            Tidak perlu daftar. Catatan tersimpan otomatis di browser ini.
          </p>
        </div>
      </div>
    </div>
  );
}
