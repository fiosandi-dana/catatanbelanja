"use client";

import { useState, useTransition } from "react";
import { CITIES } from "@/lib/cities";
import { selectCity } from "@/app/actions/select-city";

export function CityPicker({
  currentCityId,
  currentCityName,
}: {
  currentCityId: string;
  currentCityName: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handlePick(id: string) {
    if (id === currentCityId) {
      setOpen(false);
      return;
    }
    startTransition(async () => {
      await selectCity(id);
      setOpen(false);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-fiat-xs rounded-md bg-white/15 hover:bg-white/25 active:bg-white/30 transition-colors px-fiat-m py-fiat-xs text-body-m font-medium text-white"
      >
        <span aria-hidden>📍</span>
        <span>{currentCityName}</span>
        <span aria-hidden>▾</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Pilih kota"
          className="fixed inset-0 z-30 flex items-end justify-center"
        >
          <button
            type="button"
            aria-label="Tutup"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/40"
          />
          <div className="relative w-full max-w-md bg-bg-card rounded-t-2xl shadow-xl max-h-[80vh] flex flex-col">
            <div className="px-fiat-l pt-fiat-m pb-fiat-s">
              <div className="mx-auto h-1 w-10 rounded-full bg-outline-base" />
            </div>
            <div className="px-fiat-l pb-fiat-s">
              <h2 className="text-section-title font-bold text-text-strong">
                Pilih kotamu
              </h2>
              <p className="text-body-s text-text-medium mt-fiat-xs">
                Harga sembako berbeda di tiap kota. Pilih yang paling dekat.
              </p>
            </div>
            <ul className="overflow-y-auto px-fiat-s pb-fiat-l">
              {CITIES.map((c) => {
                const active = c.id === currentCityId;
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => handlePick(c.id)}
                      className={`w-full text-left px-fiat-m py-fiat-m rounded-lg flex items-center justify-between ${
                        active
                          ? "bg-dana-blue/10 text-dana-blue font-semibold"
                          : "text-text-strong hover:bg-bg-base active:bg-bg-base"
                      } disabled:opacity-50`}
                    >
                      <span>{c.name}</span>
                      {active && <span aria-hidden>✓</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </>
  );
}
