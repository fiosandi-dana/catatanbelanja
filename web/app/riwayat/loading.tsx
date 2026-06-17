import { Header } from "@/components/Header";
import { SkeletonList } from "@/components/SkeletonCard";

export default function RiwayatLoading() {
  return (
    <div>
      <Header title="Riwayat Belanja" />
      <div className="-mt-fiat-l px-fiat-l">
        <SkeletonList rows={4} />
      </div>
    </div>
  );
}
