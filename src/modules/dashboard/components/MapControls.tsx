import React from 'react';
import type { MapControlConfig } from '../../../types';

interface MapControlsProps {
  controls: MapControlConfig[];
  position: 'topright' | 'topleft' | 'bottomright' | 'bottomleft';
  onControlClick: (controlType: string) => void;
  activeControls?: Set<string>;
}

export const MapControls = React.forwardRef<HTMLDivElement, MapControlsProps>(({
  controls,
  position,
  onControlClick,
  activeControls = new Set(),
}, ref) => {
  const getPositionClasses = () => {
    switch (position) {
      case 'topleft':
        return 'top-4 left-4';
      case 'bottomleft':
        return 'bottom-4 left-4';
      case 'bottomright':
        return 'bottom-4 right-4';
      case 'topright':
      default:
        return 'top-4 right-4';
    }
  };

  const getControlIcon = (type: string) => {
    switch (type) {
      case 'layerToggle':
        return '🗂️';
      case 'draw':
        return '✏️';
      case 'fullscreen':
        return '⛶';
      case 'measurement':
        return '📏';
      default:
        return '⚙️';
    }
  };

  return (
    <div ref={ref} className={`map-controls ${getPositionClasses()}`}>
      {controls
        .filter(control => control.enabled)
        .map(control => (
          <button
            key={control.type}
            className={`map-control-button ${
              activeControls.has(control.type) 
                ? 'bg-primary-500 text-white border-primary-500' 
                : ''
            }`}
            onClick={() => onControlClick(control.type)}
            title={control.label || control.type}
          >
            <span className="text-lg">{getControlIcon(control.type)}</span>
            {control.label && (
              <span className="ml-2 text-sm hidden md:inline">
                {control.label}
              </span>
            )}
          </button>
        ))}
    </div>
  );
});
