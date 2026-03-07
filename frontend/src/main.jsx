import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './theme/reset.css'
import './theme/tokens.css'
import './theme/typography.css'
import './theme/animations.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
