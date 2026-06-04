import { useMemo, useState } from 'react'
import { Header } from './components/Header'
import { RiskGlobe } from './components/RiskGlobe'
import { RiskLegend } from './components/RiskLegend'
import { CountryPanel } from './components/CountryPanel'
import { Methodology } from './components/Methodology'
import { SalesSection } from './components/SalesSection'
import { Footer } from './components/Footer'
import { useTheme } from './hooks/useTheme'
import { getCountryByIso3, sovereignDatabase } from './data/sovereignData'

function App() {
  const { theme, toggleTheme } = useTheme()
  const [selectedIso3, setSelectedIso3] = useState<string | null>(null)

  const selectedCountry = useMemo(
    () => getCountryByIso3(selectedIso3),
    [selectedIso3],
  )
  const countryCount = useMemo(
    () => Object.keys(sovereignDatabase).length,
    [],
  )

  return (
    <div className="flex min-h-screen flex-col">
      <Header theme={theme} onToggleTheme={toggleTheme} />

      <main className="flex-1">
        <section
          id="globe"
          className="border-b border-[var(--surface-border)] bg-[var(--bg-globe)]"
        >
          <div className="mx-auto max-w-7xl px-5 pb-6 pt-10">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--surface-border)] bg-[var(--surface)] px-3 py-1 text-xs font-medium text-[var(--text-muted)] backdrop-blur">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Live sovereign risk across {countryCount} countries
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-[var(--text-strong)] sm:text-5xl">
                Country-level sovereign risk, on a globe
              </h1>
              <p className="mt-3 max-w-xl text-[var(--text-muted)]">
                Spin the globe and select any country to pause rotation and inspect
                its rating, macro indicators, and the incidents driving its outlook.
              </p>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-[7fr_3fr]">
              <div className="relative h-[clamp(420px,68vh,760px)] overflow-hidden rounded-3xl border border-[var(--surface-border)] bg-[var(--bg-globe)]">
                <RiskGlobe
                  selectedIso3={selectedIso3}
                  onSelect={setSelectedIso3}
                  theme={theme}
                />
                <RiskLegend />
              </div>

              <aside className="h-[clamp(420px,68vh,760px)] overflow-hidden rounded-3xl border border-[var(--surface-border)] bg-[var(--surface)] backdrop-blur-xl">
                <CountryPanel
                  country={selectedCountry}
                  onClose={() => setSelectedIso3(null)}
                />
              </aside>
            </div>
          </div>
        </section>

        <Methodology />
        <SalesSection />
      </main>

      <Footer />
    </div>
  )
}

export default App
