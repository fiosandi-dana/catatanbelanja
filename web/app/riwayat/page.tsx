import Link from "next/link";
import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { SectionTitle } from "@/components/SectionTitle";
import { getRiwayatList } from "@/lib/queries/riwayat";
import { cityNameOf } from "@/lib/cities";

function formatIdr(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const ymd = (x: Date) => x.toISOString().slice(0, 10);
  if (ymd(d) === ymd(today)) return "Hari ini";
  if (ymd(d) === ymd(yest)) return "Kemarin";
  return d.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function RiwayatPage() {
  const result = await getRiwayatList();

  if (result.status === "empty" || result.status === "unconfigured") {
    return (
      <div>
        <Header title="Riwayat Belanja" />
        <div className="-mt-fiat-l px-fiat-l">
          <Card>
            <SectionTitle>Belum ada riwayat</SectionTitle>
            <p className="mt-fiat-m text-body-l text-text-medium">
              Setelah kamu tap{" "}
              <span className="font-semibold text-dana-blue">
                Sudah belanja ini
              </span>{" "}
              di Catatan, belanjamu akan muncul di sini.
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

  if (result.status === "error") {
    return (
      <div>
        <Header title="Riwayat Belanja" />
        <div className="-mt-fiat-l px-fiat-l">
          <Card>
            <p className="text-body-s text-feedback-error">
              ⚠️ Tidak bisa memuat riwayat: {result.message}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header title="Riwayat Belanja" />
      <div className="-mt-fiat-l px-fiat-l space-y-fiat-m">
        <Card>
          <SectionTitle>{result.entries.length} catatan tersimpan</SectionTitle>
          <ul className="mt-fiat-m divide-y divide-outline-base">
            {result.entries.map((e) => (
              <li key={e.riwayat_id}>
                <Link
                  href={`/riwayat/${e.riwayat_id}`}
                  className="block py-fiat-m hover:bg-bg-base/60 active:bg-bg-base -mx-fiat-m px-fiat-m rounded-md"
                >
                  <div className="flex items-baseline justify-between gap-fiat-s">
                    <span className="text-body-l font-semibold text-text-strong">
                      {formatDate(e.confirmed_at)}
                    </span>
                    <span className="text-body-l font-bold text-text-strong">
                      {formatIdr(e.total_pihps_idr)}
                    </span>
                  </div>
                  <div className="mt-fiat-xs flex items-baseline justify-between gap-fiat-s text-body-s text-text-medium">
                    <span className="truncate">
                      {e.pasar_label || `Pasar di ${cityNameOf(e.city_id)}`} ·{" "}
                      {e.item_count} item
                    </span>
                    {e.total_actual_idr != null && (
                      <span
                        className={
                          e.total_actual_idr < e.total_pihps_idr
                            ? "text-feedback-success font-semibold"
                            : "text-feedback-warning font-semibold"
                        }
                      >
                        Bayar: {formatIdr(e.total_actual_idr)}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
