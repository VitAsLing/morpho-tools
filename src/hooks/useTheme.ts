import { useState, useEffect, useCallback } from 'react'

type Theme = 'light' | 'dark'

const THEME_KEY = 'morpho-tools-theme'

function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem(THEME_KEY)
  if (stored === 'light' || stored === 'dark') {
    return stored
  }
  return 'dark'
}

function applyTheme(theme: Theme) {
  const root = document.documentElement

  root.classList.add('theme-transition')

  if (theme === 'light') {
    root.classList.add('light')
  } else {
    root.classList.remove('light')
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.classList.remove('theme-transition')
    })
  })
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getStoredTheme)

  useEffect(() => {
    applyTheme(theme)
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme, setTheme }
}
