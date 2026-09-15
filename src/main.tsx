import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeBackendSync } from './lib/syncManager'

// Runs once at load (not in an effect, which StrictMode would double-invoke).
// The stores notify subscribers, so the UI picks up merged data when it lands.
void initializeBackendSync()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
