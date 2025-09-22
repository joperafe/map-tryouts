import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMapData } from '../../../contexts';
import { useMapSettings } from '../../../hooks';
import type { AppConfig } from '../../../types';

interface MapControlsProps {
  controlsSettings: AppConfig['MAP']['controls_settings'];
  mapControls: AppConfig['MAP']['map_controls'];
  mapSettings: AppConfig['MAP']['map_settings'];
  onControlClick: (controlType: string) => void;
  activeControls?: Set<string>;
}

const MapControlsComponent = React.forwardRef<HTMLDivElement, MapControlsProps>(({
  controlsSettings,
  mapControls,
  mapSettings,
  onControlClick,
  activeControls = new Set(),
}, ref) => {
  const { t: localize } = useTranslation();
  const { currentBaseMap, setBaseMap } = useMapData();
  const mapSettingsConfig = useMapSettings();
  const [showBaseMapDropdown, setShowBaseMapDropdown] = useState(false);

  // Memoize the sorted active controls array to prevent unnecessary re-renders
  const activeControlsArray = React.useMemo(() => 
    Array.from(activeControls).sort(), 
    [activeControls]
  );
  
  // Handle clicks outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showBaseMapDropdown && ref && 'current' in ref && ref.current && !ref.current.contains(event.target as Node)) {
        setShowBaseMapDropdown(false);
      }
    };

    if (showBaseMapDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showBaseMapDropdown, ref]);
  
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

  // Helper function to get base map display name
  const getBaseMapDisplayName = (baseMapKey: string) => {
    // Try to get translated name first
    const translatedKey = `DASHBOARD_MAP_BASE_MAPS_${baseMapKey.toUpperCase()}`;
    const translated = localize(translatedKey);
    if (translated !== translatedKey) {
      return translated;
    }
    
    // Fallback to formatted key name
    return baseMapKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Helper function to render base map selector
  const renderBaseMapSelector = (control: AppConfig['MAP']['controls_settings'][string]) => {
    const tileLayers = mapSettingsConfig?.tile_layers || {};
    const availableMaps = control.items?.filter((mapKey: string) => tileLayers[mapKey]) || Object.keys(tileLayers);
    
    return (
      <div className="relative" key="base_map_selector">
        <button
          type="button"
          className={`map-control-button focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            showBaseMapDropdown
              ? 'bg-blue-600 text-white border-blue-600 shadow-lg' 
              : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          onClick={() => setShowBaseMapDropdown(!showBaseMapDropdown)}
          aria-label={control.tooltip ? localize(control.tooltip) : (control.label ? localize(control.label) : 'Base Map')}
          aria-expanded={showBaseMapDropdown}
          tabIndex={0}
          title={control.tooltip ? localize(control.tooltip) : (control.label ? localize(control.label) : 'Base Map')}
        >
          <span className="text-lg" aria-hidden="true">{control.icon || '🗺️'}</span>
          {control.label && shouldDisplayLabels && (
            <span className="ml-2 text-sm hidden md:inline">
              {control.label ? localize(control.label) : 'Base Map'}
            </span>
          )}
          <span className="ml-1 text-xs" aria-hidden="true">▼</span>
        </button>
        
        {showBaseMapDropdown && (
          <div 
            className="absolute top-full mt-1 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[1001] min-w-48"
            role="menu"
            aria-label="Base map selection"
          >
            {availableMaps.map((mapKey: string) => (
              <button
                key={mapKey}
                type="button"
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg ${
                  currentBaseMap === mapKey ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
                }`}
                onClick={() => {
                  setBaseMap(mapKey);
                  setShowBaseMapDropdown(false);
                }}
                role="menuitem"
                aria-current={currentBaseMap === mapKey ? 'true' : 'false'}
              >
                <div className="flex items-center justify-between">
                  <span>{getBaseMapDisplayName(mapKey)}</span>
                  {currentBaseMap === mapKey && (
                    <span className="text-blue-600 dark:text-blue-400" aria-hidden="true">✓</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
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
          const isActive = activeControlsArray.includes(controlType);
          
          // Special handling for base map selector
          if (controlType === 'base_map_selector') {
            return renderBaseMapSelector(control);
          }
          
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

// Export the component directly - using useMemo internally for optimization
export const MapControls = MapControlsComponent;