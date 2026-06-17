"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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
 * Persistent bottom navigation. Three tabs, active state in DANA blue,
 * inactive in medium gray. Catatan tab exposes a count badge slot.
 */
export function BottomNav({ catatanCount = 0 }: { catatanCount?: number }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-20 bg-bg-card border-t border-outline-base">
      <ul className="flex justify-around items-stretch">
        {tabs.map((tab) => {
          const active = tab.matches(pathname);
          const showBadge = tab.href === "/catatan" && catatanCount > 0;
          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
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
                      {catatanCount}
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
