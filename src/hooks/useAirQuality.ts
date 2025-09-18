import { useState, useEffect, useCallback } from 'react';
import type { AirQualityStation } from '../types/airQuality';
import { AirQualityService } from '../services/airQualityService';

export interface UseAirQualityReturn {
  stations: AirQualityStation[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refreshData: () => Promise<void>;
  retryCount: number;
}

/**
 * Hook for managing air quality data state and operations
 */
export const useAirQuality = (autoRefresh = true, refreshInterval = 300000): UseAirQualityReturn => {
  const [stations, setStations] = useState<AirQualityStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await AirQualityService.getAirQualityStations();
      
      setStations(data);
      setLastUpdated(new Date());
      setRetryCount(0);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Air quality data fetch error:', err);
      
      // Increment retry count for exponential backoff
      setRetryCount(prev => prev + 1);
      
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh setup with exponential backoff on errors
  useEffect(() => {
    if (!autoRefresh) return;

    // Calculate backoff delay (max 30 minutes)
    const backoffDelay = Math.min(refreshInterval * Math.pow(2, retryCount), 1800000);
    const delay = error ? backoffDelay : refreshInterval;

    const interval = setInterval(() => {
      fetchData();
    }, delay);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, retryCount, error, fetchData]);

  return {
    stations,
    loading,
    error,
    lastUpdated,
    refreshData,
    retryCount,
  };
};

/**
 * Hook for filtering air quality stations based on criteria
 */
export const useFilteredAirQuality = (
  stations: AirQualityStation[],
  filters: {
    recentOnly?: boolean;
    qualityLevels?: AirQualityStation['qualityLevel'][];
    bounds?: {
      north: number;
      south: number;
      east: number;
      west: number;
    };
  } = {}
) => {
  return useState(() => {
    return stations.filter(station => {
      // Filter by recent data
      if (filters.recentOnly && !station.isRecent) {
        return false;
      }

      // Filter by quality levels
      if (filters.qualityLevels && !filters.qualityLevels.includes(station.qualityLevel)) {
        return false;
      }

      // Filter by geographic bounds
      if (filters.bounds) {
        const { north, south, east, west } = filters.bounds;
        if (
          station.latitude > north ||
          station.latitude < south ||
          station.longitude > east ||
          station.longitude < west
        ) {
          return false;
        }
      }

      return true;
    });
  })[0];
};