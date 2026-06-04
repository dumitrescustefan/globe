import rawDatabase from './sovereign-risk.yaml'
import type { CountryRisk, SovereignRiskDatabase } from './types'

/**
 * Loads and lightly validates the YAML-backed sovereign-risk database. The YAML
 * is imported as a plain object (via @modyfi/vite-plugin-yaml) and asserted into
 * our typed shape. Validation here is intentionally defensive: a malformed entry
 * should fail fast in development rather than render garbage.
 */

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`[sovereignData] ${message}`)
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * YAML timestamp values (unquoted YYYY-MM-DD) deserialize to JS Date objects.
 * Normalize any such value back to an ISO date string so the data matches our
 * string-typed model and stays safe to render directly.
 */
function toIsoDate(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10)
  }
  return String(value)
}

function validateEntry(key: string, entry: unknown): CountryRisk {
  assert(isRecord(entry), `entry "${key}" is not an object`)
  assert(typeof entry.iso_a3 === 'string', `entry "${key}" missing iso_a3`)
  assert(typeof entry.name === 'string', `entry "${key}" missing name`)
  assert(typeof entry.rating === 'string', `entry "${key}" missing rating`)
  assert(isRecord(entry.categories), `entry "${key}" missing categories`)
  assert(isRecord(entry.metrics), `entry "${key}" missing metrics`)
  assert(Array.isArray(entry.news), `entry "${key}" missing news`)
  assert(Array.isArray(entry.sources), `entry "${key}" missing sources`)

  const country = entry as unknown as CountryRisk
  country.lastUpdated = toIsoDate(country.lastUpdated)
  country.news = country.news.map((item) => ({ ...item, date: toIsoDate(item.date) }))
  return country
}

function loadDatabase(): SovereignRiskDatabase {
  assert(isRecord(rawDatabase), 'YAML root must be a mapping of ISO_A3 to country')
  const db: SovereignRiskDatabase = {}
  for (const [key, value] of Object.entries(rawDatabase)) {
    db[key] = validateEntry(key, value)
  }
  return db
}

export const sovereignDatabase: SovereignRiskDatabase = loadDatabase()

export function getCountryByIso3(iso3: string | null | undefined): CountryRisk | null {
  if (!iso3) {
    return null
  }
  return sovereignDatabase[iso3] ?? null
}

export const allCountries: CountryRisk[] = Object.values(sovereignDatabase).sort((a, b) =>
  a.name.localeCompare(b.name),
)
