export { AppProvider } from './AppContext';
export { useApp } from './useApp';
export { ThemeProvider } from './ThemeContext';
export { useTheme } from './useTheme';

// Instance Settings Context
export { InstanceSettingsProvider } from './InstanceSettingsContext';

// New unified map data context
export { MapDataProvider } from './MapDataContext';
export { useMapData } from './useMapData';

// Combined providers for cleaner App.tsx
export { AppProviders } from './AppProviders';

// Legacy contexts - TODO: Remove when migration is complete
export { DataProvider } from './DataContext';
export { useData } from './useData';
export { AirQualityProvider } from './AirQualityContext';
export { useAirQualityData } from './useAirQualityData';