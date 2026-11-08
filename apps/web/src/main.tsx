import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App.tsx'
import { applyTheme, readTheme } from './theme/theme.ts'
import { ThemeProvider } from './theme/ThemeProvider.tsx'

// Before the first render, so a saved dark theme does not flash light.
applyTheme(readTheme())

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Missing #root element')

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
