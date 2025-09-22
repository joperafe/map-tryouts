import { useReducer, useMemo, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AppState } from './types';
import { appReducer, initialAppState } from './reducer';
import { actionCreators } from './actions';
import { AppStoreContext } from './context';

interface AppStoreProviderProps {
  children: ReactNode;
  initialState?: Partial<AppState>;
}

export function AppStoreProvider({ 
  children, 
  initialState 
}: AppStoreProviderProps) {
  // Merge provided initial state with default initial state
  const mergedInitialState = useMemo(() => ({
    ...initialAppState,
    ...initialState,
  }), [initialState]);
  
  const [state, dispatch] = useReducer(appReducer, mergedInitialState);
  
  // Simple action binding - no complex utilities needed
  const actions = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bindAction = (actionCreator: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (...args: any[]) => {
        const action = actionCreator(...args);
        if (typeof action === 'function') {
          // It's a thunk - call it with dispatch and getState
          return action(dispatch, () => state);
        }
        // It's a regular action - dispatch it
        dispatch(action);
      };
    };

    return {
      auth: {
        login: bindAction(actionCreators.auth.login),
        logout: bindAction(actionCreators.auth.logout),
        refreshToken: bindAction(actionCreators.auth.refreshToken),
        setSessionExpiry: bindAction(actionCreators.auth.setSessionExpiry),
        updateLastActivity: bindAction(actionCreators.auth.updateLastActivity),
        toggleDebugMode: bindAction(actionCreators.auth.toggleDebugMode),
        clearError: bindAction(actionCreators.auth.clearError),
      },
      mapData: {
        setLayerVisibility: bindAction(actionCreators.mapData.setLayerVisibility),
        setBaseMap: bindAction(actionCreators.mapData.setBaseMap),
        refreshSensors: bindAction(actionCreators.mapData.refreshSensors),
        refreshGreenZones: bindAction(actionCreators.mapData.refreshGreenZones),
        refreshAirQuality: bindAction(actionCreators.mapData.refreshAirQuality),
        refreshAllLayers: bindAction(actionCreators.mapData.refreshAllLayers),
      },
      sensorLayers: {
        setSensorLayer: bindAction(actionCreators.sensorLayers.setSensorLayer),
        setLayerLoading: bindAction(actionCreators.sensorLayers.setLayerLoading),
        setLayerError: bindAction(actionCreators.sensorLayers.setLayerError),
        setLayerVisibility: bindAction(actionCreators.sensorLayers.setLayerVisibility),
        clearSensorLayer: bindAction(actionCreators.sensorLayers.clearSensorLayer),
        toggleSidebarCollapsed: bindAction(actionCreators.sensorLayers.toggleSidebarCollapsed),
        setSidebarCollapsed: bindAction(actionCreators.sensorLayers.setSidebarCollapsed),
      },
      ui: {
        setSidebarCollapsed: bindAction(actionCreators.ui.setSidebarCollapsed),
        setFullscreenMode: bindAction(actionCreators.ui.setFullscreenMode),
        setDebugPanelVisible: bindAction(actionCreators.ui.setDebugPanelVisible),
        setDrawingMode: bindAction(actionCreators.ui.setDrawingMode),
        setMeasurementMode: bindAction(actionCreators.ui.setMeasurementMode),
        setAddSensorMode: bindAction(actionCreators.ui.setAddSensorMode),
        setSelectedPosition: bindAction(actionCreators.ui.setSelectedPosition),
        setGlobalLoading: bindAction(actionCreators.ui.setGlobalLoading),
        addNotification: bindAction(actionCreators.ui.addNotification),
        removeNotification: bindAction(actionCreators.ui.removeNotification),
        clearNotifications: bindAction(actionCreators.ui.clearNotifications),
      },
      theme: {
        setMode: bindAction(actionCreators.theme.setMode),
        setSystemPreference: bindAction(actionCreators.theme.setSystemPreference),
        setCustomColors: bindAction(actionCreators.theme.setCustomColors),
      },
      settings: {
        setLanguage: bindAction(actionCreators.settings.setLanguage),
        setEnvironment: bindAction(actionCreators.settings.setEnvironment),
        setDebugEnabled: bindAction(actionCreators.settings.setDebugEnabled),
        setAutoRefreshInterval: bindAction(actionCreators.settings.setAutoRefreshInterval),
        setMapDefaultZoom: bindAction(actionCreators.settings.setMapDefaultZoom),
        setMapDefaultCenter: bindAction(actionCreators.settings.setMapDefaultCenter),
        setTemperatureUnit: bindAction(actionCreators.settings.setTemperatureUnit),
        setShowTooltips: bindAction(actionCreators.settings.setShowTooltips),
        loadSettings: bindAction(actionCreators.settings.loadSettings),
      },
    };
  }, [state]);

  // Simple context value - no complex memoization needed
  const contextValue = useMemo(() => ({
    state,
    dispatch,
    actions,
  }), [state, actions]);

  // Optional: Auto-refresh token on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
    if (token && !state.auth.isAuthenticated) {
      actions.auth.refreshToken();
    }
  }, [state.auth.isAuthenticated, actions.auth]);

  // Optional: Update last activity on user interaction
  useEffect(() => {
    if (state.auth.isAuthenticated) {
      const handleActivity = () => {
        actions.auth.updateLastActivity();
      };

      const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
      events.forEach(event => {
        document.addEventListener(event, handleActivity, { passive: true });
      });

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, handleActivity);
        });
      };
    }
  }, [state.auth.isAuthenticated, actions.auth]);

  // Optional: Handle session expiry
  useEffect(() => {
    if (state.auth.sessionExpiry && state.auth.isAuthenticated) {
      const now = new Date();
      const expiry = new Date(state.auth.sessionExpiry);
      
      if (now > expiry) {
        actions.auth.logout();
      } else {
        const timeout = setTimeout(() => {
          actions.auth.logout();
        }, expiry.getTime() - now.getTime());

        return () => clearTimeout(timeout);
      }
    }
  }, [state.auth.sessionExpiry, state.auth.isAuthenticated, actions.auth]);

  // Optional: System theme detection
  useEffect(() => {
    if (state.theme.mode === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        actions.theme.setSystemPreference(e.matches ? 'dark' : 'light');
      };

      actions.theme.setSystemPreference(mediaQuery.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handleChange);
      
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [state.theme.mode, actions.theme]);

  // Optional: Auto-refresh data
  useEffect(() => {
    if (state.settings.autoRefreshInterval > 0 && state.auth.isAuthenticated) {
      const interval = setInterval(() => {
        actions.mapData.refreshAllLayers();
      }, state.settings.autoRefreshInterval);

      return () => clearInterval(interval);
    }
  }, [
    state.settings.autoRefreshInterval, 
    state.auth.isAuthenticated, 
    actions.mapData
  ]);

  return (
    <AppStoreContext.Provider value={contextValue}>
      {children}
    </AppStoreContext.Provider>
  );
};