import React, { createContext } from 'react';
import type { ReactNode } from 'react';
import type { Sensor, GreenZone } from '../types';
import { useSensors } from '../modules/dashboard/hooks/useSensors';
import { useGreenZones } from '../modules/dashboard/hooks/useGreenZones';

export interface DataState {
  // Sensors data
  sensors: Sensor[];
  sensorsLoading: boolean;
  sensorsError: string | null;
  refetchSensors: () => void;
  
  // Green zones data  
  greenZones: GreenZone[];
  greenZonesLoading: boolean;
  greenZonesError: string | null;
  refetchGreenZones: () => void;
  
  // Global refresh function
  refreshAll: () => void;
}

export const DataContext = createContext<DataState | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // Use existing hooks for data fetching
  const { 
    sensors, 
    loading: sensorsLoading, 
    error: sensorsError, 
    refetch: refetchSensors 
  } = useSensors();
  
  const { 
    greenZones, 
    loading: greenZonesLoading, 
    error: greenZonesError, 
    refetch: refetchGreenZones 
  } = useGreenZones();

  const refreshAll = () => {
    refetchSensors();
    refetchGreenZones();
  };

  return (
    <DataContext.Provider
      value={{
        sensors,
        sensorsLoading,
        sensorsError,
        refetchSensors,
        greenZones,
        greenZonesLoading,
        greenZonesError,
        refetchGreenZones,
        refreshAll,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};