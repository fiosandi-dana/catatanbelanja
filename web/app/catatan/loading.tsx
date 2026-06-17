import { Header } from "@/components/Header";
import { SkeletonList } from "@/components/SkeletonCard";

export default function CatatanLoading() {
  return (
    <div>
      <Header title="Catatan Belanja" />
      <div className="-mt-fiat-l px-fiat-l">
        <SkeletonList rows={3} />
      </div>
    </div>
  );
}
