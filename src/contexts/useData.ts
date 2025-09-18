import { useContext } from 'react';
import { DataContext, type DataState } from './DataContext';

export const useData = (): DataState => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};