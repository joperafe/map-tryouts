import { useContext } from 'react';
import { AirQualityContext } from './airQualityTypes';
import type { UseAirQualityReturn } from '../hooks/useAirQuality';

export const useAirQualityData = (): UseAirQualityReturn => {
  const context = useContext(AirQualityContext);
  if (!context) {
    throw new Error('useAirQualityData must be used within an AirQualityProvider');
  }
  return context;
};