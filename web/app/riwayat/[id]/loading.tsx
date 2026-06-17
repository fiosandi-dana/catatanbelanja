import Link from "next/link";
import { Header } from "@/components/Header";
import { SkeletonList } from "@/components/SkeletonCard";

export default function RiwayatDetailLoading() {
  return (
    <div>
      <Header
        title="Detail Belanja"
        leftSlot={
          <Link
            href="/riwayat"
            className="inline-flex items-center gap-fiat-xs rounded-md bg-white/15 hover:bg-white/25 transition-colors px-fiat-m py-fiat-xs text-body-m font-medium text-white"
          >
            ← Kembali
          </Link>
        }
      />
      <div className="-mt-fiat-l px-fiat-l space-y-fiat-m">
        <SkeletonList rows={5} />
      </div>
    </div>
  );
}
