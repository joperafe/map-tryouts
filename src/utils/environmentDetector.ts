/**
 * Runtime environment detection based on URL parameters
 * This allows switching environments via ?env=dev or ?env=staging
 */

export type RuntimeEnvironment = 'PROD' | 'DEV' | 'STAGING';

export interface EnvironmentConfig {
  environment: RuntimeEnvironment;
  apiBaseUrl: string;
  enableDebugMode: boolean;
  enableGreenZones: boolean;
  mapDefaultZoom: number;
  showEnvironmentIndicator: boolean;
}

/**
 * Detect environment from URL parameters or fallback to build-time environment
 */
export function detectRuntimeEnvironment(): RuntimeEnvironment {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    const buildEnv = import.meta.env.VITE_ENVIRONMENT || 'DEV';
    return (buildEnv as RuntimeEnvironment) || 'PROD';
  }

  // Debug logging for production
  const searchParams = window.location.search;
  const urlParams = new URLSearchParams(searchParams);
  const envParam = urlParams.get('env');
  
  console.log('🔍 Environment Detection:');
  console.log('- Full URL:', window.location.href);
  console.log('- Search params:', searchParams);
  console.log('- env param:', envParam);
  console.log('- VITE_ENVIRONMENT:', import.meta.env.VITE_ENVIRONMENT);
  console.log('- MODE:', import.meta.env.MODE);
  
  // Check URL parameters first
  if (envParam && (envParam.toUpperCase() === 'DEV' || envParam.toUpperCase() === 'STAGING')) {
    const detectedEnv = envParam.toUpperCase() as RuntimeEnvironment;
    console.log('- Detected from URL:', detectedEnv);
    return detectedEnv;
  }
  
  // Fallback to build-time environment
  const buildEnv = import.meta.env.VITE_ENVIRONMENT || import.meta.env.MODE;
  
  // Map Vite modes to our environments
  if (buildEnv === 'development') {
    console.log('- Detected from build (development):', 'DEV');
    return 'DEV';
  }
  if (buildEnv === 'DEV') {
    console.log('- Detected from build (DEV):', 'DEV');
    return 'DEV';
  }
  if (buildEnv === 'STAGING') {
    console.log('- Detected from build (STAGING):', 'STAGING');
    return 'STAGING';
  }
  
  console.log('- Detected default:', 'PROD');
  return 'PROD';
}

/**
 * Get configuration based on detected environment
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const environment = detectRuntimeEnvironment();
  
  const configs: Record<RuntimeEnvironment, EnvironmentConfig> = {
    PROD: {
      environment: 'PROD',
      apiBaseUrl: 'https://api.climate-app.com',
      enableDebugMode: false,
      enableGreenZones: true,
      mapDefaultZoom: 10,
      showEnvironmentIndicator: false,
    },
    DEV: {
      environment: 'DEV',
      apiBaseUrl: 'https://dev-api.climate-app.com',
      enableDebugMode: true,
      enableGreenZones: true,
      mapDefaultZoom: 8,
      showEnvironmentIndicator: true,
    },
    STAGING: {
      environment: 'STAGING',
      apiBaseUrl: 'https://staging-api.climate-app.com',
      enableDebugMode: true,
      enableGreenZones: false,
      mapDefaultZoom: 12,
      showEnvironmentIndicator: true,
    },
  };
  
  return configs[environment];
}

/**
 * Generate URLs for environment switching
 */
export function getEnvironmentUrls() {
  const baseUrl = window.location.origin + window.location.pathname;
  
  return {
    production: baseUrl,
    development: `${baseUrl}?env=dev`,
    staging: `${baseUrl}?env=staging`,
  };
}