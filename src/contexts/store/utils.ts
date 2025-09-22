import type { 
  AppAction, 
  AsyncActionCreator
} from './types';

// Define map data layer types for utility functions
export type MapDataLayerType = 'sensors' | 'greenZones' | 'airQuality';

/**
 * Shared mock user data to avoid duplication
 */
export const MOCK_USERS = {
  'admin@example.com': { 
    id: '1', 
    email: 'admin@example.com', 
    name: 'Admin User', 
    role: 'admin' as const, 
    permissions: ['read', 'write', 'delete', 'admin'] as string[]
  },
  'user@example.com': { 
    id: '2', 
    email: 'user@example.com', 
    name: 'Regular User', 
    role: 'user' as const, 
    permissions: ['read', 'write'] as string[]
  },
  'viewer@example.com': { 
    id: '3', 
    email: 'viewer@example.com', 
    name: 'Viewer User', 
    role: 'viewer' as const, 
    permissions: ['read'] as string[]
  },
} as const;

export const MOCK_USERS_BY_ID = {
  '1': MOCK_USERS['admin@example.com'],
  '2': MOCK_USERS['user@example.com'], 
  '3': MOCK_USERS['viewer@example.com'],
} as const;

/**
 * Generic helper function to handle async operations with loading/error states
 * Eliminates duplication in async action creators
 */
export const createAsyncAction = <T>(
  startAction: AppAction,
  successAction: (data: T) => AppAction,
  failureAction: (error: string) => AppAction,
  operation: () => Promise<T>
): AsyncActionCreator<T> => {
  return async (dispatch) => {
    dispatch(startAction);
    
    try {
      const data = await operation();
      dispatch(successAction(data));
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      dispatch(failureAction(errorMessage));
      console.error('Async action failed:', error);
      throw error; // Re-throw for caller to handle if needed
    }
  };
};

/**
 * Create standardized map data layer action creator
 * Eliminates duplication between refreshSensors, refreshGreenZones, refreshAirQuality
 */
export const createMapDataLayerAction = <T>(
  layer: MapDataLayerType,
  apiCall: () => Promise<T>,
  setDataAction: (data: T) => AppAction,
  customErrorMessage?: string
): AsyncActionCreator<T> => {
  return async (dispatch) => {
    // Set loading and clear error
    dispatch({ type: 'MAP_DATA_SET_LOADING', payload: { layer, loading: true } });
    dispatch({ type: 'MAP_DATA_SET_ERROR', payload: { layer, error: null } });
    
    try {
      const data = await apiCall();
      dispatch(setDataAction(data));
      return data;
    } catch (error) {
      const errorMessage = customErrorMessage || 
        (error instanceof Error ? error.message : `Failed to fetch ${layer}`);
      dispatch({ type: 'MAP_DATA_SET_ERROR', payload: { layer, error: errorMessage } });
      console.error(`Error loading ${layer}:`, error);
      throw error;
    } finally {
      dispatch({ type: 'MAP_DATA_SET_LOADING', payload: { layer, loading: false } });
    }
  };
};

/**
 * Create standardized notification object
 * Ensures consistent notification structure
 */
export const createNotification = (
  type: 'success' | 'error' | 'warning' | 'info',
  message: string,
  duration?: number
) => ({
  id: generateNotificationId(),
  type,
  message,
  duration: duration ?? (type === 'error' ? 5000 : 3000),
  timestamp: new Date(),
});

/**
 * Notification ID generator utility
 * Ensures unique notification IDs
 */
export const generateNotificationId = (): string => {
  return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Simulate API delay for mock services
 * Consistent delay simulation across mock functions
 */
export const simulateApiDelay = (ms: number = 500): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Type guard to check if a value is a valid email
 * Used for validation in auth actions
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Type guard to check if token is valid mock token
 * Used in mock auth service
 */
export const isValidMockToken = (token: string): boolean => {
  return token.startsWith('mock-token-') && 
         Object.keys(MOCK_USERS_BY_ID).includes(token.replace('mock-token-', ''));
};

/**
 * Extract user ID from mock token
 * Used in mock auth service
 */
export const getUserIdFromMockToken = (token: string): string | null => {
  if (!isValidMockToken(token)) {
    return null;
  }
  return token.replace('mock-token-', '');
};

/**
 * Storage utility for tokens
 * Centralizes token storage logic
 */
export const tokenStorage = {
  set: (token: string, rememberMe: boolean): void => {
    if (rememberMe) {
      localStorage.setItem('authToken', token);
      sessionStorage.removeItem('authToken'); // Clean up session storage
    } else {
      sessionStorage.setItem('authToken', token);
      localStorage.removeItem('authToken'); // Clean up local storage
    }
  },
  
  get: (): string | null => {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  },
  
  remove: (): void => {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
  },
};

// ===== REDUCER UTILITIES =====

/**
 * Create standardized loading state update utility
 * Used by reducers to update loading states consistently
 */
export const updateLoadingState = <T extends { loading: Record<string, boolean> }>(
  state: T,
  layer: string,
  loading: boolean
): T => ({
  ...state,
  loading: {
    ...state.loading,
    [layer]: loading,
  },
});

/**
 * Create standardized error state update utility  
 * Used by reducers to update error states consistently
 */
export const updateErrorState = <T extends { errors: Record<string, string | null> }>(
  state: T,
  layer: string, 
  error: string | null
): T => ({
  ...state,
  errors: {
    ...state.errors,
    [layer]: error,
  },
});

/**
 * Create standardized last updated timestamp utility
 * Used by reducers to update lastUpdated timestamps consistently
 */
export const updateLastUpdated = <T extends { lastUpdated: Record<string, Date | null> }>(
  state: T,
  layer: string,
  timestamp: Date = new Date()
): T => ({
  ...state,
  lastUpdated: {
    ...state.lastUpdated,
    [layer]: timestamp,
  },
});

/**
 * Create standardized layer visibility update utility
 * Used by reducers to update layer visibility consistently
 */
export const updateLayerVisibility = <T extends { layersVisible: Record<string, boolean> }>(
  state: T,
  layer: string,
  visible: boolean
): T => ({
  ...state,
  layersVisible: {
    ...state.layersVisible,
    [layer]: visible,
  },
});

/**
 * Common state updater patterns for reducers
 */
export const stateUpdaters = {
  /**
   * Set loading state and clear error
   */
  setLoading: <T extends { isLoading: boolean; error: string | null }>(
    state: T,
    loading: boolean
  ): T => ({
    ...state,
    isLoading: loading,
    error: loading ? null : state.error, // Clear error when starting new operation
  }),

  /**
   * Set error state and clear loading
   */
  setError: <T extends { isLoading: boolean; error: string | null }>(
    state: T,
    error: string | null
  ): T => ({
    ...state,
    isLoading: false,
    error,
  }),

  /**
   * Set success state (clear loading and error)
   */
  setSuccess: <T extends { isLoading: boolean; error: string | null }>(
    state: T
  ): T => ({
    ...state,
    isLoading: false,
    error: null,
  }),
};

/**
 * Array utility functions for state management
 */
export const arrayUtils = {
  /**
   * Add item to array if not exists, update if exists
   */
  upsert: <T extends { id: string }>(array: T[], item: T): T[] => {
    const index = array.findIndex(existing => existing.id === item.id);
    if (index >= 0) {
      const newArray = [...array];
      newArray[index] = item;
      return newArray;
    }
    return [...array, item];
  },

  /**
   * Remove item from array by id
   */
  remove: <T extends { id: string }>(array: T[], id: string): T[] => {
    return array.filter(item => item.id !== id);
  },

  /**
   * Update item in array by id
   */
  update: <T extends { id: string }>(
    array: T[], 
    id: string, 
    updater: (item: T) => T
  ): T[] => {
    return array.map(item => item.id === id ? updater(item) : item);
  },
};