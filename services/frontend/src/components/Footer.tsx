export function Footer() {
  return (
    <footer className="border-t border-[var(--surface-border)] bg-[var(--bg)] px-5 py-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-center text-xs text-[var(--text-muted)] sm:flex-row sm:text-left">
        <p>
          &copy; {new Date().getFullYear()} SovereignRisk Global Monitor. Prototype.
        </p>
        <p className="max-w-xl">
          Ratings and indicators shown here are illustrative. Curated entries use
          approximate IMF, World Bank, and rating-agency figures; remaining
          countries are model-generated. Not investment advice.
        </p>
      </div>
    </footer>
  )
}
