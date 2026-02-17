import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'kuafor-theme'

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return 'dark'
    return (localStorage.getItem(STORAGE_KEY) || 'dark')
  })

  const setTheme = useCallback((value) => {
    const next = value === 'light' ? 'light' : 'dark'
    setThemeState(next)
    localStorage.setItem(STORAGE_KEY, next)
  }, [])

  useEffect(() => {
    const root = document.documentElement
    const body = document.body
    if (theme === 'dark') {
      root.classList.add('dark')
      root.style.setProperty('--color-background', '#0A0A0A')
      root.style.setProperty('--color-text', '#F5F5F5')
      root.style.setProperty('--color-accent', '#D4AF37')
      body.style.backgroundColor = '#0A0A0A'
      body.style.color = '#F5F5F5'
    } else {
      root.classList.remove('dark')
      root.style.setProperty('--color-background', '#FAFAFA')
      root.style.setProperty('--color-text', '#171717')
      root.style.setProperty('--color-accent', '#B8860B')
      body.style.backgroundColor = '#FAFAFA'
      body.style.color = '#171717'
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
