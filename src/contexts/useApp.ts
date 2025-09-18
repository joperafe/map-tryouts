import { useContext } from 'react';
import { AppContext, type AppState } from './AppContext';

export const useApp = (): AppState => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};