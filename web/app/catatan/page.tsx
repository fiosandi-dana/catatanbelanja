import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { SectionTitle } from "@/components/SectionTitle";

export default function CatatanPage() {
  return (
    <div>
      <Header title="Catatan Belanja" />

      <div className="-mt-fiat-l px-fiat-l">
        <Card>
          <SectionTitle>Belum ada catatan</SectionTitle>
          <p className="mt-fiat-m text-body-l text-text-medium">
            Buka <span className="font-semibold text-text-strong">Beranda</span>{" "}
            dan tap{" "}
            <span className="font-semibold text-dana-blue">+ Catat</span> pada
            sembako yang ingin kamu beli.
          </p>
          <div
            className="mt-fiat-2xl flex items-center justify-center text-[64px]"
            aria-hidden
          >
            🛒
          </div>
        </Card>
      </div>
    </div>
  );
}
