import { useContext } from 'react';
import { SensorLayersContext } from './SensorLayersContext';
import type { SensorLayersContextValue } from './SensorLayersContext';

// Custom hook to use the sensor layers context
export const useSensorLayers = (): SensorLayersContextValue => {
  const context = useContext(SensorLayersContext);
  if (context === undefined) {
    throw new Error('useSensorLayers must be used within a SensorLayersProvider');
  }
  return context;
};