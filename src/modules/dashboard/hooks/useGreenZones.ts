import { useState, useEffect } from 'react';
import type { GreenZone } from '../../../types';
import { httpService } from '../../../services';

export const useGreenZones = () => {
  const [greenZones, setGreenZones] = useState<GreenZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGreenZones = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await httpService.getGreenZones();
      
      if (response.success && response.data) {
        setGreenZones(response.data);
      } else {
        setError(response.message || 'Failed to fetch green zones');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGreenZones();
  }, []);

  const refetch = () => {
    fetchGreenZones();
  };

  return { greenZones, loading, error, refetch };
};
