import { useContext } from 'react';
import { AppStoreContext } from './context';

/**
 * Base hook to access the unified app store
 * Provides access to the complete state and all actions
 */
export const useAppStore = () => {
  const context = useContext(AppStoreContext);
  if (!context) {
    throw new Error('useAppStore must be used within an AppStoreProvider');
  }
  return context;
};

/**
 * Hook to access authentication state and actions
 * Provides typed access to auth-specific functionality
 */
export const useAuth = () => {
  const { state, actions } = useAppStore();
  
  return {
    // Auth state
    user: state.auth.user,
    isAuthenticated: state.auth.isAuthenticated,
    isLoading: state.auth.isLoading,
    error: state.auth.error,
    sessionExpiry: state.auth.sessionExpiry,
    rememberMe: state.auth.rememberMe,
    lastActivity: state.auth.lastActivity,
    debugMode: state.auth.debugMode,
    
    // Auth actions
    login: actions.auth.login,
    logout: actions.auth.logout,
    refreshToken: actions.auth.refreshToken,
    setSessionExpiry: actions.auth.setSessionExpiry,
    updateLastActivity: actions.auth.updateLastActivity,
    toggleDebugMode: actions.auth.toggleDebugMode,
    clearError: actions.auth.clearError,
  };
};

/**
 * Hook to access map data state and actions
 * Provides typed access to sensors, green zones, and air quality data
 */
export const useMapData = () => {
  const { state, actions } = useAppStore();
  
  return {
    // Map data state
    sensors: state.mapData.sensors,
    greenZones: state.mapData.greenZones,
    airQualityStations: state.mapData.airQualityStations,
    loading: state.mapData.loading,
    errors: state.mapData.errors,
    lastUpdated: state.mapData.lastUpdated,
    layersVisible: state.mapData.layersVisible,
    currentBaseMap: state.mapData.currentBaseMap,
    
    // Map data actions
    setLayerVisibility: actions.mapData.setLayerVisibility,
    setBaseMap: actions.mapData.setBaseMap,
    refreshSensors: actions.mapData.refreshSensors,
    refreshGreenZones: actions.mapData.refreshGreenZones,
    refreshAirQuality: actions.mapData.refreshAirQuality,
    refreshAllLayers: actions.mapData.refreshAllLayers,
  };
};

/**
 * Hook to access sensor layers state and actions
 * Provides typed access to sensor layer management
 */
export const useSensorLayers = () => {
  const { state, actions } = useAppStore();
  
  return {
    // Sensor layers state
    layers: state.sensorLayers.layers,
    collapsedSidebar: state.sensorLayers.collapsedSidebar,
    
    // Sensor layers actions
    setSensorLayer: actions.sensorLayers.setSensorLayer,
    setLayerLoading: actions.sensorLayers.setLayerLoading,
    setLayerError: actions.sensorLayers.setLayerError,
    setLayerVisibility: actions.sensorLayers.setLayerVisibility,
    clearSensorLayer: actions.sensorLayers.clearSensorLayer,
    toggleSidebarCollapsed: actions.sensorLayers.toggleSidebarCollapsed,
    setSidebarCollapsed: actions.sensorLayers.setSidebarCollapsed,
    
    // Convenience selectors
    getActiveSensors: () => {
      return Object.values(state.sensorLayers.layers)
        .filter(layer => layer.visible)
        .flatMap(layer => layer.sensors);
    },
    
    getVisibleLayers: () => {
      return Object.fromEntries(
        Object.entries(state.sensorLayers.layers).filter(([, layer]) => layer.visible)
      );
    },
    
    getLayerSensors: (layerName: string) => {
      return state.sensorLayers.layers[layerName]?.sensors || [];
    },
    
    isLayerVisible: (layerName: string) => {
      return state.sensorLayers.layers[layerName]?.visible ?? false;
    },
    
    isLayerLoading: (layerName: string) => {
      return state.sensorLayers.layers[layerName]?.loading ?? false;
    },
    
    getLayerError: (layerName: string) => {
      return state.sensorLayers.layers[layerName]?.error ?? null;
    },
  };
};

/**
 * Hook to access UI state and actions
 * Provides typed access to UI controls and notifications
 */
export const useUI = () => {
  const { state, actions } = useAppStore();
  
  return {
    // UI state
    sidebarCollapsed: state.ui.sidebarCollapsed,
    fullscreenMode: state.ui.fullscreenMode,
    debugPanelVisible: state.ui.debugPanelVisible,
    drawingMode: state.ui.drawingMode,
    measurementMode: state.ui.measurementMode,
    addSensorMode: state.ui.addSensorMode,
    selectedPosition: state.ui.selectedPosition,
    globalLoading: state.ui.globalLoading,
    notifications: state.ui.notifications,
    
    // UI actions
    setSidebarCollapsed: actions.ui.setSidebarCollapsed,
    setFullscreenMode: actions.ui.setFullscreenMode,
    setDebugPanelVisible: actions.ui.setDebugPanelVisible,
    setDrawingMode: actions.ui.setDrawingMode,
    setMeasurementMode: actions.ui.setMeasurementMode,
    setAddSensorMode: actions.ui.setAddSensorMode,
    setSelectedPosition: actions.ui.setSelectedPosition,
    setGlobalLoading: actions.ui.setGlobalLoading,
    addNotification: actions.ui.addNotification,
    removeNotification: actions.ui.removeNotification,
    clearNotifications: actions.ui.clearNotifications,
  };
};

/**
 * Hook to access theme state and actions
 * Provides typed access to theme management
 */
export const useTheme = () => {
  const { state, actions } = useAppStore();
  
  return {
    // Theme state
    mode: state.theme.mode,
    systemPreference: state.theme.systemPreference,
    customColors: state.theme.customColors,
    
    // Theme actions
    setMode: actions.theme.setMode,
    setSystemPreference: actions.theme.setSystemPreference,
    setCustomColors: actions.theme.setCustomColors,
    
    // Computed values
    isDarkMode: state.theme.mode === 'dark' || 
      (state.theme.mode === 'system' && state.theme.systemPreference === 'dark'),
  };
};

/**
 * Hook to access settings state and actions
 * Provides typed access to app configuration
 */
export const useSettings = () => {
  const { state, actions } = useAppStore();
  
  return {
    // Settings state
    language: state.settings.language,
    environment: state.settings.environment,
    debugEnabled: state.settings.debugEnabled,
    autoRefreshInterval: state.settings.autoRefreshInterval,
    mapDefaultZoom: state.settings.mapDefaultZoom,
    mapDefaultCenter: state.settings.mapDefaultCenter,
    temperatureUnit: state.settings.temperatureUnit,
    showTooltips: state.settings.showTooltips,
    
    // Settings actions
    setLanguage: actions.settings.setLanguage,
    setEnvironment: actions.settings.setEnvironment,
    setDebugEnabled: actions.settings.setDebugEnabled,
    setAutoRefreshInterval: actions.settings.setAutoRefreshInterval,
    setMapDefaultZoom: actions.settings.setMapDefaultZoom,
    setMapDefaultCenter: actions.settings.setMapDefaultCenter,
    setTemperatureUnit: actions.settings.setTemperatureUnit,
    setShowTooltips: actions.settings.setShowTooltips,
    loadSettings: actions.settings.loadSettings,
  };
};

/**
 * Hook specifically for sensor data (sugar for useMapData().sensors)
 * Provides quick access to just sensor-related data
 */
export const useSensors = () => {
  const { sensors, loading, errors, refreshSensors } = useMapData();
  
  return {
    sensors,
    loading: loading.sensors,
    error: errors.sensors,
    refresh: refreshSensors,
  };
};

/**
 * Hook specifically for green zones data (sugar for useMapData().greenZones)
 * Provides quick access to just green zone-related data
 */
export const useGreenZones = () => {
  const { greenZones, loading, errors, refreshGreenZones } = useMapData();
  
  return {
    greenZones,
    loading: loading.greenZones,
    error: errors.greenZones,
    refresh: refreshGreenZones,
  };
};

/**
 * Hook specifically for air quality data (sugar for useMapData().airQualityStations)
 * Provides quick access to just air quality-related data
 */
export const useAirQuality = () => {
  const { airQualityStations, loading, errors, refreshAirQuality } = useMapData();
  
  return {
    stations: airQualityStations,
    loading: loading.airQuality,
    error: errors.airQuality,
    refresh: refreshAirQuality,
  };
};