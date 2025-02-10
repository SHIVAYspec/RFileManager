import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { StateLoader } from './components/stateLoader'
import { Explorer } from './page/explorer'
import { ThemeLoader } from './components/theme/themeLoader'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StateLoader>
      <ThemeLoader>
        <Explorer />
      </ThemeLoader>
    </StateLoader>
  </StrictMode>,
)
