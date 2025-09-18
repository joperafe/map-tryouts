# MapDataContext - Unified State Management

## Overview
The `MapDataContext` is a unified React context that manages all map-related data (sensors, green zones, and air quality stations) in a single provider, eliminating prop drilling throughout the application.

## Architecture

### Context Structure
- **MapDataProvider**: Single provider component that wraps the app
- **useMapData**: Hook to consume the context data
- **useReducer**: Manages complex state with actions for loading, errors, and data updates

### State Management
```typescript
interface MapDataState {
  sensors: Sensor[];
  greenZones: GreenZone[];
  airQualityStations: AirQualityObservedRaw[];
  loading: {
    sensors: boolean;
    greenZones: boolean;
    airQuality: boolean;
    general: boolean;
  };
  errors: {
    sensors: string | null;
    greenZones: string | null;
    airQuality: string | null;
  };
  layersVisible: {
    sensors: boolean;
    greenZones: boolean;
    airQuality: boolean;
  };
}
```

## Usage

### Provider Setup (App.tsx)
```tsx
import { MapDataProvider } from './contexts';

function App() {
  return (
    <AppProvider>
      <ThemeProvider>
        <MapDataProvider>
          {/* Your app components */}
        </MapDataProvider>
      </ThemeProvider>
    </AppProvider>
  );
}
```

### Consuming Data
```tsx
import { useMapData } from '../contexts';

function MyComponent() {
  const {
    sensors,
    greenZones,
    airQualityStations,
    loading,
    errors,
    refreshAllLayers,
    refreshSensors,
    refreshGreenZones,
    refreshAirQuality,
    setLayerVisibility,
  } = useMapData();

  // Access data directly without prop drilling
  return (
    <div>
      {loading.sensors ? 'Loading...' : `${sensors.length} sensors`}
      {errors.sensors && <div>Error: {errors.sensors}</div>}
    </div>
  );
}
```

## Actions Available

### Data Refresh
- `refreshSensors()`: Reload sensor data
- `refreshGreenZones()`: Reload green zone data  
- `refreshAirQuality()`: Reload air quality station data
- `refreshAllLayers()`: Reload all data simultaneously

### Layer Visibility
- `setLayerVisibility(layer, visible)`: Control which layers are visible on the map

## Benefits

1. **No Prop Drilling**: Components can access data directly from context
2. **Unified Loading States**: Consistent loading/error handling across all data types
3. **Centralized Data Management**: Single source of truth for all map data
4. **Performance**: Uses useCallback and React.memo patterns for optimization
5. **Type Safety**: Full TypeScript support with proper interfaces

## Migration Notes

### Replaced Components
- **DataProvider** → MapDataProvider (sensors, green zones)
- **AirQualityProvider** → Included in MapDataProvider
- **useData** → useMapData
- **useAirQualityData** → useMapData

### Updated Components
- **Dashboard.tsx**: Uses unified context instead of separate providers
- **MapView.tsx**: Gets data from context instead of props
- **App.tsx**: Single MapDataProvider instead of multiple providers

## Files

### Core Files
- `src/contexts/MapDataContext.tsx` - Main context and provider
- `src/contexts/useMapData.ts` - Hook for consuming context
- `src/contexts/index.ts` - Exports for easy importing

### Legacy Files (marked for removal)
- `src/contexts/DataContext.tsx` - ⚠️ Legacy (replaced by MapDataContext)
- `src/contexts/AirQualityContext.tsx` - ⚠️ Legacy (replaced by MapDataContext)
- `src/contexts/useData.ts` - ⚠️ Legacy (replaced by useMapData)
- `src/contexts/useAirQualityData.ts` - ⚠️ Legacy (replaced by useMapData)