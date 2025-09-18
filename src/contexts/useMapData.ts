import { useContext } from 'react';
import { MapDataContext, type MapDataContextType } from './MapDataContext';

export const useMapData = (): MapDataContextType => {
  const context = useContext(MapDataContext);
  if (!context) {
    throw new Error('useMapData must be used within a MapDataProvider');
  }
  return context;
};