import React, { createContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { Sensor } from '../types';

// Types for the sensor layers state
export interface SensorLayerData {
  sensors: Sensor[];
  loading: boolean;
  error: string | null;
  visible: boolean;
  lastUpdated?: Date;
}

export interface SensorLayersState {
  layers: Record<string, SensorLayerData>;
  collapsedSidebar: boolean;
}

// Action types
export type SensorLayersAction =
  | { type: 'SET_LAYER_SENSORS'; payload: { layerName: string; sensors: Sensor[] } }
  | { type: 'SET_LAYER_LOADING'; payload: { layerName: string; loading: boolean } }
  | { type: 'SET_LAYER_ERROR'; payload: { layerName: string; error: string | null } }
  | { type: 'SET_LAYER_VISIBILITY'; payload: { layerName: string; visible: boolean } }
  | { type: 'CLEAR_LAYER_SENSORS'; payload: { layerName: string } }
  | { type: 'TOGGLE_SIDEBAR_COLLAPSED' }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: { collapsed: boolean } };

// Initial state
const initialState: SensorLayersState = {
  layers: {},
  collapsedSidebar: false,
};

// Reducer function
const sensorLayersReducer = (state: SensorLayersState, action: SensorLayersAction): SensorLayersState => {
  switch (action.type) {
    case 'SET_LAYER_SENSORS':
      return {
        ...state,
        layers: {
          ...state.layers,
          [action.payload.layerName]: {
            ...state.layers[action.payload.layerName],
            sensors: action.payload.sensors,
            loading: false,
            error: null,
            lastUpdated: new Date(),
          },
        },
      };

    case 'SET_LAYER_LOADING':
      return {
        ...state,
        layers: {
          ...state.layers,
          [action.payload.layerName]: {
            ...state.layers[action.payload.layerName],
            sensors: state.layers[action.payload.layerName]?.sensors || [],
            loading: action.payload.loading,
            error: null,
            visible: state.layers[action.payload.layerName]?.visible ?? true,
          },
        },
      };

    case 'SET_LAYER_ERROR':
      return {
        ...state,
        layers: {
          ...state.layers,
          [action.payload.layerName]: {
            ...state.layers[action.payload.layerName],
            sensors: state.layers[action.payload.layerName]?.sensors || [],
            loading: false,
            error: action.payload.error,
            visible: state.layers[action.payload.layerName]?.visible ?? true,
          },
        },
      };

    case 'SET_LAYER_VISIBILITY':
      return {
        ...state,
        layers: {
          ...state.layers,
          [action.payload.layerName]: {
            ...state.layers[action.payload.layerName],
            sensors: state.layers[action.payload.layerName]?.sensors || [],
            loading: state.layers[action.payload.layerName]?.loading ?? false,
            error: state.layers[action.payload.layerName]?.error ?? null,
            visible: action.payload.visible,
          },
        },
      };

    case 'CLEAR_LAYER_SENSORS': {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [action.payload.layerName]: _removed, ...remainingLayers } = state.layers;
      return {
        ...state,
        layers: remainingLayers,
      };
    }

    case 'TOGGLE_SIDEBAR_COLLAPSED':
      return {
        ...state,
        collapsedSidebar: !state.collapsedSidebar,
      };

    case 'SET_SIDEBAR_COLLAPSED':
      return {
        ...state,
        collapsedSidebar: action.payload.collapsed,
      };

    default:
      return state;
  }
};

// Context
interface SensorLayersContextValue {
  state: SensorLayersState;
  dispatch: React.Dispatch<SensorLayersAction>;
  // Convenience methods
  setSensorLayer: (layerName: string, sensors: Sensor[]) => void;
  setLayerLoading: (layerName: string, loading: boolean) => void;
  setLayerError: (layerName: string, error: string | null) => void;
  setLayerVisibility: (layerName: string, visible: boolean) => void;
  clearSensorLayer: (layerName: string) => void;
  toggleSidebarCollapsed: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  // Selectors
  getActiveSensors: () => Sensor[];
  getVisibleLayers: () => Record<string, SensorLayerData>;
  getLayerSensors: (layerName: string) => Sensor[];
  isLayerVisible: (layerName: string) => boolean;
  isLayerLoading: (layerName: string) => boolean;
  getLayerError: (layerName: string) => string | null;
}

const SensorLayersContext = createContext<SensorLayersContextValue | undefined>(undefined);

// Export context for use in custom hook
export { SensorLayersContext };

// Provider component
interface SensorLayersProviderProps {
  children: ReactNode;
}

export const SensorLayersProvider: React.FC<SensorLayersProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(sensorLayersReducer, initialState);

  // Convenience methods
  const setSensorLayer = (layerName: string, sensors: Sensor[]) => {
    dispatch({ type: 'SET_LAYER_SENSORS', payload: { layerName, sensors } });
  };

  const setLayerLoading = (layerName: string, loading: boolean) => {
    dispatch({ type: 'SET_LAYER_LOADING', payload: { layerName, loading } });
  };

  const setLayerError = (layerName: string, error: string | null) => {
    dispatch({ type: 'SET_LAYER_ERROR', payload: { layerName, error } });
  };

  const setLayerVisibility = (layerName: string, visible: boolean) => {
    dispatch({ type: 'SET_LAYER_VISIBILITY', payload: { layerName, visible } });
  };

  const clearSensorLayer = (layerName: string) => {
    dispatch({ type: 'CLEAR_LAYER_SENSORS', payload: { layerName } });
  };

  const toggleSidebarCollapsed = () => {
    dispatch({ type: 'TOGGLE_SIDEBAR_COLLAPSED' });
  };

  const setSidebarCollapsed = (collapsed: boolean) => {
    dispatch({ type: 'SET_SIDEBAR_COLLAPSED', payload: { collapsed } });
  };

  // Selectors
  const getActiveSensors = (): Sensor[] => {
    return Object.values(state.layers)
      .filter(layer => layer.visible)
      .flatMap(layer => layer.sensors);
  };

  const getVisibleLayers = (): Record<string, SensorLayerData> => {
    return Object.fromEntries(
      Object.entries(state.layers).filter(([, layer]) => layer.visible)
    );
  };

  const getLayerSensors = (layerName: string): Sensor[] => {
    return state.layers[layerName]?.sensors || [];
  };

  const isLayerVisible = (layerName: string): boolean => {
    return state.layers[layerName]?.visible ?? false;
  };

  const isLayerLoading = (layerName: string): boolean => {
    return state.layers[layerName]?.loading ?? false;
  };

  const getLayerError = (layerName: string): string | null => {
    return state.layers[layerName]?.error ?? null;
  };

  const contextValue: SensorLayersContextValue = {
    state,
    dispatch,
    setSensorLayer,
    setLayerLoading,
    setLayerError,
    setLayerVisibility,
    clearSensorLayer,
    toggleSidebarCollapsed,
    setSidebarCollapsed,
    getActiveSensors,
    getVisibleLayers,
    getLayerSensors,
    isLayerVisible,
    isLayerLoading,
    getLayerError,
  };

  return (
    <SensorLayersContext.Provider value={contextValue}>
      {children}
    </SensorLayersContext.Provider>
  );
};

// Export types for use in other components
export type { SensorLayersContextValue };