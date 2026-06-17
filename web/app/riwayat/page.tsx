import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { SectionTitle } from "@/components/SectionTitle";

export default function RiwayatPage() {
  return (
    <div>
      <Header title="Riwayat Belanja" />

      <div className="-mt-fiat-l px-fiat-l">
        <Card>
          <SectionTitle>Belum ada riwayat</SectionTitle>
          <p className="mt-fiat-m text-body-l text-text-medium">
            Setelah kamu tap{" "}
            <span className="font-semibold text-dana-blue">Sudah belanja</span>{" "}
            di catatan, riwayat belanjamu akan muncul di sini.
          </p>
          <div
            className="mt-fiat-2xl flex items-center justify-center text-[64px]"
            aria-hidden
          >
            🧾
          </div>
        </Card>
      </div>
    </div>
  );
}
