import React from 'react';
import { useTranslation } from 'react-i18next';
import type { AppConfig } from '../../../types';

interface MapControlsProps {
  controlsSettings: AppConfig['MAP']['controls_settings'];
  mapControls: AppConfig['MAP']['map_controls'];
  mapSettings: AppConfig['MAP']['map_settings'];
  onControlClick: (controlType: string) => void;
  activeControls?: Set<string>;
}

export const MapControls = React.forwardRef<HTMLDivElement, MapControlsProps>(({
  controlsSettings,
  mapControls,
  mapSettings,
  onControlClick,
  activeControls = new Set(),
}, ref) => {
  const { t: localize } = useTranslation();
  
  // Get the primary toolbar (assuming first one for now)
  const primaryToolbar = Object.values(mapControls)[0];
  
  // Check if control labels should be displayed
  const shouldDisplayLabels = mapSettings.displayControlLabel !== false; // Default to true if not specified
  
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
    <section 
      ref={ref} 
      className={`map-controls ${getPositionClasses()}`}
      role="toolbar"
      aria-label={localize('MAP_CONTROLS_ARIA_LABEL') || 'Map controls'}
    >
      {allControlItems
        .filter(controlType => controlsSettings[controlType]?.enabled)
        .map((controlType) => {
          const control = controlsSettings[controlType];
          const translatedLabel = control.label ? localize(control.label) : controlType;
          const translatedTooltip = control.tooltip ? localize(control.tooltip) : translatedLabel;
          const isActive = activeControls.has(controlType);
          
          return (
            <button
              key={controlType}
              type="button"
              className={`map-control-button focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isActive 
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              onClick={() => onControlClick(controlType)}
              aria-label={translatedTooltip}
              aria-pressed={isActive}
              tabIndex={0}
              title={translatedTooltip}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onControlClick(controlType);
                }
              }}
            >
              <span className="text-lg" aria-hidden="true">{control.icon || '⚙️'}</span>
              {control.label && shouldDisplayLabels && (
                <span className="ml-2 text-sm hidden md:inline">
                  {translatedLabel}
                </span>
              )}
            </button>
          );
        })}
    </section>
  );
});
