/**
 * Strict domain model for the sovereign-risk database. These shapes mirror the
 * structure of `sovereign-risk.yaml` and are validated at load time in
 * `loadSovereignData` so the rest of the app can rely on them.
 */

export type DataQuality = 'real' | 'estimated'

export type RatingOutlook = 'positive' | 'stable' | 'negative'

/** Direction a news item pushes the sovereign-risk assessment. */
export type NewsImpact = 'positive' | 'neutral' | 'negative'

/** Five rating categories, aligned with mainstream sovereign methodologies. */
export interface RiskCategories {
  /** Growth, diversification, income levels. */
  domesticEconomic: number
  /** Deficits, debt burden, debt affordability. */
  publicFinance: number
  /** Current account, external debt, reserves. */
  external: number
  /** Banking-sector health and monetary credibility. */
  financialStability: number
  /** Governance, political stability, ESG. */
  esgPolitical: number
}

/** Headline macro indicators surfaced in the detail panel. */
export interface CountryMetrics {
  /** Real GDP growth, percent. */
  gdpGrowth: number
  /** General government gross debt, percent of GDP. */
  debtToGdp: number
  /** Consumer price inflation, percent. */
  inflation: number
  /** General government fiscal balance, percent of GDP (negative = deficit). */
  fiscalBalance: number
  /** Current-account balance, percent of GDP. */
  currentAccount: number
}

export interface NewsItem {
  /** ISO date (YYYY-MM-DD). */
  date: string
  headline: string
  impact: NewsImpact
}

export interface SourceLink {
  label: string
  url: string
}

export interface CountryRisk {
  iso_a2: string
  iso_a3: string
  name: string
  region: string
  /** Emoji flag derived from the ISO_A2 code. */
  flag: string
  /** Agency-style letter rating, e.g. "AA-" or "B+". */
  rating: string
  outlook: RatingOutlook
  /** Numeric index on a 0 (default) to 20 (AAA) scale. */
  scoreIndex: number
  categories: RiskCategories
  metrics: CountryMetrics
  news: NewsItem[]
  lastUpdated: string
  sources: SourceLink[]
  dataQuality: DataQuality
}

/** The YAML file deserializes into a record keyed by ISO_A3. */
export type SovereignRiskDatabase = Record<string, CountryRisk>
