import { NavLink } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'
import { ChainSelector } from '@/components/common/ChainSelector'
import { ConnectButton } from '@/components/common/ConnectButton'

export function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
      <div className="content-width flex items-center justify-between h-16">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Morpho Tools</h1>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-all hover:scale-110 active:scale-95 cursor-pointer"
            title={`Current: ${theme}`}
          >
            {theme === 'dark' ? (
              <svg className="w-5 h-5 text-[var(--text-secondary)] hover:text-yellow-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-[var(--text-secondary)] hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
        </div>

        <nav className="flex items-center gap-8">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `py-4 text-base font-semibold border-b-2 transition-colors ${
                isActive
                  ? 'text-[var(--text-primary)] border-[var(--accent)]'
                  : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)]'
              }`
            }
          >
            Markets
          </NavLink>
          <NavLink
            to="/positions"
            className={({ isActive }) =>
              `py-4 text-base font-semibold border-b-2 transition-colors ${
                isActive
                  ? 'text-[var(--text-primary)] border-[var(--accent)]'
                  : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)]'
              }`
            }
          >
            Positions
          </NavLink>
          <NavLink
            to="/rewards"
            className={({ isActive }) =>
              `py-4 text-base font-semibold border-b-2 transition-colors ${
                isActive
                  ? 'text-[var(--text-primary)] border-[var(--accent)]'
                  : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)]'
              }`
            }
          >
            Rewards
          </NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <ChainSelector />
          <ConnectButton />
        </div>
      </div>
    </header>
  )
}
