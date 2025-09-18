import React, { createContext, useState, useEffect } from 'react';

export interface AppState {
  debug: boolean;
  setDebug: (debug: boolean) => void;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext<AppState | undefined>(undefined);

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [debug, setDebugState] = useState<boolean>(() => {
    // Check localStorage for saved debug preference first
    if (typeof window !== 'undefined') {
      const savedDebug = localStorage.getItem('app-debug');
      if (savedDebug !== null) {
        return savedDebug === 'true';
      }
      
      // Check for debug=true in query parameters as fallback
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('debug') === 'true';
    }
    return false;
  });

  useEffect(() => {
    // Save debug preference to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('app-debug', debug.toString());
    }
  }, [debug]);

  const setDebug = (newDebug: boolean) => {
    setDebugState(newDebug);
  };

  return (
    <AppContext.Provider value={{ debug, setDebug }}>
      {children}
    </AppContext.Provider>
  );
};