import { Header } from "@/components/Header";
import { SkeletonList } from "@/components/SkeletonCard";

export default function HomeLoading() {
  return (
    <div>
      <Header title="Pasar DANA" />
      <div className="-mt-fiat-l px-fiat-l space-y-fiat-m">
        <SkeletonList rows={3} />
        <SkeletonList rows={6} />
      </div>
    </div>
  );
}
