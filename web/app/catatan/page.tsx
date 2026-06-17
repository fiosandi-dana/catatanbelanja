import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { SectionTitle } from "@/components/SectionTitle";
import { CatatanList } from "@/components/CatatanList";
import { getActiveCatatan } from "@/lib/queries/catatan";
import { cityNameOf } from "@/lib/cities";

export default async function CatatanPage() {
  const catatan = await getActiveCatatan();
  const cityLabel = catatan.city_id ? cityNameOf(catatan.city_id) : "";

  if (catatan.items.length === 0) {
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

  return (
    <div>
      <Header title="Catatan Belanja" />
      <div className="-mt-fiat-l px-fiat-l space-y-fiat-m">
        <Card>
          <SectionTitle>{catatan.items.length} item ditandai</SectionTitle>
          {cityLabel && (
            <p className="mt-fiat-xs text-body-s text-text-subtle">
              Harga PIHPS dari {cityLabel} · disnap saat ditambah ke catatan
            </p>
          )}
          <div className="mt-fiat-m">
            <CatatanList
              items={catatan.items}
              totalIdr={catatan.total_idr}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
