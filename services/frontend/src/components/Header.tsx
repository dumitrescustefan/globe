import { Globe } from 'lucide-react'
import type { Theme } from '../hooks/useTheme'
import { ThemeToggle } from './ThemeToggle'

interface HeaderProps {
  theme: Theme
  onToggleTheme: () => void
}

const NAV_LINKS = [
  { label: 'Globe', href: '#globe' },
  { label: 'Methodology', href: '#methodology' },
  { label: 'Research', href: '#research' },
]

export function Header({ theme, onToggleTheme }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--surface-border)] bg-[var(--bg)]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <a href="#globe" className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--accent)] text-[var(--accent-contrast)]">
            <Globe className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-bold tracking-tight text-[var(--text-strong)]">
              Sovereign<span className="text-[var(--accent)]">Risk</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Global Monitor
            </span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--text-muted)] transition hover:bg-[var(--surface-border)] hover:text-[var(--text-strong)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#research"
            className="hidden rounded-lg bg-[var(--accent)] px-3.5 py-2 text-sm font-semibold text-[var(--accent-contrast)] transition hover:opacity-90 sm:inline-flex"
          >
            Request report
          </a>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  )
}
