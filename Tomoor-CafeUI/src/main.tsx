import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/site.css'
import App from './app/App.tsx'
import { initializeTheme } from './shared/theme.ts'
import { initializeI18n } from './localization/i18n.ts'

initializeTheme()
initializeI18n()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
