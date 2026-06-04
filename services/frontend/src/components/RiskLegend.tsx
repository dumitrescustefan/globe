import { TIER_META, type RiskTier } from '../lib/rating'
import { goodnessColor, METRICS, type MetricKey } from '../lib/metrics'

interface RiskLegendProps {
  metric: MetricKey
}

const LEGEND_ORDER: RiskTier[] = [
  'highGrade',
  'upperMedium',
  'lowerMedium',
  'speculative',
  'substantialRisk',
  'default',
]

const GRADIENT_SAMPLES = 6

function RatingLegend() {
  return (
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
  )
}

function GradientLegend({ metric }: { metric: MetricKey }) {
  const def = METRICS[metric]
  const stops = Array.from({ length: GRADIENT_SAMPLES }, (_, i) =>
    goodnessColor(i / (GRADIENT_SAMPLES - 1)),
  )
  return (
    <div>
      <div
        className="h-2.5 w-36 rounded-full"
        style={{ backgroundImage: `linear-gradient(to right, ${stops.join(', ')})` }}
      />
      <div className="mt-1 flex justify-between text-[11px] text-[var(--text)]">
        <span>{def.legend.bad}</span>
        <span>{def.legend.good}</span>
      </div>
    </div>
  )
}

export function RiskLegend({ metric }: RiskLegendProps) {
  const def = METRICS[metric]
  return (
    <div className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-2.5 backdrop-blur-md">
      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
        {def.label}
      </p>
      {metric === 'rating' ? <RatingLegend /> : <GradientLegend metric={metric} />}
    </div>
  )
}
