import {
  Banknote,
  Building2,
  Globe2,
  Scale,
  ShieldCheck,
} from 'lucide-react'

const PILLARS = [
  {
    icon: Building2,
    title: 'Domestic economy',
    body: 'Growth momentum, income levels, and economic diversification that underpin a sovereign\u2019s capacity to service debt.',
  },
  {
    icon: Banknote,
    title: 'Public finances',
    body: 'Fiscal deficits, the debt-to-GDP trajectory, and debt affordability given the interest burden.',
  },
  {
    icon: Globe2,
    title: 'External position',
    body: 'Current-account balance, external debt, and reserve buffers against currency and funding shocks.',
  },
  {
    icon: ShieldCheck,
    title: 'Financial stability',
    body: 'Banking-sector resilience and monetary-policy credibility that contain contagion risk.',
  },
  {
    icon: Scale,
    title: 'Governance & ESG',
    body: 'Political stability, rule of law, and institutional quality that shape the willingness to pay.',
  },
]

export function Methodology() {
  return (
    <section
      id="methodology"
      className="border-t border-[var(--surface-border)] bg-[var(--bg)] px-5 py-20"
    >
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          Methodology
        </p>
        <h2 className="mt-2 max-w-3xl text-3xl font-bold tracking-tight text-[var(--text-strong)] sm:text-4xl">
          What sovereign risk measures
        </h2>
        <p className="mt-4 max-w-3xl text-[var(--text-muted)]">
          Sovereign risk is the probability that a national government defaults on
          its debt obligations — or imposes measures that erode their value. Our
          rating blends a country&rsquo;s <strong className="text-[var(--text)]">ability to pay</strong>,
          driven by economic and fiscal strength, with its{' '}
          <strong className="text-[var(--text)]">willingness to pay</strong>, shaped
          by politics and governance. Scores are continuously revised against major{' '}
          news and incidents, then mapped to an agency-style scale from AAA to D.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-2xl border border-[var(--surface-border)] bg-[var(--bg-elevated)] p-5"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]">
                <pillar.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-semibold text-[var(--text-strong)]">
                {pillar.title}
              </h3>
              <p className="mt-1.5 text-sm text-[var(--text-muted)]">{pillar.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
