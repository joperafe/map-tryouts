import { useCallback } from 'react';
import { trackingService } from '../services/trackingService';

export const useTracking = () => {
  const track = useCallback((name: string, props?: Record<string, unknown>) => {
    try {
      trackingService.track(name, props);
    } catch {
      // swallow errors - tracking must not crash app
    }
  }, []);

  return { track };
};

export default useTracking;
