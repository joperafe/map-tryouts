/**
 * Debug utilities for environment detection
 */

export function debugEnvironmentDetection() {
  console.group('🔍 Environment Detection Debug');
  
  // Browser check
  console.log('Browser available:', typeof window !== 'undefined');
  
  if (typeof window !== 'undefined') {
    // URL info
    console.log('Full URL:', window.location.href);
    console.log('Search string:', window.location.search);
    console.log('Hash:', window.location.hash);
    console.log('Pathname:', window.location.pathname);
    
    // URLSearchParams debug
    const params = new URLSearchParams(window.location.search);
    console.log('URLSearchParams object:', params);
    console.log('All params:', Array.from(params.entries()));
    console.log('env param (raw):', params.get('env'));
    console.log('env param (uppercase):', params.get('env')?.toUpperCase());
    
    // Manual parsing
    const manualParse = window.location.search.slice(1).split('&');
    console.log('Manual parse:', manualParse);
    const envMatch = manualParse.find(param => param.startsWith('env='));
    console.log('Manual env match:', envMatch);
  }
  
  // Build environment
  console.log('Build env (VITE_ENVIRONMENT):', import.meta.env.VITE_ENVIRONMENT);
  console.log('Mode:', import.meta.env.MODE);
  console.log('Prod:', import.meta.env.PROD);
  console.log('Dev:', import.meta.env.DEV);
  
  console.groupEnd();
}

// Auto-run debug in development
if (import.meta.env.DEV) {
  // Run after DOM is ready
  if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', debugEnvironmentDetection);
    } else {
      debugEnvironmentDetection();
    }
  }
}