import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { SectionTitle } from "@/components/SectionTitle";

/**
 * Beranda (Surface A). Top 6 sembako SKUs with PIHPS price + Catat action.
 *
 * Phase 0 ships with mock prices so the screen passes the FIAT visual check
 * before `pasar-backend` finishes the `price_snapshots` table. Replace the
 * `mockPrices` array with a Server Component read from Supabase once the
 * schema lands.
 */

type SkuRow = {
  sku_id: string;
  name_id: string;
  unit: string;
  icon: string;
  price_idr: number;
};

const mockPrices: SkuRow[] = [
  { sku_id: "telur_ayam_ras", name_id: "Telur Ayam Ras", unit: "kg", icon: "🥚", price_idr: 28500 },
  { sku_id: "beras_medium", name_id: "Beras Medium", unit: "kg", icon: "🍚", price_idr: 13500 },
  { sku_id: "minyak_goreng", name_id: "Minyak Goreng", unit: "L", icon: "🛢️", price_idr: 17200 },
  { sku_id: "daging_ayam", name_id: "Daging Ayam Ras", unit: "kg", icon: "🍗", price_idr: 38000 },
  { sku_id: "cabai_merah", name_id: "Cabai Merah Keriting", unit: "kg", icon: "🌶️", price_idr: 42000 },
  { sku_id: "gula_pasir", name_id: "Gula Pasir", unit: "kg", icon: "🍬", price_idr: 16800 },
];

function formatIdr(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export default function Beranda() {
  return (
    <div>
      <Header
        title="Pasar DANA"
        leftSlot={
          <button
            type="button"
            className="inline-flex items-center gap-fiat-xs rounded-md bg-white/15 px-fiat-m py-fiat-xs text-body-m font-medium text-white"
          >
            <span aria-hidden>📍</span>
            <span>Bekasi</span>
            <span aria-hidden>▾</span>
          </button>
        }
      />

      <div className="-mt-fiat-l px-fiat-l space-y-fiat-m">
        <Card>
          <SectionTitle>Harga sembako hari ini</SectionTitle>
          <ul className="mt-fiat-m divide-y divide-outline-base">
            {mockPrices.map((sku) => (
              <li
                key={sku.sku_id}
                className="flex items-center gap-fiat-m py-fiat-m"
              >
                <span
                  className="text-[28px] leading-none w-10 text-center"
                  aria-hidden
                >
                  {sku.icon}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-body-l font-semibold text-text-strong truncate">
                    {sku.name_id}
                  </p>
                  <p className="text-body-s text-text-medium">
                    {formatIdr(sku.price_idr)} / {sku.unit}
                  </p>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-md bg-dana-blue text-white text-body-m font-semibold px-fiat-m py-fiat-s"
                >
                  + Catat
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-fiat-m text-body-s text-text-subtle">
            Data PIHPS Bank Indonesia · diperbarui hari ini
          </p>
        </Card>
      </div>
    </div>
  );
}
