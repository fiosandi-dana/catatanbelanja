import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { SectionTitle } from "@/components/SectionTitle";
import { CityPicker } from "@/components/CityPicker";
import { CatatButton } from "@/components/CatatButton";
import { SkuSearch } from "@/components/SkuSearch";
import {
  getLatestPrices,
  type LatestPriceRow,
  TOP_SKU_IDS,
} from "@/lib/queries/latest-prices";
import { getAllPricesForCity } from "@/lib/queries/all-prices";
import { cityNameOf } from "@/lib/cities";
import { getSelectedCity } from "@/app/actions/select-city";

const ICONS: Record<string, string> = {
  telur_ayam_ras: "🥚",
  beras_medium: "🍚",
  beras_premium: "🍚",
  minyak_goreng_kemasan: "🛢️",
  minyak_goreng_curah: "🛢️",
  daging_ayam_ras: "🍗",
  daging_sapi: "🥩",
  cabai_merah_keriting: "🌶️",
  cabai_merah_besar: "🌶️",
  cabai_rawit_merah: "🌶️",
  gula_pasir: "🍬",
  bawang_merah: "🧅",
  bawang_putih: "🧄",
};

function iconFor(skuId: string): string {
  return ICONS[skuId] ?? "🛒";
}

function formatIdr(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function stalenessCaption(days: number): string {
  if (days === 0) return "diperbarui hari ini";
  if (days === 1) return "diperbarui kemarin";
  return `terakhir diperbarui ${days} hari lalu`;
}

const MOCK_ROWS: LatestPriceRow[] = TOP_SKU_IDS.map((id, i) => ({
  sku_id: id,
  name_id: {
    telur_ayam_ras: "Telur Ayam Ras",
    beras_medium: "Beras Medium",
    minyak_goreng_kemasan: "Minyak Goreng Kemasan",
    daging_ayam_ras: "Daging Ayam Ras",
    cabai_merah_keriting: "Cabai Merah Keriting",
    gula_pasir: "Gula Pasir",
  }[id]!,
  unit: id === "minyak_goreng_kemasan" ? "L" : "kg",
  category: "lainnya",
  price_idr: [28500, 13500, 17200, 38000, 42000, 16800][i]!,
  snapshot_date: "2026-01-01",
  staleness_days: 0,
}));

export default async function Beranda() {
  const cityId = await getSelectedCity();
  const cityLabel = cityNameOf(cityId);
  const [result, allPrices] = await Promise.all([
    getLatestPrices(cityId),
    getAllPricesForCity(cityId),
  ]);

  const rows: LatestPriceRow[] =
    result.status === "ok" ? result.rows : MOCK_ROWS;

  const caption =
    result.status === "ok"
      ? `Data PIHPS Bank Indonesia · ${stalenessCaption(
          Math.min(...result.rows.map((r) => r.staleness_days)),
        )}`
      : "Data PIHPS Bank Indonesia · diperbarui hari ini (demo)";

  return (
    <div>
      <Header
        title="Pasar DANA"
        leftSlot={
          <CityPicker currentCityId={cityId} currentCityName={cityLabel} />
        }
      />

      <div className="-mt-fiat-l px-fiat-l space-y-fiat-m">
        {result.status === "unconfigured" && <DemoBanner />}
        {result.status === "empty" && <EmptyBanner cityLabel={cityLabel} />}
        {result.status === "error" && <ErrorBanner message={result.message} />}

        <Card>
          <SectionTitle>Cari sembako</SectionTitle>
          <p className="mt-fiat-xs text-body-s text-text-medium">
            Ketik nama bahan yang kamu cari, atau pilih dari daftar populer di bawah.
          </p>
          <div className="mt-fiat-m">
            <SkuSearch skus={allPrices.status === "ok" ? allPrices.rows : []} />
          </div>
        </Card>

        <Card>
          <SectionTitle>Populer hari ini</SectionTitle>
          <ul className="mt-fiat-m divide-y divide-outline-base">
            {rows.map((sku) => (
              <li
                key={sku.sku_id}
                className="flex items-center gap-fiat-m py-fiat-m"
              >
                <span
                  className="text-[28px] leading-none w-10 text-center"
                  aria-hidden
                >
                  {iconFor(sku.sku_id)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-body-l font-semibold text-text-strong truncate">
                    {sku.name_id}
                  </p>
                  <p className="text-body-s text-text-medium">
                    {formatIdr(sku.price_idr)} / {sku.unit}
                  </p>
                </div>
                <CatatButton
                  skuId={sku.sku_id}
                  skuName={sku.name_id}
                  unit={sku.unit}
                  priceIdr={sku.price_idr}
                  icon={iconFor(sku.sku_id)}
                />
              </li>
            ))}
          </ul>
          <p className="mt-fiat-m text-body-s text-text-subtle">{caption}</p>
        </Card>
      </div>
    </div>
  );
}

function DemoBanner() {
  return (
    <Card>
      <p className="text-body-s text-text-medium">
        🧪 <strong className="text-text-strong">Mode demo</strong> — Supabase belum terhubung.
        Lihat <code className="text-text-strong">SETUP.md</code> untuk menyalakan data PIHPS asli.
      </p>
    </Card>
  );
}

function EmptyBanner({ cityLabel }: { cityLabel: string }) {
  return (
    <Card>
      <p className="text-body-s text-text-medium">
        Belum ada data harga PIHPS untuk <strong className="text-text-strong">{cityLabel}</strong>.
        Jalankan backfill (<code className="text-text-strong">pihps-backfill.sql</code>) atau tunggu scraper harian.
      </p>
    </Card>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <Card>
      <p className="text-body-s text-text-medium">
        ⚠️ Tidak bisa memuat harga: <span className="text-text-strong">{message}</span>
      </p>
    </Card>
  );
}
