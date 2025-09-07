import { MapConfig, Layer } from '../types';

/**
 * Creates a map configuration with sensible defaults
 */
export function createMapConfig(overrides: Partial<MapConfig> = {}): MapConfig {
  const defaultConfig: MapConfig = {
    initialCenter: [38.7223, -9.1393], // Lisbon, Portugal
    initialZoom: 10,
    minZoom: 1,
    maxZoom: 18,
    layers: [],
    controls: {
      showZoom: true,
      showFullscreen: true,
      showLayers: true,
      showMeasurement: true,
      showDrawing: true,
    },
    features: {
      clickableMarkers: true,
      draggableMarkers: false,
      zoomOnMarkerClick: true,
      clustering: false,
      drawing: {
        enabled: true,
        tools: ['marker', 'polyline', 'polygon', 'rectangle', 'circle'],
      },
      measurement: {
        enabled: true,
        units: 'metric',
      },
    },
    theme: 'light',
    plugins: [],
    events: {},
  };

  return {
    ...defaultConfig,
    ...overrides,
    controls: {
      ...defaultConfig.controls,
      ...overrides.controls,
    },
    features: {
      ...defaultConfig.features,
      ...overrides.features,
      drawing: overrides.features?.drawing ? {
        enabled: overrides.features.drawing.enabled ?? defaultConfig.features.drawing!.enabled,
        tools: overrides.features.drawing.tools ?? defaultConfig.features.drawing!.tools,
        style: overrides.features.drawing.style ?? defaultConfig.features.drawing!.style,
      } : defaultConfig.features.drawing,
      measurement: overrides.features?.measurement ? {
        enabled: overrides.features.measurement.enabled ?? defaultConfig.features.measurement!.enabled,
        units: overrides.features.measurement.units ?? defaultConfig.features.measurement!.units,
      } : defaultConfig.features.measurement,
    },
  };
}

/**
 * Creates a marker layer configuration
 */
export function createMarkerLayer(
  id: string,
  name: string,
  data: Array<{ lat: number; lng: number; popup?: string; metadata?: Record<string, unknown> }>,
  options: Partial<Layer> = {}
): Layer {
  return {
    id,
    name,
    type: 'marker',
    data: data.map(item => ({
      position: [item.lat, item.lng],
      popup: item.popup,
      metadata: item.metadata,
    })),
    visible: true,
    opacity: 1,
    zIndex: 1,
    ...options,
  } as Layer;
}

/**
 * Creates a polygon layer configuration
 */
export function createPolygonLayer(
  id: string,
  name: string,
  data: Array<{ coordinates: number[][]; popup?: string; metadata?: Record<string, unknown> }>,
  options: Partial<Layer> = {}
): Layer {
  return {
    id,
    name,
    type: 'polygon',
    data: data.map(item => ({
      coordinates: item.coordinates,
      popup: item.popup,
      metadata: item.metadata,
    })),
    visible: true,
    opacity: 0.7,
    zIndex: 1,
    style: {
      fillColor: '#3b82f6',
      fillOpacity: 0.5,
      color: '#1e40af',
      weight: 2,
    },
    ...options,
  } as Layer;
}

/**
 * Creates a heatmap layer configuration
 */
export function createHeatmapLayer(
  id: string,
  name: string,
  data: Array<{ lat: number; lng: number; intensity?: number; metadata?: Record<string, unknown> }>,
  options: Partial<Layer> = {}
): Layer {
  return {
    id,
    name,
    type: 'heatmap',
    data: data.map(item => ({
      lat: item.lat,
      lng: item.lng,
      intensity: item.intensity || 1,
      metadata: item.metadata,
    })),
    visible: true,
    opacity: 0.8,
    zIndex: 1,
    config: {
      radius: 25,
      blur: 15,
      maxZoom: 17,
    },
    ...options,
  } as Layer;
}

/**
 * Preset configurations for common map types
 */
export const mapPresets = {
  /**
   * Basic map with zoom and fullscreen controls
   */
  basic: (): MapConfig => createMapConfig({
    controls: {
      showZoom: true,
      showFullscreen: true,
      showLayers: false,
      showMeasurement: false,
      showDrawing: false,
    },
    features: {
      clickableMarkers: true,
      draggableMarkers: false,
      zoomOnMarkerClick: true,
      clustering: false,
      drawing: { enabled: false },
      measurement: { enabled: false },
    },
  }),

  /**
   * Dashboard map with all controls and features
   */
  dashboard: (): MapConfig => createMapConfig({
    controls: {
      showZoom: true,
      showFullscreen: true,
      showLayers: true,
      showMeasurement: true,
      showDrawing: true,
    },
    features: {
      clickableMarkers: true,
      draggableMarkers: true,
      zoomOnMarkerClick: true,
      clustering: true,
      drawing: {
        enabled: true,
        tools: ['marker', 'polyline', 'polygon', 'rectangle', 'circle'],
      },
      measurement: {
        enabled: true,
        units: 'metric',
      },
    },
  }),

  /**
   * Read-only map for display purposes
   */
  display: (): MapConfig => createMapConfig({
    controls: {
      showZoom: true,
      showFullscreen: false,
      showLayers: false,
      showMeasurement: false,
      showDrawing: false,
    },
    features: {
      clickableMarkers: true,
      draggableMarkers: false,
      zoomOnMarkerClick: false,
      clustering: true,
      drawing: { enabled: false },
      measurement: { enabled: false },
    },
  }),

  /**
   * Analysis map with drawing and measurement tools
   */
  analysis: (): MapConfig => createMapConfig({
    controls: {
      showZoom: true,
      showFullscreen: true,
      showLayers: true,
      showMeasurement: true,
      showDrawing: true,
    },
    features: {
      clickableMarkers: true,
      draggableMarkers: false,
      zoomOnMarkerClick: false,
      clustering: false,
      drawing: {
        enabled: true,
        tools: ['polyline', 'polygon', 'rectangle', 'circle'],
      },
      measurement: {
        enabled: true,
        units: 'metric',
      },
    },
  }),
};
