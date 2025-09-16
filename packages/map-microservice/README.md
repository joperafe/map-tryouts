# @climate-app/map-microservice

A flexible, reusable React map component built with TypeScript and Leaflet. This microservice provides a complete mapping solution that can be easily configured and integrated into any React application.

## Features

- 🗺️ **Interactive Maps**: Built with Leaflet for high performance
- 🎨 **Theme Support**: Light, dark, and auto themes
- 🔧 **Highly Configurable**: Extensive configuration options
- 📊 **Multiple Layer Types**: Markers, polygons, and heatmaps
- 📏 **Drawing & Measurement Tools**: Built-in drawing and measurement capabilities
- 🎯 **TypeScript Support**: Full type safety and IntelliSense
- 📱 **Responsive**: Works on all device sizes
- 🔌 **Plugin System**: Extensible architecture

## Installation

```bash
npm install @climate-app/map-microservice
# or
yarn add @climate-app/map-microservice
```

### Peer Dependencies

Make sure to install the required peer dependencies:

```bash
npm install react react-dom leaflet react-leaflet leaflet-draw
# or
yarn add react react-dom leaflet react-leaflet leaflet-draw
```

## Quick Start

{% raw %}
```tsx
import React from 'react';
import { InteractiveMap, createMapConfig } from '@climate-app/map-microservice';

function App() {
  const mapConfig = createMapConfig({
    initialCenter: [40.7128, -74.0060], // New York City
    initialZoom: 12,
    controls: {
      showZoom: true,
      showFullscreen: true,
    },
    features: {
      clickableMarkers: true,
    }
  });

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <InteractiveMap
        config={mapConfig}
        layers={[]}
      />
    </div>
  );
}

export default App;
```
{% endraw %}

## Configuration

### Map Presets

Use predefined configurations for common use cases:

```tsx
import { mapPresets } from '@climate-app/map-microservice';

// Basic map with minimal controls
const basicConfig = mapPresets.basic();

// Full-featured dashboard map
const dashboardConfig = mapPresets.dashboard();

// Read-only display map
const displayConfig = mapPresets.display();

// Analysis map with drawing tools
const analysisConfig = mapPresets.analysis();
```

### Custom Configuration

Create custom configurations with `createMapConfig`:

```tsx
import { createMapConfig } from '@climate-app/map-microservice';

const customConfig = createMapConfig({
  initialCenter: [51.505, -0.09], // London
  initialZoom: 13,
  controls: {
    showZoom: true,
    showFullscreen: true,
    showLayers: true,
    showMeasurement: true,
    showDrawing: false,
  },
  features: {
    clickableMarkers: true,
    draggableMarkers: false,
    zoomOnMarkerClick: true,
    clustering: true,
    drawing: {
      enabled: false
    },
    measurement: {
      enabled: true,
      units: 'metric'
    }
  },
  theme: 'auto'
});
```

## Layers

### Marker Layers

```tsx
import { createMarkerLayer } from '@climate-app/map-microservice';

const markerLayer = createMarkerLayer(
  'my-markers',
  'Sample Locations',
  [
    {
      lat: 40.7128,
      lng: -74.0060,
      popup: 'New York City',
      metadata: { category: 'city' }
    },
    {
      lat: 40.7589,
      lng: -73.9851,
      popup: 'Times Square',
      metadata: { category: 'landmark' }
    }
  ],
  {
    icon: {
      iconUrl: '/path/to/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    }
  }
);
```

### Polygon Layers

```tsx
import { createPolygonLayer } from '@climate-app/map-microservice';

const polygonLayer = createPolygonLayer(
  'zones',
  'Zones',
  [
    {
      coordinates: [
        [40.7128, -74.0060],
        [40.7589, -73.9851],
        [40.7282, -73.9942],
        [40.7128, -74.0060]
      ],
      popup: 'Manhattan Zone',
      metadata: { type: 'restricted' }
    }
  ],
  {
    style: {
      fillColor: '#ff0000',
      fillOpacity: 0.3,
      color: '#ff0000',
      weight: 2
    }
  }
);
```

### Heatmap Layers

```tsx
import { createHeatmapLayer } from '@climate-app/map-microservice';

const heatmapLayer = createHeatmapLayer(
  'temperature',
  'Temperature Data',
  [
    { lat: 40.7128, lng: -74.0060, intensity: 0.8 },
    { lat: 40.7589, lng: -73.9851, intensity: 0.6 },
    { lat: 40.7282, lng: -73.9942, intensity: 0.9 }
  ],
  {
    config: {
      radius: 20,
      blur: 15,
      maxZoom: 17
    }
  }
);
```

## Events

Handle map interactions with event callbacks:

{% raw %}
```tsx
<InteractiveMap
  config={mapConfig}
  layers={layers}
  events={{
    onMapClick: (event) => {
      console.log('Map clicked at:', event.latlng);
    },
    onMarkerClick: (marker) => {
      console.log('Marker clicked:', marker);
    },
    onDrawCreated: (shape) => {
      console.log('Shape created:', shape);
    }
  }}
  onMapReady={(map) => {
    console.log('Map is ready:', map);
  }}
/>
```
{% endraw %}
      console.log('Measurement result:', result);
    }
  }}
/>
```

## Theming

The map supports light, dark, and auto themes:

```tsx
// Light theme
<InteractiveMap config={config} theme="light" />

// Dark theme
<InteractiveMap config={config} theme="dark" />

// Auto (follows system preference)
<InteractiveMap config={config} theme="auto" />
```

## TypeScript Support

All components and functions are fully typed:

```tsx
import type { 
  MapConfig, 
  Layer, 
  MapEvents,
  InteractiveMapProps 
} from '@climate-app/map-microservice';

const config: MapConfig = createMapConfig({
  // TypeScript will provide full IntelliSense
});

const handleMarkerClick = (marker: MarkerData) => {
  // Fully typed marker data
};
```

## API Reference

### Components

- `InteractiveMap` - Main map component
- `LayerRenderer` - Layer rendering component (for advanced usage)
- `MapControls` - Map controls component (for advanced usage)

### Configuration Functions

- `createMapConfig(options)` - Create map configuration
- `createMarkerLayer(id, name, data, options)` - Create marker layer
- `createPolygonLayer(id, name, data, options)` - Create polygon layer
- `createHeatmapLayer(id, name, data, options)` - Create heatmap layer

### Presets

- `mapPresets.basic()` - Basic map preset
- `mapPresets.dashboard()` - Dashboard map preset
- `mapPresets.display()` - Display map preset
- `mapPresets.analysis()` - Analysis map preset

### Types

All TypeScript types are exported for your convenience. See the full type definitions in the source code.

## Examples

Check the `examples/` directory for complete usage examples including:

- Basic maps
- Maps with markers and popups
- Dashboard maps with all features
- Analysis maps with drawing tools
- Custom styled maps

## Contributing

This microservice is designed to be reusable across multiple projects. When making changes:

1. Maintain backward compatibility
2. Add comprehensive TypeScript types
3. Update documentation
4. Add examples for new features

## License

MIT License - feel free to use in your projects!
