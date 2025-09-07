// Main exports
export { InteractiveMap } from './InteractiveMap';

// Type exports
export type {
  InteractiveMapProps,
  MapConfig,
  Layer,
  MarkerLayer,
  PolygonLayer,
  HeatmapLayer,
  MarkerData,
  PolygonData,
  HeatmapPoint,
  MapControl,
  ControlsConfig,
  FeaturesConfig,
  MapEvents,
  MeasurementResult,
  PopupContent,
  MarkerIconConfig,
  PolygonStyleConfig,
  HeatmapConfig,
  ThemeConfig,
  MapPlugin,
  PluginConfig,
  DrawnShape,
  LayerMetadata,
} from './types';

// Utility exports
export { defaultTheme, getThemeColors } from './utils/theme';

// Configuration presets
export { 
  createMapConfig, 
  createMarkerLayer, 
  createPolygonLayer, 
  createHeatmapLayer,
  mapPresets 
} from './utils/config';

// Component exports for advanced usage
export { LayerRenderer } from './components/LayerRenderer';
export { MapControls } from './components/MapControls';
