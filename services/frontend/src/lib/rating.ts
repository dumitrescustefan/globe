import type { RatingOutlook } from '../data/types'

/**
 * Sovereign rating helpers: convert agency-style letter grades into a 0-20
 * numeric index, bucket them into risk tiers, and map tiers to colors used by
 * both the globe polygons and the UI badges.
 */

export const MIN_SCORE_INDEX = 0
export const MAX_SCORE_INDEX = 20

export type RiskTier =
  | 'highGrade'
  | 'upperMedium'
  | 'lowerMedium'
  | 'speculative'
  | 'substantialRisk'
  | 'default'
  | 'notRated'

interface TierMeta {
  label: string
  /** Hex color used for globe polygons (matches the --color-risk-* tokens). */
  color: string
  /** Tailwind utility classes for badges/pills. */
  badgeClasses: string
}

export const TIER_META: Record<RiskTier, TierMeta> = {
  highGrade: {
    label: 'High grade',
    color: '#2dd4a7',
    badgeClasses: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30',
  },
  upperMedium: {
    label: 'Upper medium',
    color: '#84cc16',
    badgeClasses: 'bg-lime-500/15 text-lime-400 ring-1 ring-lime-500/30',
  },
  lowerMedium: {
    label: 'Lower medium',
    color: '#eab308',
    badgeClasses: 'bg-yellow-500/15 text-yellow-400 ring-1 ring-yellow-500/30',
  },
  speculative: {
    label: 'Speculative',
    color: '#f59e0b',
    badgeClasses: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30',
  },
  substantialRisk: {
    label: 'Substantial risk',
    color: '#f97316',
    badgeClasses: 'bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30',
  },
  default: {
    label: 'Near / in default',
    color: '#ef4444',
    badgeClasses: 'bg-red-500/15 text-red-400 ring-1 ring-red-500/30',
  },
  notRated: {
    label: 'Not rated',
    color: '#64748b',
    badgeClasses: 'bg-slate-500/15 text-slate-400 ring-1 ring-slate-500/30',
  },
}

/** Canonical S&P-style scale, best to worst. */
export const RATING_ORDER: readonly string[] = [
  'AAA',
  'AA+',
  'AA',
  'AA-',
  'A+',
  'A',
  'A-',
  'BBB+',
  'BBB',
  'BBB-',
  'BB+',
  'BB',
  'BB-',
  'B+',
  'B',
  'B-',
  'CCC+',
  'CCC',
  'CCC-',
  'CC',
  'C',
  'D',
] as const

const TIER_BY_PREFIX: ReadonlyArray<{ prefixes: readonly string[]; tier: RiskTier }> = [
  { prefixes: ['AAA', 'AA'], tier: 'highGrade' },
  { prefixes: ['A'], tier: 'upperMedium' },
  { prefixes: ['BBB'], tier: 'lowerMedium' },
  { prefixes: ['BB', 'B'], tier: 'speculative' },
  { prefixes: ['CCC', 'CC'], tier: 'substantialRisk' },
  { prefixes: ['C', 'SD', 'RD', 'D'], tier: 'default' },
]

function normalizeRating(rating: string | null | undefined): string {
  return (rating ?? '').trim().toUpperCase()
}

export function tierForRating(rating: string | null | undefined): RiskTier {
  const value = normalizeRating(rating)
  if (value === '' || value === 'NR' || value === 'N/A') {
    return 'notRated'
  }
  for (const { prefixes, tier } of TIER_BY_PREFIX) {
    if (prefixes.some((prefix) => value.startsWith(prefix))) {
      return tier
    }
  }
  return 'notRated'
}

export function colorForRating(rating: string | null | undefined): string {
  return TIER_META[tierForRating(rating)].color
}

export function tierMetaForRating(rating: string | null | undefined): TierMeta {
  return TIER_META[tierForRating(rating)]
}

/**
 * Map a letter rating to the 0-20 index. Returns null for unrated entries so
 * callers can distinguish "no data" from a genuine low score.
 */
export function ratingToIndex(rating: string | null | undefined): number | null {
  const value = normalizeRating(rating)
  const position = RATING_ORDER.indexOf(value)
  if (position === -1) {
    return null
  }
  const lastIndex = RATING_ORDER.length - 1
  const ratio = (lastIndex - position) / lastIndex
  return Math.round(ratio * MAX_SCORE_INDEX)
}

export const OUTLOOK_META: Record<RatingOutlook, { label: string; symbol: string; className: string }> = {
  positive: { label: 'Positive', symbol: '\u25B2', className: 'text-emerald-400' },
  stable: { label: 'Stable', symbol: '\u25CF', className: 'text-slate-400' },
  negative: { label: 'Negative', symbol: '\u25BC', className: 'text-red-400' },
}
