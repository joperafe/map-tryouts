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
  
  // Also add a visible indicator on the page
  const buildInfo = document.createElement('div')
  buildInfo.id = 'build-info'
  buildInfo.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0,0,0,0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 11px;
    font-family: monospace;
    z-index: 10000;
    opacity: 0.7;
  `
  buildInfo.innerHTML = `
    🏗️ Build: ${new Date(buildTime).toLocaleString()}<br>
    🌳 Branch: ${buildBranch}<br>
    🌍 Env: ${buildEnv}
  `
  document.body.appendChild(buildInfo)
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
