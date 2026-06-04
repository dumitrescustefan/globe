import { METRIC_ORDER, METRICS, type MetricKey } from '../lib/metrics'

interface MetricSelectorProps {
  selected: MetricKey
  onSelect: (metric: MetricKey) => void
}

export function MetricSelector({ selected, onSelect }: MetricSelectorProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Color the globe by"
      className="flex flex-wrap items-center gap-2"
    >
      <span className="mr-1 text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
        Color by
      </span>
      {METRIC_ORDER.map((key) => {
        const metric = METRICS[key]
        const isActive = key === selected
        return (
          <button
            key={key}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onSelect(key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              isActive
                ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]'
                : 'border-[var(--surface-border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--accent)]/50 hover:text-[var(--text)]'
            }`}
          >
            {metric.shortLabel}
          </button>
        )
      })}
    </div>
  )
}
