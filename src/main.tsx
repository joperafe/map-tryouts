import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'  // Initialize i18n
import App from './App.tsx'

// Display build metadata in console
const rootElement = document.getElementById('root')!
const buildTime = rootElement.getAttribute('data-build-time')
const buildBranch = rootElement.getAttribute('data-build-branch')
const buildCommit = rootElement.getAttribute('data-build-commit')
const buildEnv = rootElement.getAttribute('data-build-env')

if (buildTime) {
  console.log(`%c🏗️ Build Information`, 'font-weight: bold; color: #0066cc; font-size: 14px;')
  console.log(`%c📅 Build Time:`, 'font-weight: bold; color: #666;', buildTime)
  console.log(`%c🌳 Branch:`, 'font-weight: bold; color: #666;', buildBranch || 'unknown')
  console.log(`%c🏷️ Commit:`, 'font-weight: bold; color: #666;', buildCommit || 'unknown')
  console.log(`%c🌍 Environment:`, 'font-weight: bold; color: #666;', buildEnv || 'unknown')
  console.log(`%c────────────────────────────────────────`, 'color: #ccc;')
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
