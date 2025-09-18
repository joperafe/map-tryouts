import React from 'react';
import type { ReactNode } from 'react';
import { useAirQuality } from '../hooks/useAirQuality';
import { AirQualityContext } from './airQualityTypes';

interface AirQualityProviderProps {
  children: ReactNode;
}

export const AirQualityProvider: React.FC<AirQualityProviderProps> = ({ children }) => {
  const airQualityData = useAirQuality();

  return (
    <AirQualityContext.Provider value={airQualityData}>
      {children}
    </AirQualityContext.Provider>
  );
};