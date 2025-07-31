import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import UpworkMonitor from './UpworkMonitor.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UpworkMonitor />
  </StrictMode>,
)
