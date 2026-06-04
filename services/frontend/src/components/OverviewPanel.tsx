import { BarChart3 } from 'lucide-react'
import { Flag } from './Flag'
import type { CountryRisk } from '../data/types'
import {
  colorForMetric,
  metricGoodness,
  rankByMetric,
  type MetricDef,
} from '../lib/metrics'

interface OverviewPanelProps {
  metric: MetricDef
  countries: CountryRisk[]
  onSelect: (iso3: string) => void
}

const BAR_MIN_FRACTION = 0.04

export function OverviewPanel({ metric, countries, onSelect }: OverviewPanelProps) {
  const ranked = rankByMetric(metric, countries)

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start gap-3 border-b border-[var(--surface-border)] px-5 py-4">
        <div className="rounded-xl bg-[var(--accent)]/10 p-2 text-[var(--accent)]">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[var(--text-strong)]">
            {metric.label}
          </h2>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            {metric.description}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between px-5 pb-1 pt-3 text-[11px] uppercase tracking-wider text-[var(--text-muted)]">
        <span>Ranked best to worst</span>
        <span>{ranked.length} countries</span>
      </div>

      <ol className="scroll-slim flex-1 overflow-y-auto px-3 pb-4">
        {ranked.map((country, index) => {
          const goodness = metricGoodness(metric, country)
          const color = colorForMetric(metric, country)
          const barFraction = Math.max(BAR_MIN_FRACTION, goodness)
          return (
            <li key={country.iso_a3}>
              <button
                type="button"
                onClick={() => onSelect(country.iso_a3)}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-[var(--bg-elevated)]"
              >
                <span className="w-6 shrink-0 text-right font-mono text-xs text-[var(--text-muted)]">
                  {index + 1}
                </span>
                <Flag iso2={country.iso_a2} name={country.name} height={16} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-sm font-medium text-[var(--text)]">
                      {country.name}
                    </span>
                    <span className="shrink-0 font-mono text-xs font-semibold text-[var(--text-strong)]">
                      {metric.display(country)}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--surface-border)]">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${barFraction * 100}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
