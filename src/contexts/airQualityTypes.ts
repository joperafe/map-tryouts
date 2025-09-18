import { createContext } from 'react';
import type { UseAirQualityReturn } from '../hooks/useAirQuality';

export const AirQualityContext = createContext<UseAirQualityReturn | undefined>(undefined);