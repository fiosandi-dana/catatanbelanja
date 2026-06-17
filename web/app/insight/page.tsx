import Link from "next/link";
import { Card } from "@/components/Card";
import { Header } from "@/components/Header";
import { SectionTitle } from "@/components/SectionTitle";
import { getInsight } from "@/lib/queries/insight";

function formatIdr(value: number): string {
  return `Rp ${value.toLocaleString("id-ID")}`;
}

function formatIdrCompact(value: number): string {
  if (value >= 1_000_000) {
    return `Rp ${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}jt`;
  }
  if (value >= 1_000) {
    return `Rp ${Math.round(value / 1_000)}rb`;
  }
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export default async function InsightPage() {
  const result = await getInsight();

  if (result.status === "unconfigured" || result.status === "empty") {
    return (
      <div>
        <Header title="Insight Bulanan" />
        <div className="-mt-fiat-l px-fiat-l">
          <Card>
            <SectionTitle>Belum ada insight</SectionTitle>
            <p className="mt-fiat-m text-body-l text-text-medium">
              Insight bulanan akan muncul setiap awal bulan setelah kamu punya
              riwayat belanja. Mulai dengan{" "}
              <Link href="/" className="text-dana-blue font-semibold underline">
                catat sembako di Beranda
              </Link>
              .
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

  if (result.status === "error") {
    return (
      <div>
        <Header title="Insight Bulanan" />
        <div className="-mt-fiat-l px-fiat-l">
          <Card>
            <p className="text-body-s text-feedback-error">
              ⚠️ Tidak bisa memuat insight: {result.message}
            </p>
          </Card>
        </div>
      </div>
    );
  }

  const { current, previous, months, categories, topSkus, topPasar } = result;
  const deltaVsPrev = previous ? current.totalEffective - previous.totalEffective : null;
  const deltaPct =
    previous && previous.totalEffective > 0
      ? Math.round(((current.totalEffective - previous.totalEffective) / previous.totalEffective) * 100)
      : null;

  const maxMonthTotal = Math.max(
    ...months.map((m) => m.totalEffective),
    1,
  );

  return (
    <div>
      <Header title="Insight Bulanan" />
      <div className="-mt-fiat-l px-fiat-l space-y-fiat-m">
        {/* Top card: this month */}
        <Card>
          <p className="text-body-s text-text-subtle">{current.label}</p>
          <p className="mt-fiat-xs text-[32px] leading-tight font-bold text-text-strong">
            {formatIdr(current.totalEffective)}
          </p>
          <p className="text-body-s text-text-medium">
            {current.tripCount} trip · {current.itemCount} item
          </p>
          {previous && deltaVsPrev !== null && (
            <div className="mt-fiat-m flex items-center gap-fiat-xs">
              <span
                className={`inline-flex items-center gap-fiat-xs px-fiat-s py-fiat-xs rounded-full text-body-s font-semibold ${
                  deltaVsPrev < 0
                    ? "bg-feedback-success/15 text-feedback-success"
                    : deltaVsPrev > 0
                      ? "bg-feedback-warning/15 text-feedback-warning"
                      : "bg-bg-base text-text-medium"
                }`}
              >
                {deltaVsPrev < 0 ? "↓" : deltaVsPrev > 0 ? "↑" : "="}{" "}
                {formatIdrCompact(Math.abs(deltaVsPrev))}
                {deltaPct !== null && ` (${deltaPct > 0 ? "+" : ""}${deltaPct}%)`}
              </span>
              <span className="text-body-s text-text-medium">vs {previous.label}</span>
            </div>
          )}
        </Card>

        {/* 6-month trend */}
        {months.length > 1 && (
          <Card>
            <SectionTitle>6 bulan terakhir</SectionTitle>
            <ul className="mt-fiat-m space-y-fiat-s">
              {[...months].reverse().map((m) => (
                <li key={m.monthKey} className="flex items-center gap-fiat-s">
                  <span className="text-body-s text-text-medium w-20 shrink-0">
                    {m.label.split(" ")[0]?.slice(0, 3)} {m.label.split(" ")[1]?.slice(-2)}
                  </span>
                  <div className="flex-1 h-2 bg-bg-base rounded-full overflow-hidden">
                    <div
                      className={`h-full ${
                        m.monthKey === current.monthKey ? "bg-dana-blue" : "bg-text-medium/40"
                      }`}
                      style={{
                        width: `${Math.max(2, (m.totalEffective / maxMonthTotal) * 100)}%`,
                      }}
                    />
                  </div>
                  <span className="text-body-s font-medium text-text-strong w-20 shrink-0 text-right">
                    {formatIdrCompact(m.totalEffective)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Category breakdown */}
        {categories.length > 0 && (
          <Card>
            <SectionTitle>Breakdown kategori</SectionTitle>
            <ul className="mt-fiat-m space-y-fiat-s">
              {categories.map((c) => (
                <li key={c.category}>
                  <div className="flex items-baseline justify-between gap-fiat-s">
                    <span className="text-body-m font-medium text-text-strong">
                      {c.label}
                    </span>
                    <span className="text-body-s text-text-medium">
                      {formatIdrCompact(c.total)} · {Math.round(c.share * 100)}%
                    </span>
                  </div>
                  <div className="mt-fiat-xs h-1.5 bg-bg-base rounded-full overflow-hidden">
                    <div
                      className="h-full bg-dana-blue"
                      style={{ width: `${Math.max(2, c.share * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Top SKUs */}
        {topSkus.length > 0 && (
          <Card>
            <SectionTitle>Top sembako bulan ini</SectionTitle>
            <ul className="mt-fiat-m divide-y divide-outline-base">
              {topSkus.map((sku, i) => (
                <li
                  key={sku.sku_id}
                  className="flex items-center gap-fiat-m py-fiat-s"
                >
                  <span className="text-body-l font-bold text-dana-blue w-6 text-center">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-body-m font-semibold text-text-strong truncate">
                      {sku.name_id}
                    </p>
                    <p className="text-caption text-text-subtle">
                      {sku.qty} unit
                    </p>
                  </div>
                  <span className="text-body-m font-bold text-text-strong">
                    {formatIdrCompact(sku.total)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Top pasar */}
        {topPasar.length > 0 && (
          <Card>
            <SectionTitle>Pasar paling sering</SectionTitle>
            <ul className="mt-fiat-m divide-y divide-outline-base">
              {topPasar.map((p) => (
                <li
                  key={p.pasar_label}
                  className="flex items-center justify-between gap-fiat-m py-fiat-s"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-body-m font-semibold text-text-strong truncate">
                      {p.pasar_label}
                    </p>
                    <p className="text-caption text-text-subtle">
                      {p.trip_count} kali · {formatIdrCompact(p.total)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <p className="px-fiat-s pb-fiat-l text-caption text-text-subtle text-center">
          Data dari catatan + harga aktualmu. PIHPS sebagai patokan, kamu yang
          mengisi harga sebenarnya saat konfirmasi belanja.
        </p>
      </div>
    </div>
  );
}
