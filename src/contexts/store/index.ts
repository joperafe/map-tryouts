// Core store files
export type * from './types';
export { appReducer, initialAppState } from './reducer';
export { actionCreators } from './actions';
export { AppStoreContext, type AppStoreContextValue } from './context';
export { AppStoreProvider } from './provider';

// Hooks - main exports
export {
  useAppStore,
  useAuth,
  useMapData,
  useSensorLayers,
  useUI,
  useTheme,
  useSettings,
  useSensors,
  useGreenZones,
  useAirQuality,
} from './hooks';

// Re-export hooks with new unified names for consistency
export { useAuth as useAppAuth } from './hooks';
export { useMapData as useAppMapData } from './hooks';
export { useUI as useAppUI } from './hooks';
export { useTheme as useAppTheme } from './hooks';
export { useSettings as useAppSettings } from './hooks';