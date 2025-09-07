import React from 'react';
import { DrawnShape } from '../types';

interface DrawingFeatureProps {
  tools: ('polygon' | 'polyline' | 'rectangle' | 'circle' | 'marker')[];
  style?: Record<string, unknown>;
  onDrawCreated?: (shape: DrawnShape) => void;
  onDrawDeleted?: (shapes: DrawnShape[]) => void;
}

export const DrawingFeature: React.FC<DrawingFeatureProps> = () => {
  // TODO: Implement drawing feature
  return null;
};
