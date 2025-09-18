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
    console.log('🔍 Server-side render, using build environment');
    const buildEnv = import.meta.env.VITE_ENVIRONMENT;
    return (buildEnv as RuntimeEnvironment) || 'PROD';
  }

  // Check URL parameters first
  const searchParams = window.location.search;
  console.log('🔍 Full URL:', window.location.href);
  console.log('🔍 Search params:', searchParams);
  
  const urlParams = new URLSearchParams(searchParams);
  const envParam = urlParams.get('env');
  
  console.log('🔍 Raw env param:', envParam);
  console.log('🔍 Uppercased env param:', envParam?.toUpperCase());
  
  if (envParam && (envParam.toUpperCase() === 'DEV' || envParam.toUpperCase() === 'STAGING')) {
    console.log('✅ Using URL environment:', envParam.toUpperCase());
    return envParam.toUpperCase() as RuntimeEnvironment;
  }
  
  // Fallback to build-time environment
  const buildEnv = import.meta.env.VITE_ENVIRONMENT;
  console.log('🔍 Build environment:', buildEnv);
  console.log('✅ Using build environment:', (buildEnv as RuntimeEnvironment) || 'PROD');
  return (buildEnv as RuntimeEnvironment) || 'PROD';
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