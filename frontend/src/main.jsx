import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import ColorLoader from './assets/components/ColorLoader'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <ColorLoader/>
  </React.StrictMode>,
)
