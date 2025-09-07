import defaultConfig from './configs/default.json';
import devSettings from './environments/settings.dev.json';
import intSettings from './environments/settings.int.json';
import prodSettings from './environments/settings.prod.json';

export type Environment = 'DEV' | 'INT' | 'PROD';

export interface EnvironmentSettings {
  environment: Environment;
  api: {
    baseUrl: string;
  };
  data: {
    sensors: string;
    greenzones: string;
  };
  features: {
    enableHeatmap: boolean;
    enableGreenZones: boolean;
  };
  mapControls: {
    position: 'topright' | 'topleft' | 'bottomright' | 'bottomleft';
    controls: Array<{
      type: 'layerToggle' | 'draw' | 'fullscreen' | 'measurement';
      enabled: boolean;
      label: string;
    }>;
  };
  map: {
    center: [number, number];
    zoom: number;
    maxZoom: number;
    minZoom: number;
  };
}

export interface DefaultConfig {
  languages: {
    supported: Array<{
      code: string;
      name: string;
      flag: string;
      nativeName: string;
    }>;
    default: string;
  };
  themes: {
    supported: string[];
    default: string;
  };
  dateFormats: Record<string, string>;
  numberFormats: Record<string, {
    decimal: string;
    thousands: string;
  }>;
  ui: {
    itemsPerPage: number;
    animationDuration: number;
    debounceTime: number;
  };
  map: {
    defaultTileLayer: string;
    defaultAttribution: string;
  };
}

const environmentSettings: Record<Environment, EnvironmentSettings> = {
  DEV: devSettings as EnvironmentSettings,
  INT: intSettings as EnvironmentSettings,
  PROD: prodSettings as EnvironmentSettings,
};

export const getEnvironmentSettings = (env?: string): EnvironmentSettings => {
  // Force DEV environment in development mode
  let environment: Environment;
  
  // Debug logging
  console.log('Environment detection:', {
    'import.meta.env.DEV': import.meta.env.DEV,
    'import.meta.env.PROD': import.meta.env.PROD,
    'import.meta.env.MODE': import.meta.env.MODE,
    'import.meta.env.VITE_ENVIRONMENT': import.meta.env.VITE_ENVIRONMENT,
    'process.env.NODE_ENV': typeof process !== 'undefined' ? process.env.NODE_ENV : 'undefined',
    'env parameter': env
  });
  
  if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
    environment = 'DEV';
    console.log('Using DEV environment (development mode detected)');
  } else {
    environment = (env || import.meta.env.VITE_ENVIRONMENT || 'DEV') as Environment;
    console.log('Using environment:', environment);
  }
  
  const selectedConfig = environmentSettings[environment] || environmentSettings.DEV;
  console.log('Selected configuration:', {
    environment: selectedConfig.environment,
    baseUrl: selectedConfig.api.baseUrl
  });
  
  return selectedConfig;
};

export const getDefaultConfig = (): DefaultConfig => {
  return defaultConfig;
};

export const getCurrentEnvironment = (): Environment => {
  // Force DEV environment in development mode
  if (import.meta.env.DEV) {
    return 'DEV';
  }
  return (import.meta.env.VITE_ENVIRONMENT || 'DEV') as Environment;
};

// Combined configuration
export const getAppConfig = () => {
  const envSettings = getEnvironmentSettings();
  const defaultSettings = getDefaultConfig();
  
  return {
    environment: envSettings,
    config: defaultSettings,
  };
};
