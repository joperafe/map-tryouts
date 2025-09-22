import type { 
  AppState, 
  AppAction,
  AuthState,
  AuthAction,
  MapDataState,
  MapDataAction,
  SensorLayersState,
  SensorLayersAction,
  UIState,
  UIAction,
  ThemeState,
  ThemeAction,
  AppSettings,
  SettingsAction
} from './types';
import {
  updateLoadingState,
  updateErrorState,
  updateLastUpdated,
  updateLayerVisibility,
  stateUpdaters,
  arrayUtils
} from './utils';

// Initial states for each domain
const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  sessionExpiry: null,
  rememberMe: false,
  lastActivity: null,
  debugMode: false,
};

const initialMapDataState: MapDataState = {
  sensors: [],
  greenZones: [],
  airQualityStations: [],
  loading: {
    sensors: false,
    greenZones: false,
    airQuality: false,
    general: false,
  },
  errors: {
    sensors: null,
    greenZones: null,
    airQuality: null,
  },
  lastUpdated: {
    sensors: null,
    greenZones: null,
    airQuality: null,
  },
  layersVisible: {
    sensors: true,
    greenZones: true,
    airQuality: true,
    heatmap: false,
  },
  currentBaseMap: 'openstreetmap',
};

const initialSensorLayersState: SensorLayersState = {
  layers: {},
  collapsedSidebar: false,
};

const initialUIState: UIState = {
  sidebarCollapsed: false,
  fullscreenMode: false,
  debugPanelVisible: false,
  drawingMode: false,
  measurementMode: false,
  addSensorMode: false,
  selectedPosition: null,
  globalLoading: false,
  notifications: [],
};

const initialThemeState: ThemeState = {
  mode: 'system',
  systemPreference: 'light',
  customColors: undefined,
};

const initialSettingsState: AppSettings = {
  language: 'en',
  environment: 'DEV',
  debugEnabled: false,
  autoRefreshInterval: 30000, // 30 seconds
  mapDefaultZoom: 10,
  mapDefaultCenter: [38.7223, -9.1393], // Lisbon
  temperatureUnit: 'celsius',
  showTooltips: true,
};

// Root initial state
export const initialAppState: AppState = {
  auth: initialAuthState,
  mapData: initialMapDataState,
  sensorLayers: initialSensorLayersState,
  ui: initialUIState,
  theme: initialThemeState,
  settings: initialSettingsState,
};

// Auth reducer - refactored to use utilities
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_LOGIN_START':
      return stateUpdaters.setLoading(state, true);
    
    case 'AUTH_LOGIN_SUCCESS':
      return {
        ...stateUpdaters.setSuccess(state),
        user: action.payload.user,
        isAuthenticated: true,
        rememberMe: action.payload.rememberMe,
        lastActivity: new Date(),
      };
    
    case 'AUTH_LOGIN_FAILURE':
      return {
        ...stateUpdaters.setError(state, action.payload),
        user: null,
        isAuthenticated: false,
        rememberMe: false,
      };
    
    case 'AUTH_LOGOUT_START':
      return stateUpdaters.setLoading(state, true);
    
    case 'AUTH_LOGOUT_SUCCESS':
      return {
        ...initialAuthState, // Reset to initial state
        debugMode: state.debugMode, // Preserve debug mode
      };
    
    case 'AUTH_LOGOUT_FAILURE':
      return stateUpdaters.setError(state, action.payload);
    
    case 'AUTH_REFRESH_TOKEN_START':
      return stateUpdaters.setLoading(state, true);
    
    case 'AUTH_REFRESH_TOKEN_SUCCESS':
      return {
        ...stateUpdaters.setSuccess(state),
        user: action.payload,
        isAuthenticated: true,
        lastActivity: new Date(),
      };
    
    case 'AUTH_REFRESH_TOKEN_FAILURE':
      return {
        ...initialAuthState, // Reset to initial state on token refresh failure
        debugMode: state.debugMode,
        error: action.payload,
      };
    
    case 'AUTH_SET_SESSION_EXPIRY':
      return {
        ...state,
        sessionExpiry: action.payload,
      };
    
    case 'AUTH_UPDATE_LAST_ACTIVITY':
      return {
        ...state,
        lastActivity: action.payload,
      };
    
    case 'AUTH_TOGGLE_DEBUG_MODE':
      return {
        ...state,
        debugMode: !state.debugMode,
      };
    
    case 'AUTH_CLEAR_ERROR':
      return stateUpdaters.setError(state, null);

    default:
      return state;
  }
}// Map Data reducer
function mapDataReducer(state: MapDataState, action: MapDataAction): MapDataState {
  switch (action.type) {
    case 'MAP_DATA_SET_LOADING':
      return updateLoadingState(state, action.payload.layer, action.payload.loading);
    
    case 'MAP_DATA_SET_ERROR':
      return updateErrorState(state, action.payload.layer, action.payload.error);
    
    case 'MAP_DATA_SET_SENSORS':
      return {
        ...updateLastUpdated(updateErrorState(state, 'sensors', null), 'sensors'),
        sensors: action.payload,
      };
    
    case 'MAP_DATA_SET_GREEN_ZONES':
      return {
        ...updateLastUpdated(updateErrorState(state, 'greenZones', null), 'greenZones'),
        greenZones: action.payload,
      };
    
    case 'MAP_DATA_SET_AIR_QUALITY_STATIONS':
      return {
        ...updateLastUpdated(updateErrorState(state, 'airQuality', null), 'airQuality'),
        airQualityStations: action.payload,
      };
    
    case 'MAP_DATA_SET_LAYER_VISIBILITY':
      return updateLayerVisibility(state, action.payload.layer, action.payload.visible);
    
    case 'MAP_DATA_SET_BASE_MAP':
      return {
        ...state,
        currentBaseMap: action.payload,
      };
    
    case 'MAP_DATA_REFRESH_ALL_START':
      return updateLoadingState(state, 'general', true);
    
    case 'MAP_DATA_REFRESH_ALL_END':
      return updateLoadingState(state, 'general', false);
    
    default:
      return state;
  }
}

// Sensor Layers reducer
function sensorLayersReducer(state: SensorLayersState, action: SensorLayersAction): SensorLayersState {
  switch (action.type) {
    case 'SENSOR_LAYERS_SET_LAYER_SENSORS':
      return {
        ...state,
        layers: {
          ...state.layers,
          [action.payload.layerName]: {
            ...state.layers[action.payload.layerName],
            sensors: action.payload.sensors,
            loading: false,
            error: null,
            lastUpdated: new Date(),
            visible: state.layers[action.payload.layerName]?.visible ?? true,
          },
        },
      };

    case 'SENSOR_LAYERS_SET_LAYER_LOADING':
      return {
        ...state,
        layers: {
          ...state.layers,
          [action.payload.layerName]: {
            ...state.layers[action.payload.layerName],
            sensors: state.layers[action.payload.layerName]?.sensors || [],
            loading: action.payload.loading,
            error: null,
            visible: state.layers[action.payload.layerName]?.visible ?? true,
          },
        },
      };

    case 'SENSOR_LAYERS_SET_LAYER_ERROR':
      return {
        ...state,
        layers: {
          ...state.layers,
          [action.payload.layerName]: {
            ...state.layers[action.payload.layerName],
            sensors: state.layers[action.payload.layerName]?.sensors || [],
            loading: false,
            error: action.payload.error,
            visible: state.layers[action.payload.layerName]?.visible ?? true,
          },
        },
      };

    case 'SENSOR_LAYERS_SET_LAYER_VISIBILITY':
      return {
        ...state,
        layers: {
          ...state.layers,
          [action.payload.layerName]: {
            ...state.layers[action.payload.layerName],
            sensors: state.layers[action.payload.layerName]?.sensors || [],
            loading: state.layers[action.payload.layerName]?.loading ?? false,
            error: state.layers[action.payload.layerName]?.error ?? null,
            visible: action.payload.visible,
          },
        },
      };

    case 'SENSOR_LAYERS_CLEAR_LAYER_SENSORS':
      return {
        ...state,
        layers: {
          ...state.layers,
          [action.payload.layerName]: {
            sensors: [],
            loading: false,
            error: null,
            visible: state.layers[action.payload.layerName]?.visible ?? true,
          },
        },
      };

    case 'SENSOR_LAYERS_TOGGLE_SIDEBAR_COLLAPSED':
      return {
        ...state,
        collapsedSidebar: !state.collapsedSidebar,
      };

    case 'SENSOR_LAYERS_SET_SIDEBAR_COLLAPSED':
      return {
        ...state,
        collapsedSidebar: action.payload.collapsed,
      };

    default:
      return state;
  }
}

// UI reducer
function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'UI_SET_SIDEBAR_COLLAPSED':
      return {
        ...state,
        sidebarCollapsed: action.payload,
      };
    
    case 'UI_SET_FULLSCREEN_MODE':
      return {
        ...state,
        fullscreenMode: action.payload,
      };
    
    case 'UI_SET_DEBUG_PANEL_VISIBLE':
      return {
        ...state,
        debugPanelVisible: action.payload,
      };
    
    case 'UI_SET_DRAWING_MODE':
      return {
        ...state,
        drawingMode: action.payload,
        measurementMode: action.payload ? false : state.measurementMode, // Disable measurement when drawing
        addSensorMode: action.payload ? false : state.addSensorMode, // Disable add sensor when drawing
      };
    
    case 'UI_SET_MEASUREMENT_MODE':
      return {
        ...state,
        measurementMode: action.payload,
        drawingMode: action.payload ? false : state.drawingMode, // Disable drawing when measuring
        addSensorMode: action.payload ? false : state.addSensorMode, // Disable add sensor when measuring
      };
    
    case 'UI_SET_ADD_SENSOR_MODE':
      return {
        ...state,
        addSensorMode: action.payload,
        drawingMode: action.payload ? false : state.drawingMode, // Disable drawing when adding sensor
        measurementMode: action.payload ? false : state.measurementMode, // Disable measurement when adding sensor
      };
    
    case 'UI_SET_SELECTED_POSITION':
      return {
        ...state,
        selectedPosition: action.payload,
      };
    
    case 'UI_SET_GLOBAL_LOADING':
      return {
        ...state,
        globalLoading: action.payload,
      };
    
    case 'UI_ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, {
          ...action.payload,
          id: `notification-${Date.now()}-${Math.random()}`,
          timestamp: new Date(),
        }],
      };
    
    case 'UI_REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: arrayUtils.remove(state.notifications, action.payload),
      };
    
    case 'UI_CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
      };
    
    default:
      return state;
  }
}

// Theme reducer
function themeReducer(state: ThemeState, action: ThemeAction): ThemeState {
  switch (action.type) {
    case 'THEME_SET_MODE':
      return {
        ...state,
        mode: action.payload,
      };
    
    case 'THEME_SET_SYSTEM_PREFERENCE':
      return {
        ...state,
        systemPreference: action.payload,
      };
    
    case 'THEME_SET_CUSTOM_COLORS':
      return {
        ...state,
        customColors: action.payload,
      };
    
    default:
      return state;
  }
}

// Settings reducer
function settingsReducer(state: AppSettings, action: SettingsAction): AppSettings {
  switch (action.type) {
    case 'SETTINGS_SET_LANGUAGE':
      return {
        ...state,
        language: action.payload,
      };
    
    case 'SETTINGS_SET_ENVIRONMENT':
      return {
        ...state,
        environment: action.payload,
      };
    
    case 'SETTINGS_SET_DEBUG_ENABLED':
      return {
        ...state,
        debugEnabled: action.payload,
      };
    
    case 'SETTINGS_SET_AUTO_REFRESH_INTERVAL':
      return {
        ...state,
        autoRefreshInterval: action.payload,
      };
    
    case 'SETTINGS_SET_MAP_DEFAULT_ZOOM':
      return {
        ...state,
        mapDefaultZoom: action.payload,
      };
    
    case 'SETTINGS_SET_MAP_DEFAULT_CENTER':
      return {
        ...state,
        mapDefaultCenter: action.payload,
      };
    
    case 'SETTINGS_SET_TEMPERATURE_UNIT':
      return {
        ...state,
        temperatureUnit: action.payload,
      };
    
    case 'SETTINGS_SET_SHOW_TOOLTIPS':
      return {
        ...state,
        showTooltips: action.payload,
      };
    
    case 'SETTINGS_LOAD':
      return {
        ...state,
        ...action.payload,
      };
    
    default:
      return state;
  }
}

// Root reducer that combines all domain reducers
export function appReducer(state: AppState, action: AppAction): AppState {
  // Handle actions by their prefix to route to the correct reducer
  if (action.type.startsWith('AUTH_')) {
    return {
      ...state,
      auth: authReducer(state.auth, action as AuthAction),
    };
  }
  
  if (action.type.startsWith('MAP_DATA_')) {
    return {
      ...state,
      mapData: mapDataReducer(state.mapData, action as MapDataAction),
    };
  }
  
  if (action.type.startsWith('SENSOR_LAYERS_')) {
    return {
      ...state,
      sensorLayers: sensorLayersReducer(state.sensorLayers, action as SensorLayersAction),
    };
  }
  
  if (action.type.startsWith('UI_')) {
    return {
      ...state,
      ui: uiReducer(state.ui, action as UIAction),
    };
  }
  
  if (action.type.startsWith('THEME_')) {
    return {
      ...state,
      theme: themeReducer(state.theme, action as ThemeAction),
    };
  }
  
  if (action.type.startsWith('SETTINGS_')) {
    return {
      ...state,
      settings: settingsReducer(state.settings, action as SettingsAction),
    };
  }
  
  // Return state unchanged if action type is not recognized
  console.warn(`Unknown action type: ${action.type}`);
  return state;
}