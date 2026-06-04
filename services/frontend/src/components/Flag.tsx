import { Globe2 } from 'lucide-react'

interface FlagProps {
  /** ISO 3166-1 alpha-2 code (any case); empty renders a neutral placeholder. */
  iso2: string
  /** Country name, used for the accessible label. */
  name: string
  /** Rendered flag height in pixels; width follows the 4:3 ratio. */
  height?: number
  className?: string
}

const FLAG_RATIO = 4 / 3
const DEFAULT_HEIGHT = 18

/**
 * Renders a real country flag from the static `flag-icons` SVG set (keyed by
 * ISO alpha-2). Emoji flags are avoided because they render as bare letters on
 * platforms without regional-indicator glyphs (e.g. Windows). Falls back to a
 * neutral globe glyph when the code is missing or unknown.
 */
export function Flag({ iso2, name, height = DEFAULT_HEIGHT, className = '' }: FlagProps) {
  const code = iso2.trim().toLowerCase()
  const dimensions = { height, width: Math.round(height * FLAG_RATIO) }

  if (!code) {
    return (
      <span
        style={dimensions}
        className={`inline-flex shrink-0 items-center justify-center rounded-[3px] bg-[var(--surface-border)] text-[var(--text-muted)] ring-1 ring-black/10 ${className}`}
        role="img"
        aria-label={`${name} (no flag available)`}
      >
        <Globe2 style={{ height: height * 0.6, width: height * 0.6 }} />
      </span>
    )
  }

  return (
    <span
      style={dimensions}
      className={`fi fi-${code} shrink-0 rounded-[3px] ring-1 ring-black/10 ${className}`}
      role="img"
      aria-label={`${name} flag`}
    />
  )
}
