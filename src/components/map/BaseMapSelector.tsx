import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMapSettings } from '../../hooks';

interface TileLayerConfig {
  name: string;
  url: string;
  attribution: string;
}

interface BaseMapSelectorProps {
  currentBaseMap: string;
  onBaseMapChange: (baseMapId: string) => void;
  className?: string;
}

export function BaseMapSelector({
  currentBaseMap,
  onBaseMapChange,
  className = ''
}: BaseMapSelectorProps) {
  const { t } = useTranslation();
  const mapSettings = useMapSettings();
  const [isOpen, setIsOpen] = useState(false);

  const tileLayers = (mapSettings?.tile_layers || {}) as Record<string, TileLayerConfig>;

  // Map base map IDs to translation keys
  const getBaseMapTranslationKey = (baseMapId: string): string => {
    const translationMap: Record<string, string> = {
      'openstreetmap': 'DASHBOARD_MAP_BASE_MAP_OPENSTREETMAP',
      'satellite': 'DASHBOARD_MAP_BASE_MAP_SATELLITE',
      'terrain': 'DASHBOARD_MAP_BASE_MAP_TERRAIN',
      'cartodb_light': 'DASHBOARD_MAP_BASE_MAP_CARTODB_LIGHT',
      'cartodb_dark': 'DASHBOARD_MAP_BASE_MAP_CARTODB_DARK',
      'esri_world_street': 'DASHBOARD_MAP_BASE_MAP_ESRI_WORLD_STREET',
      'esri_world_topo': 'DASHBOARD_MAP_BASE_MAP_ESRI_WORLD_TOPO',
      'stamen_toner': 'DASHBOARD_MAP_BASE_MAP_STAMEN_TONER',
    };
    return translationMap[baseMapId] || baseMapId;
  };

  const handleBaseMapSelect = (baseMapId: string) => {
    onBaseMapChange(baseMapId);
    setIsOpen(false);
  };

  const currentBaseMapName = t(getBaseMapTranslationKey(currentBaseMap));

  return (
    <div className={`relative ${className}`}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
        title={t('DASHBOARD_MAP_CONTROLS_BASE_MAP')}
      >
        <span className="text-lg">🗺️</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {currentBaseMapName}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop to close dropdown */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setIsOpen(false);
            }}
            role="button"
            tabIndex={-1}
            aria-label="Close dropdown"
          />
          
          {/* Dropdown Content */}
          <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-20 max-h-80 overflow-y-auto">
            {Object.entries(tileLayers).map(([baseMapId, config]) => (
              <button
                key={baseMapId}
                onClick={() => handleBaseMapSelect(baseMapId)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ${
                  currentBaseMap === baseMapId 
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300' 
                    : 'text-gray-700 dark:text-gray-300'
                } ${
                  baseMapId === Object.keys(tileLayers)[0] ? 'rounded-t-lg' : ''
                } ${
                  baseMapId === Object.keys(tileLayers)[Object.keys(tileLayers).length - 1] ? 'rounded-b-lg' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {t(getBaseMapTranslationKey(baseMapId))}
                  </span>
                  {currentBaseMap === baseMapId && (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path 
                        fillRule="evenodd" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {config.name}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};