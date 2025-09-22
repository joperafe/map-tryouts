import type { 
  AppState, 
  AsyncActionCreator
} from './types';
import type { Sensor, GreenZone } from '../../types';
import type { AirQualityStation } from '../../types/airQuality';
import { httpService } from '../../services';
import { AirQualityService } from '../../services/airQualityService';
import {
  MOCK_USERS,
  MOCK_USERS_BY_ID,
  createAsyncAction,
  createMapDataLayerAction,
  createNotification,
  simulateApiDelay,
  tokenStorage,
  isValidMockToken,
  getUserIdFromMockToken
} from './utils';

import type { User } from './types';

// Mock auth service - refactored to use utilities
const mockAuthService = {
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    await simulateApiDelay(1000);
    
    const user = MOCK_USERS[email as keyof typeof MOCK_USERS];
    if (user && password === 'password') {
      return { user, token: `mock-token-${user.id}` };
    }
    
    throw new Error('Invalid credentials');
  },
  
  async logout(): Promise<void> {
    await simulateApiDelay(500);
    tokenStorage.remove();
  },
  
  async refreshToken(): Promise<{ user: User; token: string }> {
    await simulateApiDelay(500);
    
    const token = tokenStorage.get();
    if (!token) {
      throw new Error('No token found');
    }
    
    if (isValidMockToken(token)) {
      const userId = getUserIdFromMockToken(token);
      if (userId) {
        const user = MOCK_USERS_BY_ID[userId as keyof typeof MOCK_USERS_BY_ID];
        if (user) {
          return { user, token };
        }
      }
    }
    
    throw new Error('Invalid token');
  },
};

// Auth Action Creators
export const authActionCreators = {
  login: (email: string, password: string, rememberMe = false): AsyncActionCreator<{ user: User; token: string }> => {
    return createAsyncAction(
      { type: 'AUTH_LOGIN_START' },
      (data: { user: User; token: string }) => {
        // Store token using utility
        tokenStorage.set(data.token, rememberMe);
        
        return {
          type: 'AUTH_LOGIN_SUCCESS',
          payload: { user: data.user, rememberMe }
        };
      },
      (error: string) => ({ type: 'AUTH_LOGIN_FAILURE', payload: error }),
      () => mockAuthService.login(email, password)
    );
  },
  
  logout: (): AsyncActionCreator<void> => {
    return createAsyncAction(
      { type: 'AUTH_LOGOUT_START' },
      () => ({ type: 'AUTH_LOGOUT_SUCCESS' }),
      (error: string) => ({ type: 'AUTH_LOGOUT_FAILURE', payload: error }),
      () => mockAuthService.logout()
    );
  },
  
  refreshToken: (): AsyncActionCreator<User> => {
    return createAsyncAction(
      { type: 'AUTH_REFRESH_TOKEN_START' },
      (data: User) => ({
        type: 'AUTH_REFRESH_TOKEN_SUCCESS',
        payload: data
      }),
      (error: string) => ({ type: 'AUTH_REFRESH_TOKEN_FAILURE', payload: error }),
      async () => {
        const result = await mockAuthService.refreshToken();
        return result.user;
      }
    );
  },
  
  setSessionExpiry: (expiry: Date | null) => ({ type: 'AUTH_SET_SESSION_EXPIRY', payload: expiry }),
  updateLastActivity: () => ({ type: 'AUTH_UPDATE_LAST_ACTIVITY', payload: new Date() }),
  toggleDebugMode: () => ({ type: 'AUTH_TOGGLE_DEBUG_MODE' }),
  clearError: () => ({ type: 'AUTH_CLEAR_ERROR' }),
};

// Map Data Action Creators
export const mapDataActionCreators = {
  refreshSensors: (): AsyncActionCreator<Sensor[]> => {
    return createMapDataLayerAction(
      'sensors',
      async () => {
        const response = await httpService.getSensors();
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error('Failed to fetch sensors');
      },
      (data: Sensor[]) => ({ type: 'MAP_DATA_SET_SENSORS', payload: data }),
      'Failed to fetch sensors'
    );
  },
  
  refreshGreenZones: (): AsyncActionCreator<GreenZone[]> => {
    return createMapDataLayerAction(
      'greenZones',
      async () => {
        const response = await httpService.getGreenZones();
        if (response.success && response.data) {
          return response.data;
        }
        throw new Error('Failed to fetch green zones');
      },
      (data: GreenZone[]) => ({ type: 'MAP_DATA_SET_GREEN_ZONES', payload: data }),
      'Failed to fetch green zones'
    );
  },
  
  refreshAirQuality: (): AsyncActionCreator<AirQualityStation[]> => {
    return createMapDataLayerAction(
      'airQuality',
      () => AirQualityService.getAirQualityStations(),
      (data: AirQualityStation[]) => ({ type: 'MAP_DATA_SET_AIR_QUALITY_STATIONS', payload: data }),
      'Failed to fetch air quality stations'
    );
  },
  
  refreshAllLayers: (): AsyncActionCreator<void> => {
    return async (dispatch) => {
      dispatch({ type: 'MAP_DATA_REFRESH_ALL_START' });
      
      try {
        const refreshSensors = mapDataActionCreators.refreshSensors();
        const refreshGreenZones = mapDataActionCreators.refreshGreenZones();
        const refreshAirQuality = mapDataActionCreators.refreshAirQuality();
        
        await Promise.allSettled([
          refreshSensors(dispatch, () => ({} as AppState)),
          refreshGreenZones(dispatch, () => ({} as AppState)),
          refreshAirQuality(dispatch, () => ({} as AppState)),
        ]);
      } finally {
        dispatch({ type: 'MAP_DATA_REFRESH_ALL_END' });
      }
    };
  },
  
  setLayerVisibility: (layer: keyof AppState['mapData']['layersVisible'], visible: boolean) => ({
    type: 'MAP_DATA_SET_LAYER_VISIBILITY',
    payload: { layer, visible }
  }),
  
  setBaseMap: (baseMapId: string) => ({
    type: 'MAP_DATA_SET_BASE_MAP',
    payload: baseMapId
  }),
};

// Sensor Layers Action Creators
export const sensorLayersActionCreators = {
  setSensorLayer: (layerName: string, sensors: Sensor[]) => ({
    type: 'SENSOR_LAYERS_SET_LAYER_SENSORS',
    payload: { layerName, sensors }
  }),
  
  setLayerLoading: (layerName: string, loading: boolean) => ({
    type: 'SENSOR_LAYERS_SET_LAYER_LOADING',
    payload: { layerName, loading }
  }),
  
  setLayerError: (layerName: string, error: string | null) => ({
    type: 'SENSOR_LAYERS_SET_LAYER_ERROR',
    payload: { layerName, error }
  }),
  
  setLayerVisibility: (layerName: string, visible: boolean) => ({
    type: 'SENSOR_LAYERS_SET_LAYER_VISIBILITY',
    payload: { layerName, visible }
  }),
  
  clearSensorLayer: (layerName: string) => ({
    type: 'SENSOR_LAYERS_CLEAR_LAYER_SENSORS',
    payload: { layerName }
  }),
  
  toggleSidebarCollapsed: () => ({
    type: 'SENSOR_LAYERS_TOGGLE_SIDEBAR_COLLAPSED'
  }),
  
  setSidebarCollapsed: (collapsed: boolean) => ({
    type: 'SENSOR_LAYERS_SET_SIDEBAR_COLLAPSED',
    payload: { collapsed }
  }),
};

// UI Action Creators
export const uiActionCreators = {
  setSidebarCollapsed: (collapsed: boolean) => ({
    type: 'UI_SET_SIDEBAR_COLLAPSED',
    payload: collapsed
  }),
  
  setFullscreenMode: (enabled: boolean) => ({
    type: 'UI_SET_FULLSCREEN_MODE',
    payload: enabled
  }),
  
  setDebugPanelVisible: (visible: boolean) => ({
    type: 'UI_SET_DEBUG_PANEL_VISIBLE',
    payload: visible
  }),
  
  setDrawingMode: (enabled: boolean) => ({
    type: 'UI_SET_DRAWING_MODE',
    payload: enabled
  }),
  
  setMeasurementMode: (enabled: boolean) => ({
    type: 'UI_SET_MEASUREMENT_MODE',
    payload: enabled
  }),
  
  setAddSensorMode: (enabled: boolean) => ({
    type: 'UI_SET_ADD_SENSOR_MODE',
    payload: enabled
  }),
  
  setSelectedPosition: (position: [number, number] | null) => ({
    type: 'UI_SET_SELECTED_POSITION',
    payload: position
  }),
  
  setGlobalLoading: (loading: boolean) => ({
    type: 'UI_SET_GLOBAL_LOADING',
    payload: loading
  }),
  
  addNotification: (notification: { type: 'success' | 'error' | 'warning' | 'info'; message: string; duration?: number }) => ({
    type: 'UI_ADD_NOTIFICATION',
    payload: createNotification(notification.type, notification.message, notification.duration)
  }),
  
  removeNotification: (id: string) => ({
    type: 'UI_REMOVE_NOTIFICATION',
    payload: id
  }),
  
  clearNotifications: () => ({
    type: 'UI_CLEAR_NOTIFICATIONS'
  }),
};

// Theme Action Creators
export const themeActionCreators = {
  setMode: (mode: 'light' | 'dark' | 'system') => ({
    type: 'THEME_SET_MODE',
    payload: mode
  }),
  
  setSystemPreference: (preference: 'light' | 'dark') => ({
    type: 'THEME_SET_SYSTEM_PREFERENCE',
    payload: preference
  }),
  
  setCustomColors: (colors: Record<string, string>) => ({
    type: 'THEME_SET_CUSTOM_COLORS',
    payload: colors
  }),
};

// Settings Action Creators
export const settingsActionCreators = {
  setLanguage: (language: string) => ({
    type: 'SETTINGS_SET_LANGUAGE',
    payload: language
  }),
  
  setEnvironment: (environment: 'DEV' | 'INT' | 'PROD') => ({
    type: 'SETTINGS_SET_ENVIRONMENT',
    payload: environment
  }),
  
  setDebugEnabled: (enabled: boolean) => ({
    type: 'SETTINGS_SET_DEBUG_ENABLED',
    payload: enabled
  }),
  
  setAutoRefreshInterval: (interval: number) => ({
    type: 'SETTINGS_SET_AUTO_REFRESH_INTERVAL',
    payload: interval
  }),
  
  setMapDefaultZoom: (zoom: number) => ({
    type: 'SETTINGS_SET_MAP_DEFAULT_ZOOM',
    payload: zoom
  }),
  
  setMapDefaultCenter: (center: [number, number]) => ({
    type: 'SETTINGS_SET_MAP_DEFAULT_CENTER',
    payload: center
  }),
  
  setTemperatureUnit: (unit: 'celsius' | 'fahrenheit') => ({
    type: 'SETTINGS_SET_TEMPERATURE_UNIT',
    payload: unit
  }),
  
  setShowTooltips: (show: boolean) => ({
    type: 'SETTINGS_SET_SHOW_TOOLTIPS',
    payload: show
  }),
  
  loadSettings: (settings: AppState['settings']) => ({
    type: 'SETTINGS_LOAD',
    payload: settings
  }),
};

// Combined action creators export
export const actionCreators = {
  auth: authActionCreators,
  mapData: mapDataActionCreators,
  sensorLayers: sensorLayersActionCreators,
  ui: uiActionCreators,
  theme: themeActionCreators,
  settings: settingsActionCreators,
};