import { createContext } from 'react';
import type { AppState, AppAction, BoundActionCreators } from './types';

// Context interface that combines state and actions
export interface AppStoreContextValue {
  // State
  state: AppState;
  
  // Raw dispatch for advanced use cases
  dispatch: React.Dispatch<AppAction>;
  
  // Bound action creators organized by domain
  actions: BoundActionCreators;
}

// Create the context
export const AppStoreContext = createContext<AppStoreContextValue | undefined>(undefined);