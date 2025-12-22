import { NavLink as RouterNavLink } from 'react-router-dom'
import { useTheme } from '@/hooks/useTheme'
import { ChainSelector } from '@/components/common/ChainSelector'
import { ConnectButton } from '@/components/common/ConnectButton'
import { Button } from '@/components/ui/button'

const Logo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 512 512" fill="currentColor">
    <path d="M311.96 258.5L105.55 484l-30-28.31L288.92 236.7zM139.77 417.7a7.41 7.41 0 1 0 .3 10.47 7.41 7.41 0 0 0-.3-10.47zm23.74-25.14a7.41 7.41 0 1 0 .3 10.47 7.41 7.41 0 0 0-.29-10.44zm23.76-25.11a7.41 7.41 0 1 0 .3 10.47 7.41 7.41 0 0 0-.3-10.47zm23.74-25.15a7.41 7.41 0 1 0 .3 10.47 7.41 7.41 0 0 0-.3-10.47zm23.76-25.14a7.41 7.41 0 1 0 .3 10.47 7.41 7.41 0 0 0-.3-10.47zm23.74-25.14a7.41 7.41 0 1 0 .3 10.47 7.41 7.41 0 0 0-.31-10.47zm23.74-25.14a7.41 7.41 0 1 0 .3 10.47 7.41 7.41 0 0 0-.3-10.47zM52.67 433.13l-28.26-30 225.85-206 21.71 23.02zm36.9-63.05a7.41 7.41 0 1 0-.32 10.47 7.41 7.41 0 0 0 .33-10.47zm25.2-23.7a7.41 7.41 0 1 0-.32 10.47 7.41 7.41 0 0 0 .32-10.47zm25.17-23.68a7.41 7.41 0 1 0-.32 10.47 7.41 7.41 0 0 0 .32-10.47zm25.18-23.7a7.41 7.41 0 1 0-.32 10.47 7.41 7.41 0 0 0 .32-10.5zm25.18-23.7a7.41 7.41 0 1 0-.32 10.47 7.41 7.41 0 0 0 .32-10.5zm25.18-23.7a7.41 7.41 0 1 0-.32 10.47 7.41 7.41 0 0 0 .32-10.51zm25.18-23.7a7.41 7.41 0 1 0-.32 10.47 7.41 7.41 0 0 0 .32-10.51zm63.89 1.63c12.87-10.8 25.09-20.92 37-30.79C425.04 129.57 475.68 87.63 487.59 28c-8.36 6.7-63.45 50.38-92.82 58.58l-114 119.47z"/>
  </svg>
)

const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
)

interface NavLinkProps {
  to: string
  children: React.ReactNode
  variant?: 'desktop' | 'mobile'
}

function NavLink({ to, children, variant = 'desktop' }: NavLinkProps) {
  const baseClass = 'font-semibold border-b-2 transition-colors text-lg'
  const paddingClass = variant === 'desktop' ? 'py-4' : 'py-3'
  const hoverClass = variant === 'desktop' ? 'hover:text-[var(--text-primary)] hover:border-[var(--text-secondary)]' : ''

  return (
    <RouterNavLink
      to={to}
      className={({ isActive }) =>
        `${baseClass} ${paddingClass} ${
          isActive
            ? 'text-[var(--text-primary)] border-[var(--accent)]'
            : `text-[var(--text-secondary)] border-transparent ${hoverClass}`
        }`
      }
    >
      {children}
    </RouterNavLink>
  )
}

const navItems = [
  { to: '/', label: 'Markets' },
  { to: '/positions', label: 'Positions' },
  { to: '/rewards', label: 'Rewards' },
]

export function Header() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="border-b border-[var(--border)] bg-[var(--bg-secondary)]">
      {/* Desktop Header */}
      <div className="content-width hidden md:flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8 text-[var(--accent)]" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Morpho Tools</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hover:scale-110"
            title={`Current: ${theme}`}
          >
            <span className="text-[var(--text-secondary)] hover:text-[var(--theme-toggle-hover)] transition-colors">
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </span>
          </Button>
        </div>

        <nav className="flex items-center gap-8">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} variant="desktop">
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ChainSelector />
          <ConnectButton />
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-1.5">
            <Logo className="w-6 h-6 text-[var(--accent)]" />
            <h1 className="text-lg font-bold text-[var(--text-primary)]">Morpho Tools</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              <span className="text-[var(--text-secondary)]">
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </span>
            </Button>
            <ChainSelector />
            <ConnectButton />
          </div>
        </div>
        <nav className="flex items-center justify-center gap-8 border-t border-[var(--border)] px-4">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} variant="mobile">
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
