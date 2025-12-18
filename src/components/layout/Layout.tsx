import type { ReactNode } from 'react'
import { Header } from './Header'
import { Footer } from './Footer'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
      <Header />
      <main className="content-width pt-6 flex-1">{children}</main>
      <div style={{ height: '16px' }} />
      <Footer />
    </div>
  )
}
