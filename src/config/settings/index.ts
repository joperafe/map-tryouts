// Import the merged active configuration as fallback
import activeConfigFallback from './active.settings.json';
import { detectRuntimeEnvironment } from '../../utils/environmentDetector';

export type Environment = 'DEV' | 'INT' | 'PROD';

// Use build-time configuration as the primary config for reliability
const primaryConfig = activeConfigFallback as EnvironmentSettings;

// Cache for runtime configuration (optional enhancement)
let runtimeConfig: EnvironmentSettings | null = null;

// Runtime environment overrides for dynamic switching
const createEnvironmentOverrides = (env: string): Partial<EnvironmentSettings> => {
  switch (env) {
    case 'DEV':
      return {
        ENVIRONMENT: 'DEV' as Environment,
        API: {
          baseUrl: "/data" // Mock data for dev environment
        },
        DATA: {
          sensors: "/data/sensors.mock.json",
          greenzones: "/data/greenzones.mock.json"
        },
        FEATURES: {
          enableHeatmap: true,
          enableGreenZones: true
        },
        // Add dev-specific map controls
        MAP: {
          ...primaryConfig.MAP,
          controls_settings: {
            ...primaryConfig.MAP.controls_settings,
            draw: { 
              enabled: true,
              label: "DASHBOARD_MAP_CONTROLS_DRAW",
              icon: "✏️",
              tooltip: "DASHBOARD_MAP_TOOLTIPS_DRAW"
            },
            measurement: { 
              enabled: true,
              label: "DASHBOARD_MAP_CONTROLS_MEASURE", 
              icon: "📏",
              tooltip: "DASHBOARD_MAP_TOOLTIPS_MEASURE"
            }
          }
        }
      };
    case 'STAGING':
      return {
        ENVIRONMENT: 'STAGING' as Environment,
        API: {
          baseUrl: "https://staging-api.climate-app.com"
        },
        FEATURES: {
          enableHeatmap: true,
          enableGreenZones: false
        }
      };
    default: // PROD
      return {};
  }
};

// Function to load configuration at runtime (async enhancement)
const loadRuntimeConfig = async (): Promise<EnvironmentSettings> => {
  try {
    // Determine the correct path based on environment
    const basePath = import.meta.env.PROD ? '/map-tryouts' : '';
    const configPath = `${basePath}/active.settings.json`;
    
    // Try to fetch from public directory (production/deployed environments)
    const response = await fetch(configPath);
    if (response.ok) {
      // Check if response contains JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Expected JSON configuration, got: ${contentType}`);
      }
      const config = await response.json();
      console.log(`✅ Loaded runtime configuration from ${configPath}`);
      return config as EnvironmentSettings;
    } else {
      throw new Error(`Failed to load configuration: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.warn('⚠️ Failed to load runtime configuration, using build-time fallback:', error);
  }
  
  // Fallback to build-time configuration
  console.log('📦 Using build-time configuration fallback');
  return primaryConfig;
};

// Initialize configuration loading in background (non-blocking)
const initializeConfigAsync = async () => {
  try {
    runtimeConfig = await loadRuntimeConfig();
  } catch (error) {
    console.warn('Configuration async loading failed:', error);
  }
};

// Start loading configuration in background (non-blocking)
initializeConfigAsync();

export interface EnvironmentSettings {
  ENVIRONMENT: Environment;
  API: {
    baseUrl: string;
  };
  DATA: {
    sensors: string;
    greenzones: string;
  };
  FEATURES: {
    enableHeatmap: boolean;
    enableGreenZones: boolean;
  };
  MAP: {
    controls_settings: Record<string, {
      enabled: boolean;
      label: string;
      icon?: string;
      tooltip?: string;
      shortcut?: string;
    }>;
    map_controls: Record<string, {
      position: 'topright' | 'topleft' | 'bottomright' | 'bottomleft';
      elements: Array<{
        type: 'toggle' | 'switch';
        items: string[];
      }>;
    }>;
    map_settings: {
      center: number[]; // Will be exactly 2 numbers [lat, lng]
      zoom: number;
      maxZoom: number;
      minZoom: number;
      scrollWheelZoom?: boolean;
      doubleClickZoom?: boolean;
      boxZoom?: boolean;
      keyboard?: boolean;
    };
    default_tile_layer?: string;
    default_attribution?: string;
    tile_layers?: Record<string, {
      name: string;
      url: string;
      attribution: string;
    }>;
  };
  APPLICATION?: {
    name: string;
    version: string;
    description: string;
    author: string;
    homepage: string;
  };
  BRANDING?: {
    logo: string;
    favicon: string;
    title: string;
    tagline: string;
  };
  LANGUAGES?: {
    supported: Array<{
      code: string;
      name: string;
      flag: string;
      nativeName: string;
    }>;
    default: string;
  };
  THEMES?: {
    supported: string[];
    default: string;
  };
  UI?: {
    dateFormats: Record<string, string>;
    numberFormats: Record<string, { decimal: string; thousands: string }>;
    pagination: {
      itemsPerPage: number;
      showSizeChanger: boolean;
      pageSizeOptions: number[];
    };
    animations: {
      duration: number;
      easing: string;
      enabled: boolean;
    };
    interactions: {
      debounceTime: number;
      tooltipDelay: number;
      doubleClickDelay: number;
    };
  };
  SENSORS?: {
    types: Record<string, {
      name: string;
      unit: string;
      icon: string;
      color: string;
      range: { min: number; max: number };
    }>;
    alerts: Record<string, { min: number; max: number }>;
    refresh_interval: number;
    max_history_points: number;
  };
  PERFORMANCE?: {
    cache: {
      enabled: boolean;
      ttl?: number;
      max_size?: number;
    };
    compression?: boolean;
    lazy_loading?: boolean;
    debounce?: {
      search: number;
      resize: number;
    };
  };
  SECURITY?: {
    cors: {
      enabled: boolean;
      origins: string[];
    };
    rate_limiting: {
      enabled: boolean;
      requests_per_minute: number;
    };
  };
  BUILD_INFO?: {
    timestamp: string;
    environment: Environment;
    version: string;
    build_id: string;
  };
}

// Async function to get environment settings (with runtime loading)
export const getEnvironmentSettingsAsync = async (): Promise<EnvironmentSettings> => {
  if (!runtimeConfig) {
    runtimeConfig = await loadRuntimeConfig();
  }
  
  return runtimeConfig;
};

// Synchronous function for immediate access (always returns valid config)
export const getEnvironmentSettings = (): EnvironmentSettings => {
  // Check for runtime environment switching
  const runtimeEnv = detectRuntimeEnvironment();
  const overrides = createEnvironmentOverrides(runtimeEnv);
  
  const baseConfig = runtimeConfig || primaryConfig;
  
  // Apply runtime environment overrides if we're switching environments
  if (Object.keys(overrides).length > 0) {
    console.log(`🔄 Applying runtime environment overrides for: ${runtimeEnv}`);
    return {
      ...baseConfig,
      ...overrides,
      // Deep merge MAP configuration
      MAP: {
        ...baseConfig.MAP,
        ...(overrides.MAP || {}),
        controls_settings: {
          ...baseConfig.MAP.controls_settings,
          ...(overrides.MAP?.controls_settings || {})
        }
      }
    } as EnvironmentSettings;
  }
  
  return baseConfig;
};

export const getCurrentEnvironment = (): Environment => {
  const config = getEnvironmentSettings();
  return config.ENVIRONMENT || 'DEV';
};

// Get the current active configuration (merged default + environment)
export const getCurrentConfig = () => {
  return getEnvironmentSettings();
};

// Deprecated: Use getCurrentConfig() instead - kept for backward compatibility
export const getDefaultConfig = () => {
  return getCurrentConfig();
};

// Combined configuration for backward compatibility
export const getAppConfig = () => {
  const envSettings = getEnvironmentSettings();
  
  return {
    environment: envSettings,
    config: envSettings, // Now they're the same merged configuration
  };
};
