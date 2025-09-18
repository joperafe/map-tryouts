# Dynamic Layer Toggle Panel Configuration

## Overview
The Layer Toggle Panel in MapView is now fully dynamic and configured through the settings files. The system uses the `layer_toggle.items` array to determine which layers to render, mapping them to their configurations in `data_layers`.

## Configuration Structure

### Location
The layer configuration is defined in two places within the MAP configuration:
- `controls_settings.layer_toggle.items`: Array of layer IDs to render
- `data_layers`: Detailed configuration for each layer

**File**: `src/config/settings/configs/default.settings.json`

### Layer Control Configuration
```json
{
  "MAP": {
    "controls_settings": {
      "layer_toggle": {
        "enabled": true,
        "label": "DASHBOARD_MAP_CONTROLS_LAYERS",
        "icon": "🗂️",
        "items": ["sensors", "airQuality", "greenZones"] // Controls which layers appear
      }
    }
  }
}
```

### Layer Details Configuration
```json
{
  "MAP": {
    "data_layers": {
      "sensors": {
        "enabled": true,           // Must be true to appear
        "visible": true,           // Default visibility state
        "label": "string",         // Base translation key
        "icon": "string",          // Emoji or icon for display
        "refreshable": boolean,    // Whether the layer can be refreshed
        "count_key": "string",     // Key to get data count from context
        "translationKey": "string" // Translation key with count placeholder
      }
    }
  }
}
```

## How It Works

1. **Layer Selection**: The `layer_toggle.items` array determines which layers appear in the panel
2. **Order Matters**: Layers appear in the same order as listed in the `items` array
3. **Configuration Mapping**: Each item ID maps to a configuration object in `data_layers`
4. **Enabled Check**: Only layers with `enabled: true` will be rendered, even if listed in `items`

## Implementation Benefits

### ✅ **Simplified Architecture**
- **No Fallbacks**: Always uses configuration from `default.settings.json`
- **No Type Guards**: Direct access to configuration data
- **Clear Control**: `layer_toggle.items` explicitly controls what appears
- **Predictable Order**: Layers appear in the exact order specified

### ✅ **Easy Customization**
```json
// To show only sensors and air quality:
"layer_toggle": {
  "items": ["sensors", "airQuality"]
}

// To reorder layers:
"layer_toggle": {
  "items": ["airQuality", "sensors", "greenZones"]
}

// To temporarily disable a layer:
"data_layers": {
  "heatmap": {
    "enabled": false  // Won't appear even if in items array
  }
}
```

## Configuration Example

```json
{
  "MAP": {
    "controls_settings": {
      "layer_toggle": {
        "enabled": true,
        "label": "DASHBOARD_MAP_CONTROLS_LAYERS", 
        "icon": "🗂️",
        "items": ["sensors", "airQuality", "greenZones", "heatmap"]
      }
    },
    "data_layers": {
      "sensors": {
        "enabled": true,
        "visible": true,
        "label": "DASHBOARD_MAP_LAYERS_PANEL_SENSORS",
        "icon": "🌡️",
        "refreshable": true,
        "count_key": "sensors",
        "translationKey": "DASHBOARD_MAP_LAYERS_PANEL_SENSORS_COUNT"
      },
      "airQuality": {
        "enabled": true,
        "visible": true,
        "label": "DASHBOARD_MAP_LAYERS_PANEL_AIR_QUALITY",
        "icon": "🌬️",
        "refreshable": true,
        "count_key": "airQualityStations",
        "translationKey": "DASHBOARD_MAP_LAYERS_PANEL_AIR_QUALITY_COUNT",
        "showLegend": true,
        "offline_label": "DASHBOARD_MAP_LAYERS_PANEL_OFFLINE_DATA"
      }
    }
  }
}
```

## Implementation Details

### Architecture
- **Control Array**: `layer_toggle.items` determines which layers appear
- **Configuration Mapping**: Each item maps to `data_layers[layerId]`
- **Type Safety**: TypeScript interfaces with utility functions for access
- **No Fallbacks**: Always uses settings from configuration files

### Dynamic Features

#### Data Integration
- Automatically connects to `useMapData()` context
- Maps `count_key` to appropriate data arrays
- Handles loading states for each layer

#### Refresh Functionality
- Layers marked as `refreshable: true` get refresh buttons
- Connects to appropriate refresh functions from context
- Shows loading spinners during refresh operations

#### Error Handling
- Displays error states when data loading fails
- Shows offline mode messages for layers with `offline_label`

## Adding New Layers

1. **Add to Control Items**:
   ```json
   "layer_toggle": {
     "items": ["sensors", "airQuality", "greenZones", "myNewLayer"]
   }
   ```

2. **Define Layer Configuration**:
   ```json
   "myNewLayer": {
     "enabled": true,
     "visible": false,
     "label": "DASHBOARD_MAP_LAYERS_PANEL_MY_NEW_LAYER",
     "icon": "🆕",
     "refreshable": true,
     "count_key": "myNewLayerData",
     "translationKey": "DASHBOARD_MAP_LAYERS_PANEL_MY_NEW_LAYER_COUNT"
   }
   ```

3. **Add Translation Keys**:
   ```json
   "DASHBOARD_MAP_LAYERS_PANEL_MY_NEW_LAYER": "My New Layer",
   "DASHBOARD_MAP_LAYERS_PANEL_MY_NEW_LAYER_COUNT": "My New Layer ({{count}})"
   ```

4. **Update Data Mapping** (if needed):
   Add to `getDataForLayer`, `getLoadingForLayer`, `getErrorForLayer`, and `getRefreshFunctionForLayer` in MapView.tsx

## Benefits

- ✅ **Configuration-Driven**: No code changes needed for layer modifications
- ✅ **Explicit Control**: `items` array clearly defines what appears
- ✅ **Ordered Display**: Layers appear in the exact order specified
- ✅ **Type-Safe**: Full TypeScript support with proper interfaces
- ✅ **Internationalized**: Multi-language support out of the box
- ✅ **Extensible**: Easy to add new layers with consistent patterns
- ✅ **No Fallbacks**: Predictable behavior from configuration
- ✅ **Performance Optimized**: Only enabled layers are rendered