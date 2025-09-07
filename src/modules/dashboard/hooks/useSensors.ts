import { useState, useEffect } from 'react';
import type { Sensor } from '../../../types';
import { httpService } from '../../../services';

export const useSensors = () => {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSensors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await httpService.getSensors();
      
      if (response.success && response.data) {
        setSensors(response.data);
      } else {
        setError(response.message || 'Failed to fetch sensors');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSensors();
  }, []);

  const refetch = () => {
    fetchSensors();
  };

  return { sensors, loading, error, refetch };
};
