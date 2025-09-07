import React from 'react';
import { MeasurementResult } from '../types';

interface MeasurementFeatureProps {
  units: 'metric' | 'imperial';
  showArea: boolean;
  showDistance: boolean;
  onMeasurement?: (result: MeasurementResult) => void;
}

export const MeasurementFeature: React.FC<MeasurementFeatureProps> = () => {
  return null;
};
