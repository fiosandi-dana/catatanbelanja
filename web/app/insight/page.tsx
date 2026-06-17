import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { SectionTitle } from "@/components/SectionTitle";

export default function InsightPage() {
  return (
    <div>
      <Header title="Insight Bulanan" />

      <div className="-mt-fiat-l px-fiat-l">
        <Card>
          <SectionTitle>Belum ada insight</SectionTitle>
          <p className="mt-fiat-m text-body-l text-text-medium">
            Insight bulanan akan muncul setiap awal bulan setelah kamu punya
            riwayat belanja.
          </p>
          <div
            className="mt-fiat-2xl flex items-center justify-center text-[64px]"
            aria-hidden
          >
            📊
          </div>
        </Card>
      </div>
    </div>
  );
}
