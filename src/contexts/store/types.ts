import type { Sensor, GreenZone } from '../../types';
import type { AirQualityStation } from '../../types/airQuality';

// Auth State Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'viewer';
  permissions: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  sessionExpiry: Date | null;
  rememberMe: boolean;
  lastActivity: Date | null;
  debugMode: boolean;
}

// Map Data State Types
export interface MapDataState {
  // Core data
  sensors: Sensor[];
  greenZones: GreenZone[];
  airQualityStations: AirQualityStation[];
  
  // Loading states
  loading: {
    sensors: boolean;
    greenZones: boolean;
    airQuality: boolean;
    general: boolean;
  };
  
  // Error states
  errors: {
    sensors: string | null;
    greenZones: string | null;
    airQuality: string | null;
  };
  
  // Last updated timestamps
  lastUpdated: {
    sensors: Date | null;
    greenZones: Date | null;
    airQuality: Date | null;
  };
  
  // Layer visibility
  layersVisible: {
    sensors: boolean;
    greenZones: boolean;
    airQuality: boolean;
    heatmap: boolean;
  };
  
  // Current base map
  currentBaseMap: string;
}

// Sensor Layers State Types
export interface SensorLayerData {
  sensors: Sensor[];
  loading: boolean;
  error: string | null;
  visible: boolean;
  lastUpdated?: Date;
}

export interface SensorLayersState {
  layers: Record<string, SensorLayerData>;
  collapsedSidebar: boolean;
}

// UI State Types
export interface UIState {
  // Global UI states
  sidebarCollapsed: boolean;
  fullscreenMode: boolean;
  debugPanelVisible: boolean;
  
  // Map UI states
  drawingMode: boolean;
  measurementMode: boolean;
  addSensorMode: boolean;
  selectedPosition: [number, number] | null;
  
  // Loading overlays
  globalLoading: boolean;
  
  // Notifications
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: Date;
    duration?: number;
  }>;
}

// Theme State Types
export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeState {
  mode: ThemeMode;
  systemPreference: 'light' | 'dark';
  customColors?: Record<string, string>;
}

// Settings State Types
export interface AppSettings {
  language: string;
  environment: 'DEV' | 'INT' | 'PROD';
  debugEnabled: boolean;
  autoRefreshInterval: number;
  mapDefaultZoom: number;
  mapDefaultCenter: [number, number];
  temperatureUnit: 'celsius' | 'fahrenheit';
  showTooltips: boolean;
}

// Root App State
export interface AppState {
  auth: AuthState;
  mapData: MapDataState;
  sensorLayers: SensorLayersState;
  ui: UIState;
  theme: ThemeState;
  settings: AppSettings;
}

// Action Types
export type AuthAction =
  | { type: 'AUTH_LOGIN_START' }
  | { type: 'AUTH_LOGIN_SUCCESS'; payload: { user: User; rememberMe: boolean } }
  | { type: 'AUTH_LOGIN_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT_START' }
  | { type: 'AUTH_LOGOUT_SUCCESS' }
  | { type: 'AUTH_LOGOUT_FAILURE'; payload: string }
  | { type: 'AUTH_REFRESH_TOKEN_START' }
  | { type: 'AUTH_REFRESH_TOKEN_SUCCESS'; payload: User }
  | { type: 'AUTH_REFRESH_TOKEN_FAILURE'; payload: string }
  | { type: 'AUTH_SET_SESSION_EXPIRY'; payload: Date | null }
  | { type: 'AUTH_UPDATE_LAST_ACTIVITY'; payload: Date }
  | { type: 'AUTH_TOGGLE_DEBUG_MODE' }
  | { type: 'AUTH_CLEAR_ERROR' };

export type MapDataAction =
  | { type: 'MAP_DATA_SET_LOADING'; payload: { layer: keyof MapDataState['loading']; loading: boolean } }
  | { type: 'MAP_DATA_SET_ERROR'; payload: { layer: keyof MapDataState['errors']; error: string | null } }
  | { type: 'MAP_DATA_SET_SENSORS'; payload: Sensor[] }
  | { type: 'MAP_DATA_SET_GREEN_ZONES'; payload: GreenZone[] }
  | { type: 'MAP_DATA_SET_AIR_QUALITY_STATIONS'; payload: AirQualityStation[] }
  | { type: 'MAP_DATA_SET_LAYER_VISIBILITY'; payload: { layer: keyof MapDataState['layersVisible']; visible: boolean } }
  | { type: 'MAP_DATA_SET_BASE_MAP'; payload: string }
  | { type: 'MAP_DATA_REFRESH_ALL_START' }
  | { type: 'MAP_DATA_REFRESH_ALL_END' };

export type SensorLayersAction =
  | { type: 'SENSOR_LAYERS_SET_LAYER_SENSORS'; payload: { layerName: string; sensors: Sensor[] } }
  | { type: 'SENSOR_LAYERS_SET_LAYER_LOADING'; payload: { layerName: string; loading: boolean } }
  | { type: 'SENSOR_LAYERS_SET_LAYER_ERROR'; payload: { layerName: string; error: string | null } }
  | { type: 'SENSOR_LAYERS_SET_LAYER_VISIBILITY'; payload: { layerName: string; visible: boolean } }
  | { type: 'SENSOR_LAYERS_CLEAR_LAYER_SENSORS'; payload: { layerName: string } }
  | { type: 'SENSOR_LAYERS_TOGGLE_SIDEBAR_COLLAPSED' }
  | { type: 'SENSOR_LAYERS_SET_SIDEBAR_COLLAPSED'; payload: { collapsed: boolean } };

export type UIAction =
  | { type: 'UI_SET_SIDEBAR_COLLAPSED'; payload: boolean }
  | { type: 'UI_SET_FULLSCREEN_MODE'; payload: boolean }
  | { type: 'UI_SET_DEBUG_PANEL_VISIBLE'; payload: boolean }
  | { type: 'UI_SET_DRAWING_MODE'; payload: boolean }
  | { type: 'UI_SET_MEASUREMENT_MODE'; payload: boolean }
  | { type: 'UI_SET_ADD_SENSOR_MODE'; payload: boolean }
  | { type: 'UI_SET_SELECTED_POSITION'; payload: [number, number] | null }
  | { type: 'UI_SET_GLOBAL_LOADING'; payload: boolean }
  | { type: 'UI_ADD_NOTIFICATION'; payload: Omit<UIState['notifications'][0], 'id' | 'timestamp'> }
  | { type: 'UI_REMOVE_NOTIFICATION'; payload: string }
  | { type: 'UI_CLEAR_NOTIFICATIONS' };

export type ThemeAction =
  | { type: 'THEME_SET_MODE'; payload: ThemeMode }
  | { type: 'THEME_SET_SYSTEM_PREFERENCE'; payload: 'light' | 'dark' }
  | { type: 'THEME_SET_CUSTOM_COLORS'; payload: Record<string, string> };

export type SettingsAction =
  | { type: 'SETTINGS_SET_LANGUAGE'; payload: string }
  | { type: 'SETTINGS_SET_ENVIRONMENT'; payload: 'DEV' | 'INT' | 'PROD' }
  | { type: 'SETTINGS_SET_DEBUG_ENABLED'; payload: boolean }
  | { type: 'SETTINGS_SET_AUTO_REFRESH_INTERVAL'; payload: number }
  | { type: 'SETTINGS_SET_MAP_DEFAULT_ZOOM'; payload: number }
  | { type: 'SETTINGS_SET_MAP_DEFAULT_CENTER'; payload: [number, number] }
  | { type: 'SETTINGS_SET_TEMPERATURE_UNIT'; payload: 'celsius' | 'fahrenheit' }
  | { type: 'SETTINGS_SET_SHOW_TOOLTIPS'; payload: boolean }
  | { type: 'SETTINGS_LOAD'; payload: AppSettings };

// Combined Action Type
export type AppAction =
  | AuthAction
  | MapDataAction
  | SensorLayersAction
  | UIAction
  | ThemeAction
  | SettingsAction;

// Async Action Creator Type (Thunk-style)
export interface AsyncActionCreator<T = void> {
  (dispatch: React.Dispatch<AppAction>, getState: () => AppState): Promise<T>;
}

// Action Creator Type
export interface ActionCreator<T extends AppAction> {
  (...args: unknown[]): T;
}

// Bound Action Creators Interface
export interface BoundActionCreators {
  // Auth actions
  auth: {
    login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
    logout: () => Promise<void>;
    refreshToken: () => Promise<void>;
    setSessionExpiry: (expiry: Date | null) => void;
    updateLastActivity: () => void;
    toggleDebugMode: () => void;
    clearError: () => void;
  };
  
  // Map data actions
  mapData: {
    setLayerVisibility: (layer: keyof MapDataState['layersVisible'], visible: boolean) => void;
    setBaseMap: (baseMapId: string) => void;
    refreshSensors: () => Promise<void>;
    refreshGreenZones: () => Promise<void>;
    refreshAirQuality: () => Promise<void>;
    refreshAllLayers: () => Promise<void>;
  };
  
  // Sensor layers actions
  sensorLayers: {
    setSensorLayer: (layerName: string, sensors: Sensor[]) => void;
    setLayerLoading: (layerName: string, loading: boolean) => void;
    setLayerError: (layerName: string, error: string | null) => void;
    setLayerVisibility: (layerName: string, visible: boolean) => void;
    clearSensorLayer: (layerName: string) => void;
    toggleSidebarCollapsed: () => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
  };
  
  // UI actions
  ui: {
    setSidebarCollapsed: (collapsed: boolean) => void;
    setFullscreenMode: (enabled: boolean) => void;
    setDebugPanelVisible: (visible: boolean) => void;
    setDrawingMode: (enabled: boolean) => void;
    setMeasurementMode: (enabled: boolean) => void;
    setAddSensorMode: (enabled: boolean) => void;
    setSelectedPosition: (position: [number, number] | null) => void;
    setGlobalLoading: (loading: boolean) => void;
    addNotification: (notification: Omit<UIState['notifications'][0], 'id' | 'timestamp'>) => void;
    removeNotification: (id: string) => void;
    clearNotifications: () => void;
  };
  
  // Theme actions
  theme: {
    setMode: (mode: ThemeMode) => void;
    setSystemPreference: (preference: 'light' | 'dark') => void;
    setCustomColors: (colors: Record<string, string>) => void;
  };
  
  // Settings actions
  settings: {
    setLanguage: (language: string) => void;
    setEnvironment: (environment: 'DEV' | 'INT' | 'PROD') => void;
    setDebugEnabled: (enabled: boolean) => void;
    setAutoRefreshInterval: (interval: number) => void;
    setMapDefaultZoom: (zoom: number) => void;
    setMapDefaultCenter: (center: [number, number]) => void;
    setTemperatureUnit: (unit: 'celsius' | 'fahrenheit') => void;
    setShowTooltips: (show: boolean) => void;
    loadSettings: (settings: AppSettings) => void;
  };
}