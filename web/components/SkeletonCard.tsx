import { Card } from "@/components/Card";

/**
 * Lightweight pulsing placeholder rows for loading.tsx files. Renders
 * instantly during navigation transitions so each tab feels sub-100ms.
 */
export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <Card>
      <div className="h-6 w-2/3 bg-bg-base rounded animate-pulse" />
      <ul className="mt-fiat-m divide-y divide-outline-base">
        {Array.from({ length: rows }).map((_, i) => (
          <li key={i} className="flex items-center gap-fiat-m py-fiat-m">
            <div className="w-10 h-10 rounded-full bg-bg-base animate-pulse" />
            <div className="flex-1 space-y-fiat-xs">
              <div className="h-4 w-3/4 bg-bg-base rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-bg-base rounded animate-pulse" />
            </div>
            <div className="w-16 h-8 rounded-md bg-bg-base animate-pulse" />
          </li>
        ))}
      </ul>
    </Card>
  );
}
