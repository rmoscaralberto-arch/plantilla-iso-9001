import React from 'react'
import ReactDOM from 'react-dom/client'
// Observa: Aquí escribimos './App' sin el '.jsx' al final.
// Pero el archivo en tu carpeta se sigue llamando App.jsx.
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
