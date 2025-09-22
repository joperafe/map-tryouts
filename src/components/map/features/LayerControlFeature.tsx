import React from 'react';
import type { Layer } from '../types';

interface LayerControlFeatureProps {
  layers: Layer[];
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  theme: 'light' | 'dark';
  onLayerToggle?: (layerId: string, visible: boolean) => void;
}

export const LayerControlFeature: React.FC<LayerControlFeatureProps> = () => {
  return null;
};
