import React, { type ReactNode } from 'react';
import { AppProvider, ThemeProvider, MapDataProvider, InstanceSettingsProvider, SensorLayersProvider } from './index';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Combined providers component to avoid cascading provider hell
 * Wraps all necessary context providers in a clean, maintainable way
 */
export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <AppProvider>
      <InstanceSettingsProvider>
        <ThemeProvider>
          <MapDataProvider>
            <SensorLayersProvider>
              {children}
            </SensorLayersProvider>
          </MapDataProvider>
        </ThemeProvider>
      </InstanceSettingsProvider>
    </AppProvider>
  );
};