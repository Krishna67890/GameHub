import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { setFavicon } from './utils/favicon-generator'

// Set favicon
setFavicon();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)