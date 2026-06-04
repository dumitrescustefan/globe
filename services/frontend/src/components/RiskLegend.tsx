import { TIER_META, type RiskTier } from '../lib/rating'

const LEGEND_ORDER: RiskTier[] = [
  'highGrade',
  'upperMedium',
  'lowerMedium',
  'speculative',
  'substantialRisk',
  'default',
]

export function RiskLegend() {
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2.5 backdrop-blur-md">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
        Risk tier
      </p>
      <ul className="space-y-1">
        {LEGEND_ORDER.map((tier) => (
          <li key={tier} className="flex items-center gap-2 text-xs text-[var(--text)]">
            <span
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: TIER_META[tier].color }}
            />
            {TIER_META[tier].label}
          </li>
        ))}
      </ul>
    </div>
  )
}
