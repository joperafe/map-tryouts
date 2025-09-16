import React from 'react';
import type { AppConfig } from '../../../types';

interface MapControlsProps {
  controlsSettings: AppConfig['MAP']['controls_settings'];
  mapControls: AppConfig['MAP']['map_controls'];
  onControlClick: (controlType: string) => void;
  activeControls?: Set<string>;
}

export const MapControls = React.forwardRef<HTMLDivElement, MapControlsProps>(({
  controlsSettings,
  mapControls,
  onControlClick,
  activeControls = new Set(),
}, ref) => {
  // Get the primary toolbar (assuming first one for now)
  const primaryToolbar = Object.values(mapControls)[0];
  
  const getPositionClasses = () => {
    switch (primaryToolbar?.position) {
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

  // Flatten all control items from all elements
  const allControlItems = primaryToolbar?.elements.flatMap(element => element.items) || [];

  return (
    <div ref={ref} className={`map-controls ${getPositionClasses()}`}>
      {allControlItems
        .filter(controlType => controlsSettings[controlType]?.enabled)
        .map(controlType => {
          const control = controlsSettings[controlType];
          return (
            <button
              key={controlType}
              className={`map-control-button ${
                activeControls.has(controlType) 
                  ? 'bg-primary-500 text-white border-primary-500' 
                  : ''
              }`}
              onClick={() => onControlClick(controlType)}
              title={control.tooltip || control.label || controlType}
            >
              <span className="text-lg">{control.icon || '⚙️'}</span>
              {control.label && (
                <span className="ml-2 text-sm hidden md:inline">
                  {control.label}
                </span>
              )}
            </button>
          );
        })}
    </div>
  );
});
