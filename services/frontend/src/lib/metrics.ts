import type { CountryRisk } from '../data/types'
import { colorForRating, MAX_SCORE_INDEX, MIN_SCORE_INDEX } from './rating'

/**
 * Globe metrics: the six dimensions the globe can be colored and ranked by.
 * Each metric defines its numeric domain, whether a higher value is "better"
 * (lower sovereign risk), and how to render its value. Coloring maps every
 * value onto a shared red -> amber -> green goodness gradient, except the
 * sovereign rating which reuses the discrete tier palette.
 */

export type MetricKey =
  | 'rating'
  | 'gdpGrowth'
  | 'inflation'
  | 'fiscalBalance'
  | 'currentAccount'
  | 'debtToGdp'

export interface MetricDef {
  key: MetricKey
  /** Full label for the panel heading. */
  label: string
  /** Compact label for the radio selector. */
  shortLabel: string
  /** One-line explanation surfaced under the overview heading. */
  description: string
  /** Lowest value of the color/ranking domain (values are clamped to it). */
  min: number
  /** Highest value of the color/ranking domain (values are clamped to it). */
  max: number
  /** When true, larger values are healthier (lower risk). */
  higherIsBetter: boolean
  /** Numeric value used for coloring and ranking. */
  value: (country: CountryRisk) => number
  /** Human-readable value for the panel/list. */
  display: (country: CountryRisk) => string
  /** Labels for the two ends of the legend gradient. */
  legend: { good: string; bad: string }
}

/** Gradient stops, worst (0) to best (1): red -> amber -> emerald. */
const GRADIENT_STOPS: ReadonlyArray<{ at: number; color: [number, number, number] }> = [
  { at: 0, color: [239, 68, 68] },
  { at: 0.5, color: [234, 179, 8] },
  { at: 1, color: [45, 212, 167] },
]

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value))
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (v: number) => Math.round(v).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

/** Interpolate the goodness gradient at t in [0,1]. */
export function goodnessColor(t: number): string {
  const clamped = clamp01(t)
  for (let i = 1; i < GRADIENT_STOPS.length; i++) {
    const prev = GRADIENT_STOPS[i - 1]
    const next = GRADIENT_STOPS[i]
    if (clamped <= next.at) {
      const span = next.at - prev.at
      const local = span === 0 ? 0 : (clamped - prev.at) / span
      return rgbToHex(
        lerp(prev.color[0], next.color[0], local),
        lerp(prev.color[1], next.color[1], local),
        lerp(prev.color[2], next.color[2], local),
      )
    }
  }
  const last = GRADIENT_STOPS[GRADIENT_STOPS.length - 1].color
  return rgbToHex(last[0], last[1], last[2])
}

function formatSignedPercent(value: number): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}

export const METRICS: Record<MetricKey, MetricDef> = {
  rating: {
    key: 'rating',
    label: 'Sovereign rating',
    shortLabel: 'Sovereign rating',
    description: 'Agency-style creditworthiness, from AAA (lowest risk) to D.',
    min: MIN_SCORE_INDEX,
    max: MAX_SCORE_INDEX,
    higherIsBetter: true,
    value: (country) => country.scoreIndex,
    display: (country) => country.rating,
    legend: { good: 'AAA', bad: 'D' },
  },
  gdpGrowth: {
    key: 'gdpGrowth',
    label: 'GDP growth',
    shortLabel: 'GDP growth',
    description: 'Real GDP growth, percent. Faster growth lowers risk.',
    min: -2,
    max: 7,
    higherIsBetter: true,
    value: (country) => country.metrics.gdpGrowth,
    display: (country) => formatSignedPercent(country.metrics.gdpGrowth),
    legend: { good: 'High', bad: 'Contracting' },
  },
  inflation: {
    key: 'inflation',
    label: 'Inflation',
    shortLabel: 'Inflation',
    description: 'Consumer price inflation, percent. Lower and stable is healthier.',
    min: 0,
    max: 15,
    higherIsBetter: false,
    value: (country) => country.metrics.inflation,
    display: (country) => `${country.metrics.inflation.toFixed(1)}%`,
    legend: { good: 'Low', bad: 'High' },
  },
  fiscalBalance: {
    key: 'fiscalBalance',
    label: 'Fiscal balance',
    shortLabel: 'Fiscal balance',
    description: 'Government balance, percent of GDP. Surpluses lower risk.',
    min: -8,
    max: 2,
    higherIsBetter: true,
    value: (country) => country.metrics.fiscalBalance,
    display: (country) => formatSignedPercent(country.metrics.fiscalBalance),
    legend: { good: 'Surplus', bad: 'Deficit' },
  },
  currentAccount: {
    key: 'currentAccount',
    label: 'Current account',
    shortLabel: 'Current account',
    description: 'Current-account balance, percent of GDP. Surpluses lower risk.',
    min: -8,
    max: 8,
    higherIsBetter: true,
    value: (country) => country.metrics.currentAccount,
    display: (country) => formatSignedPercent(country.metrics.currentAccount),
    legend: { good: 'Surplus', bad: 'Deficit' },
  },
  debtToGdp: {
    key: 'debtToGdp',
    label: 'Debt-to-GDP',
    shortLabel: 'Debt / GDP',
    description: 'Gross government debt, percent of GDP. Lower debt lowers risk.',
    min: 20,
    max: 150,
    higherIsBetter: false,
    value: (country) => country.metrics.debtToGdp,
    display: (country) => `${country.metrics.debtToGdp.toFixed(0)}%`,
    legend: { good: 'Low', bad: 'High' },
  },
}

export const METRIC_ORDER: readonly MetricKey[] = [
  'rating',
  'gdpGrowth',
  'inflation',
  'fiscalBalance',
  'currentAccount',
  'debtToGdp',
]

export const DEFAULT_METRIC: MetricKey = 'rating'

/** Normalized goodness in [0,1]: 1 = healthiest end of the metric domain. */
export function metricGoodness(metric: MetricDef, country: CountryRisk): number {
  const raw = metric.value(country)
  const span = metric.max - metric.min
  const norm = span === 0 ? 0 : clamp01((raw - metric.min) / span)
  return metric.higherIsBetter ? norm : 1 - norm
}

/** Color for a country on the globe under the given metric. */
export function colorForMetric(metric: MetricDef, country: CountryRisk): string {
  if (metric.key === 'rating') {
    return colorForRating(country.rating)
  }
  return goodnessColor(metricGoodness(metric, country))
}

/**
 * Rank countries best-first for the active metric. Ties break alphabetically by
 * name so the ordering is stable and easy to scan.
 */
export function rankByMetric(metric: MetricDef, countries: CountryRisk[]): CountryRisk[] {
  return [...countries].sort((a, b) => {
    const diff = metric.value(b) - metric.value(a)
    const ordered = metric.higherIsBetter ? diff : -diff
    if (ordered !== 0) {
      return ordered
    }
    return a.name.localeCompare(b.name)
  })
}
