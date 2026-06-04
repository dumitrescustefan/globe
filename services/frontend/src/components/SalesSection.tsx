import { useState } from 'react'
import { ArrowRight, CheckCircle2, FileText, Mail } from 'lucide-react'

const REPORT_FEATURES = [
  'Full-length country reports with 10-year risk trajectories',
  'Scenario analysis and early-warning fiscal stress signals',
  'Analyst access and bespoke research on request',
]

const CONTACT_EMAIL = 'research@sovereignrisk.example'

export function SalesSection() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // Prototype: no backend. Surface intent and hand off to email.
    setSubmitted(true)
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
      'Full-length sovereign risk report request',
    )}&body=${encodeURIComponent(`Please contact me at ${email}.`)}`
  }

  return (
    <section
      id="research"
      className="border-t border-[var(--surface-border)] bg-[var(--bg-elevated)] px-5 py-20"
    >
      <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
            Research & sales
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--text-strong)] sm:text-4xl">
            Contact us for the full-length report and research
          </h2>
          <p className="mt-4 text-[var(--text-muted)]">
            The globe shows headline ratings. Our subscription desk delivers the
            full analysis behind every score, refreshed as events unfold.
          </p>
          <ul className="mt-6 space-y-3">
            {REPORT_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-[var(--text)]">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-[var(--surface-border)] bg-[var(--bg)] p-6">
          <div className="mb-4 flex items-center gap-2 text-[var(--text-strong)]">
            <FileText className="h-5 w-5 text-[var(--accent)]" />
            <span className="font-semibold">Request the full report</span>
          </div>
          {submitted ? (
            <div className="flex items-start gap-2.5 rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-400">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                Thanks — your email client is opening. You can also reach us
                directly at {CONTACT_EMAIL}.
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="block text-sm font-medium text-[var(--text)]" htmlFor="work-email">
                Work email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  id="work-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@institution.com"
                  className="w-full rounded-xl border border-[var(--surface-border)] bg-[var(--bg-elevated)] py-2.5 pl-9 pr-3 text-sm text-[var(--text-strong)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--ring)]"
                />
              </div>
              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-[var(--accent-contrast)] transition hover:opacity-90"
              >
                Contact sales
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="text-center text-xs text-[var(--text-muted)]">
                Or email us at {CONTACT_EMAIL}
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
