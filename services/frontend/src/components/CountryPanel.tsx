import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarClock,
  ExternalLink,
  Globe2,
  Landmark,
  MousePointerClick,
  Newspaper,
  TrendingUp,
  X,
} from 'lucide-react'
import type { CountryRisk, NewsImpact } from '../data/types'
import { MAX_SCORE_INDEX, OUTLOOK_META, tierMetaForRating } from '../lib/rating'
import { Flag } from './Flag'

interface CountryPanelProps {
  country: CountryRisk | null
  onClose: () => void
}

const CATEGORY_LABELS: Record<keyof CountryRisk['categories'], string> = {
  domesticEconomic: 'Domestic economy',
  publicFinance: 'Public finances',
  external: 'External position',
  financialStability: 'Financial stability',
  esgPolitical: 'Governance & ESG',
}

const SCORE_BAR_PERCENT = 100

function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

function barColor(score: number): string {
  if (score >= 70) return 'bg-emerald-500'
  if (score >= 50) return 'bg-lime-500'
  if (score >= 35) return 'bg-amber-500'
  if (score >= 20) return 'bg-orange-500'
  return 'bg-red-500'
}

const IMPACT_DOT: Record<NewsImpact, string> = {
  positive: 'bg-emerald-400',
  neutral: 'bg-slate-400',
  negative: 'bg-red-400',
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-8 text-center">
      <div className="rounded-2xl bg-[var(--accent)]/10 p-4 text-[var(--accent)]">
        <MousePointerClick className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-semibold text-[var(--text-strong)]">
        Select a country
      </h3>
      <p className="max-w-xs text-sm text-[var(--text-muted)]">
        Click any country on the globe to pause rotation and reveal its sovereign
        risk rating, macro indicators, and the incidents shaping its outlook.
      </p>
    </div>
  )
}

export function CountryPanel({ country, onClose }: CountryPanelProps) {
  if (!country) {
    return <EmptyState />
  }

  const tier = tierMetaForRating(country.rating)
  const outlook = OUTLOOK_META[country.outlook]
  const scorePercent = (country.scoreIndex / MAX_SCORE_INDEX) * SCORE_BAR_PERCENT

  const metricItems = [
    { label: 'GDP growth', value: formatPercent(country.metrics.gdpGrowth), icon: TrendingUp },
    { label: 'Debt / GDP', value: `${country.metrics.debtToGdp.toFixed(0)}%`, icon: Landmark },
    { label: 'Inflation', value: formatPercent(country.metrics.inflation), icon: ArrowUpRight },
    { label: 'Fiscal balance', value: formatPercent(country.metrics.fiscalBalance), icon: ArrowDownRight },
    { label: 'Current account', value: formatPercent(country.metrics.currentAccount), icon: Globe2 },
  ]

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-start justify-between gap-3 border-b border-[var(--surface-border)] px-5 py-4">
        <div className="flex items-center gap-3">
          <Flag iso2={country.iso_a2} name={country.name} height={28} />
          <div>
            <h2 className="text-lg font-bold text-[var(--text-strong)]">
              {country.name}
            </h2>
            <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
              {country.region}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Clear selection"
          className="rounded-lg p-1.5 text-[var(--text-muted)] transition hover:bg-[var(--surface-border)] hover:text-[var(--text-strong)]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="scroll-slim flex-1 overflow-y-auto px-5 py-5">
        <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--bg-elevated)] p-4">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
                Sovereign rating
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="font-mono text-4xl font-bold text-[var(--text-strong)]">
                  {country.rating}
                </span>
                <span className={`text-sm font-medium ${outlook.className}`}>
                  {outlook.symbol} {outlook.label}
                </span>
              </div>
            </div>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tier.badgeClasses}`}
            >
              {tier.label}
            </span>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Risk index</span>
              <span className="font-mono text-[var(--text-strong)]">
                {country.scoreIndex} / {MAX_SCORE_INDEX}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--surface-border)]">
              <div
                className={`h-full rounded-full ${barColor((scorePercent))}`}
                style={{ width: `${scorePercent}%` }}
              />
            </div>
          </div>
        </div>

        <section className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-[var(--text-strong)]">
            Rating drivers
          </h3>
          <div className="space-y-3">
            {(
              Object.keys(CATEGORY_LABELS) as Array<keyof CountryRisk['categories']>
            ).map((key) => {
              const score = country.categories[key]
              return (
                <div key={key}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text)]">{CATEGORY_LABELS[key]}</span>
                    <span className="font-mono text-[var(--text-muted)]">{score}</span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[var(--surface-border)]">
                    <div
                      className={`h-full rounded-full ${barColor(score)}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-[var(--text-strong)]">
            Key indicators
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            {metricItems.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-[var(--surface-border)] bg-[var(--bg-elevated)] p-3"
              >
                <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                  <item.icon className="h-3.5 w-3.5" />
                  <span className="text-[11px] uppercase tracking-wide">
                    {item.label}
                  </span>
                </div>
                <p className="mt-1 font-mono text-base font-semibold text-[var(--text-strong)]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-strong)]">
            <Newspaper className="h-4 w-4" />
            News & incidents
          </h3>
          <ul className="space-y-3">
            {country.news.map((item, index) => (
              <li key={index} className="flex gap-3">
                <span
                  className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${IMPACT_DOT[item.impact]}`}
                  aria-hidden
                />
                <div>
                  <p className="text-sm leading-snug text-[var(--text)]">
                    {item.headline}
                  </p>
                  <time className="text-xs text-[var(--text-muted)]">{item.date}</time>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6 border-t border-[var(--surface-border)] pt-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)]">
            <span
              className={`rounded-full px-2 py-0.5 font-medium ${
                country.dataQuality === 'real'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-slate-500/10 text-slate-400'
              }`}
            >
              {country.dataQuality === 'real' ? 'Sourced data' : 'Modeled estimate'}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarClock className="h-3.5 w-3.5" />
              Updated {country.lastUpdated}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {country.sources.map((source) => (
              <a
                key={source.url}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-[var(--surface-border)] px-2 py-1 text-xs text-[var(--text)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {source.label}
                <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
