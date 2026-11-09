import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import { App } from '@/App'
import { AppToaster } from '@/components/AppToaster'
import { applyTheme, readTheme } from '@/theme/theme'
import { ThemeProvider } from '@/theme/ThemeProvider'

// Before the first render, so a saved dark theme does not flash light.
applyTheme(readTheme())

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Missing #root element')

createRoot(rootElement).render(
  <StrictMode>
    <ThemeProvider>
      <App />
      <AppToaster />
    </ThemeProvider>
  </StrictMode>,
)
