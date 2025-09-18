import React, { createContext, useReducer, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Sensor, GreenZone } from '../types';
import type { AirQualityStation } from '../types/airQuality';
import { httpService } from '../services';
import { AirQualityService } from '../services/airQualityService';

// Types for the unified map data state
interface MapDataState {
  // Core data
  sensors: Sensor[];
  greenZones: GreenZone[];
  airQualityStations: AirQualityStation[];
  
  // Loading states
  loading: {
    sensors: boolean;
    greenZones: boolean;
    airQuality: boolean;
    general: boolean;
  };
  
  // Error states
  errors: {
    sensors: string | null;
    greenZones: string | null;
    airQuality: string | null;
  };
  
  // Last updated timestamps
  lastUpdated: {
    sensors: Date | null;
    greenZones: Date | null;
    airQuality: Date | null;
  };
  
  // Layer visibility
  layersVisible: {
    sensors: boolean;
    greenZones: boolean;
    airQuality: boolean;
    heatmap: boolean;
  };
}

// Action types for the reducer
type MapDataAction =
  | { type: 'SET_LOADING'; payload: { layer: keyof MapDataState['loading']; loading: boolean } }
  | { type: 'SET_ERROR'; payload: { layer: keyof MapDataState['errors']; error: string | null } }
  | { type: 'SET_SENSORS'; payload: Sensor[] }
  | { type: 'SET_GREEN_ZONES'; payload: GreenZone[] }
  | { type: 'SET_AIR_QUALITY_STATIONS'; payload: AirQualityStation[] }
  | { type: 'SET_LAYER_VISIBILITY'; payload: { layer: keyof MapDataState['layersVisible']; visible: boolean } }
  | { type: 'REFRESH_ALL_START' }
  | { type: 'REFRESH_ALL_END' };

// Context interface
export interface MapDataContextType extends MapDataState {
  // Actions
  setLayerVisibility: (layer: keyof MapDataState['layersVisible'], visible: boolean) => void;
  refreshSensors: () => Promise<void>;
  refreshGreenZones: () => Promise<void>;
  refreshAirQuality: () => Promise<void>;
  refreshAllLayers: () => Promise<void>;
}

// Initial state
const initialState: MapDataState = {
  sensors: [],
  greenZones: [],
  airQualityStations: [],
  loading: {
    sensors: false,
    greenZones: false,
    airQuality: false,
    general: false,
  },
  errors: {
    sensors: null,
    greenZones: null,
    airQuality: null,
  },
  lastUpdated: {
    sensors: null,
    greenZones: null,
    airQuality: null,
  },
  layersVisible: {
    sensors: true,
    greenZones: true,
    airQuality: true,
    heatmap: false,
  },
};

// Reducer function
const mapDataReducer = (state: MapDataState, action: MapDataAction): MapDataState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.layer]: action.payload.loading,
        },
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload.layer]: action.payload.error,
        },
      };
    
    case 'SET_SENSORS':
      return {
        ...state,
        sensors: action.payload,
        lastUpdated: {
          ...state.lastUpdated,
          sensors: new Date(),
        },
        errors: {
          ...state.errors,
          sensors: null,
        },
      };
    
    case 'SET_GREEN_ZONES':
      return {
        ...state,
        greenZones: action.payload,
        lastUpdated: {
          ...state.lastUpdated,
          greenZones: new Date(),
        },
        errors: {
          ...state.errors,
          greenZones: null,
        },
      };
    
    case 'SET_AIR_QUALITY_STATIONS':
      return {
        ...state,
        airQualityStations: action.payload,
        lastUpdated: {
          ...state.lastUpdated,
          airQuality: new Date(),
        },
        errors: {
          ...state.errors,
          airQuality: null,
        },
      };
    
    case 'SET_LAYER_VISIBILITY':
      return {
        ...state,
        layersVisible: {
          ...state.layersVisible,
          [action.payload.layer]: action.payload.visible,
        },
      };
    
    case 'REFRESH_ALL_START':
      return {
        ...state,
        loading: {
          ...state.loading,
          general: true,
        },
      };
    
    case 'REFRESH_ALL_END':
      return {
        ...state,
        loading: {
          ...state.loading,
          general: false,
        },
      };
    
    default:
      return state;
  }
};

// Create context
// eslint-disable-next-line react-refresh/only-export-components
export const MapDataContext = createContext<MapDataContextType | undefined>(undefined);

// Provider component
interface MapDataProviderProps {
  children: ReactNode;
}

export const MapDataProvider: React.FC<MapDataProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(mapDataReducer, initialState);

  // Helper function to handle async operations with loading/error states
  const handleAsyncOperation = useCallback(async <T,>(
    operation: () => Promise<T>,
    layer: keyof MapDataState['loading'],
    onSuccess: (data: T) => void,
  ) => {
    dispatch({ type: 'SET_LOADING', payload: { layer, loading: true } });
    dispatch({ type: 'SET_ERROR', payload: { layer: layer as keyof MapDataState['errors'], error: null } });
    
    try {
      const data = await operation();
      onSuccess(data);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      dispatch({ 
        type: 'SET_ERROR', 
        payload: { 
          layer: layer as keyof MapDataState['errors'], 
          error: errorMessage 
        } 
      });
      console.error(`Error loading ${layer}:`, error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: { layer, loading: false } });
    }
  }, []); // dispatch is stable from useReducer

  // Action functions
  const setLayerVisibility = (layer: keyof MapDataState['layersVisible'], visible: boolean) => {
    dispatch({ type: 'SET_LAYER_VISIBILITY', payload: { layer, visible } });
  };

  const refreshSensors = useCallback(async () => {
    await handleAsyncOperation(
      async () => {
        const response = await httpService.getSensors();
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to fetch sensors');
        }
      },
      'sensors',
      (sensors) => dispatch({ type: 'SET_SENSORS', payload: sensors })
    );
  }, [handleAsyncOperation]);

  const refreshGreenZones = useCallback(async () => {
    await handleAsyncOperation(
      async () => {
        const response = await httpService.getGreenZones();
        if (response.success && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to fetch green zones');
        }
      },
      'greenZones',
      (zones) => dispatch({ type: 'SET_GREEN_ZONES', payload: zones })
    );
  }, [handleAsyncOperation]);

  const refreshAirQuality = useCallback(async () => {
    await handleAsyncOperation(
      () => AirQualityService.getAirQualityStations(),
      'airQuality',
      (stations) => dispatch({ type: 'SET_AIR_QUALITY_STATIONS', payload: stations })
    );
  }, [handleAsyncOperation]);

  const refreshAllLayers = useCallback(async () => {
    dispatch({ type: 'REFRESH_ALL_START' });
    
    try {
      await Promise.allSettled([
        refreshSensors(),
        refreshGreenZones(),
        refreshAirQuality(),
      ]);
    } finally {
      dispatch({ type: 'REFRESH_ALL_END' });
    }
  }, [refreshSensors, refreshGreenZones, refreshAirQuality]);

  // Initial data loading - runs only once on mount
  useEffect(() => {
    // Load data on mount without calling refreshAllLayers to avoid duplicate calls
    Promise.allSettled([
      refreshSensors(),
      refreshGreenZones(), 
      refreshAirQuality(),
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this only runs once on mount

  const contextValue: MapDataContextType = {
    ...state,
    setLayerVisibility,
    refreshSensors,
    refreshGreenZones,
    refreshAirQuality,
    refreshAllLayers,
  };

  return (
    <MapDataContext.Provider value={contextValue}>
      {children}
    </MapDataContext.Provider>
  );
};