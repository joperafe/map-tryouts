// Main Components
export { InteractiveMap } from './InteractiveMap';

// Types
export type {
  MapConfig,
  MapSettings,
  TileLayerConfig,
  DataLayer,
  ControlSetting,
  ControlLayout,
  ControlElement,
  InteractiveMapProps,
  Layer,
  MarkerLayer,
  PolygonLayer,
  HeatmapLayer,
  BaseLayer,
  MarkerData,
  PolygonData,
  HeatmapPoint,
  MarkerIconConfig,
  PolygonStyleConfig,
  HeatmapConfig,
  PopupContent,
  MapControl,
  ControlsConfig,
  FeaturesConfig,
  MapEvents,
  MeasurementResult,
  DrawnShape,
  ThemeConfig,
  MapPlugin,
  PluginConfig,
  LayerMetadata,
} from './types';

// Utilities
export { adaptMapConfig } from './utils/configAdapter';
export type { MainAppMapConfig } from './utils/configAdapter';
