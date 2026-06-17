import type { Metadata, Viewport } from "next";
import { BottomNav } from "@/components/BottomNav";
import { Onboarding } from "@/components/Onboarding";
import { getActiveCatatanItemCount } from "@/lib/queries/catatan";
import "./globals.css";

export const metadata: Metadata = {
  title: "Catatan Belanja",
  description:
    "Cek harga sembako, catat belanja, lacak pengeluaran rumah tangga.",
  applicationName: "Catatan Belanja",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#2563EB",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const catatanCount = await getActiveCatatanItemCount();

  return (
    <html lang="id">
      <body className="bg-bg-base min-h-screen font-sans text-text-strong">
        <main className="mx-auto max-w-md min-h-screen pb-[80px]">{children}</main>
        <BottomNav catatanCount={catatanCount} />
        <Onboarding />
      </body>
    </html>
  );
}
