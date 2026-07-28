import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/tokens.css'
import './styles/global.css'
import './styles/components.css'

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  const hadController = Boolean(navigator.serviceWorker.controller)
  let refreshing = false

  if (hadController) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    })
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { updateViaCache: 'none' })
      .then((registration) => registration.update())
      .catch(() => undefined)
  })
}
