import type { Metadata, Viewport } from "next";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pasar DANA",
  description:
    "Cek harga sembako, catat belanja, lacak pengeluaran rumah tangga.",
  applicationName: "Pasar DANA",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#108EE9",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-bg-base min-h-screen font-sans text-text-strong">
        <main className="mx-auto max-w-md min-h-screen pb-[80px]">{children}</main>
        {/* TODO: wire `catatanCount` to active catatan from Supabase. */}
        <BottomNav catatanCount={0} />
      </body>
    </html>
  );
}
