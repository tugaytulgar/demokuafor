import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import App from './App.jsx'
import './styles/index.css'

// GitHub Pages'ta site /repo-adi/ altında; basename'i URL'den türet ki /yonetim vb. doğru çalışsın
function getBasename() {
  const base = import.meta.env.BASE_URL
  if (base && base !== '/') return base.replace(/\/$/, '')
  const path = typeof window !== 'undefined' ? window.location.pathname : ''
  if (path === '/' || path === '') return '/'
  const match = path.match(/^(\/[^/]+)/)
  return match ? match[1] : '/'
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter basename={getBasename()}>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
)
