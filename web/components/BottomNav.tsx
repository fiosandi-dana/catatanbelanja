"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { subscribeCatat } from "@/lib/catat-events";

type Tab = {
  href: string;
  label: string;
  icon: string;
  matches: (path: string) => boolean;
};

const tabs: Tab[] = [
  { href: "/", label: "Beranda", icon: "🏠", matches: (p) => p === "/" },
  {
    href: "/catatan",
    label: "Catatan",
    icon: "📝",
    matches: (p) => p.startsWith("/catatan"),
  },
  {
    href: "/riwayat",
    label: "Riwayat",
    icon: "🧾",
    matches: (p) => p.startsWith("/riwayat") || p.startsWith("/insight"),
  },
];

/**
 * Persistent bottom navigation. The catatan count badge starts from the
 * server-fetched seed value and updates **optimistically** via the in-process
 * event bus — clicks feel instant without waiting for the next server render.
 */
export function BottomNav({ catatanCount = 0 }: { catatanCount?: number }) {
  const pathname = usePathname();
  const [count, setCount] = useState(catatanCount);

  // Keep state in sync when the server hand-off bumps the seed (next page nav).
  useEffect(() => {
    setCount(catatanCount);
  }, [catatanCount]);

  useEffect(() => {
    return subscribeCatat((kind, delta) => {
      setCount((prev) => {
        switch (kind) {
          case "added":
            return prev + delta;
          case "removed":
            return Math.max(0, prev - delta);
          case "cleared":
            return 0;
          case "set":
            return delta;
        }
      });
    });
  }, []);

  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 bg-bg-card border-t border-outline-base">
      <ul className="flex justify-around items-stretch">
        {tabs.map((tab) => {
          const active = tab.matches(pathname);
          const showBadge = tab.href === "/catatan" && count > 0;
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                prefetch
                className={`flex flex-col items-center justify-center py-fiat-s text-body-s ${
                  active
                    ? "text-dana-blue font-semibold"
                    : "text-text-medium"
                }`}
              >
                <span className="relative text-[22px] leading-none" aria-hidden>
                  {tab.icon}
                  {showBadge && (
                    <span className="absolute -top-1 -right-3 min-w-[18px] h-[18px] px-1 rounded-full bg-feedback-error text-white text-caption font-bold flex items-center justify-center">
                      {count}
                    </span>
                  )}
                </span>
                <span className="mt-fiat-xs">{tab.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
