import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Layer {
  id: string;
  name: string;
  visible: boolean;
  enabled: boolean;
  opacity?: number;
}

interface LayerControlFeatureProps {
  layers: Layer[];
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  theme?: 'light' | 'dark';
  onLayerToggle?: (layerId: string, visible: boolean) => void;
  onOpacityChange?: (layerId: string, opacity: number) => void;
  className?: string;
}

export function LayerControlFeature({
  layers,
  position = 'top-right',
  theme = 'light',
  onLayerToggle,
  onOpacityChange,
  className = ''
}: LayerControlFeatureProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleLayerToggle = (layerId: string, visible: boolean) => {
    onLayerToggle?.(layerId, visible);
  };

  const handleOpacityChange = (layerId: string, opacity: number) => {
    onOpacityChange?.(layerId, opacity);
  };

  const themeClasses = theme === 'dark' 
    ? 'bg-gray-800 border-gray-600 text-white'
    : 'bg-white border-gray-200 text-gray-900';

  const positionClasses = {
    'top-left': 'top-2 left-2',
    'top-right': 'top-2 right-2',
    'bottom-left': 'bottom-2 left-2', 
    'bottom-right': 'bottom-2 right-2'
  };

  const enabledLayers = layers.filter(layer => layer.enabled);

  if (enabledLayers.length === 0) {
    return null;
  }

  return (
    <div className={`absolute z-[1000] ${positionClasses[position]} ${className}`}>
      <div className={`rounded-lg border shadow-lg ${themeClasses} min-w-[200px]`}>
        {/* Header */}
        <button 
          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-expanded={isExpanded}
          aria-label={t('DASHBOARD_MAP_LAYERS_TOGGLE_PANEL')}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">🗺️</span>
            <span className="text-sm font-medium">
              {t('DASHBOARD_MAP_CONTROLS_LAYERS')}
            </span>
          </div>
          <span className={`text-sm transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>

        {/* Layer Controls */}
        {isExpanded && (
          <div className="border-t border-gray-200 dark:border-gray-600 p-2 space-y-2">
            {enabledLayers.map(layer => (
              <div key={layer.id} className="space-y-2">
                {/* Layer Toggle */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={layer.visible}
                      onChange={(e) => handleLayerToggle(layer.id, e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm">{layer.name}</span>
                  </label>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {layer.visible ? t('DASHBOARD_MAP_LAYERS_VISIBLE') : t('DASHBOARD_MAP_LAYERS_HIDDEN')}
                  </span>
                </div>

                {/* Opacity Slider */}
                {layer.visible && onOpacityChange && (
                  <div className="pl-6">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {t('DASHBOARD_MAP_LAYERS_OPACITY')}
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={Math.round((layer.opacity ?? 1) * 100)}
                        onChange={(e) => handleOpacityChange(layer.id, parseInt(e.target.value) / 100)}
                        className="range-slider"
                      />
                      <span className="text-xs text-gray-500 dark:text-gray-400 w-10">
                        {Math.round((layer.opacity ?? 1) * 100)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Layer Actions */}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-3">
              <div className="flex justify-between">
                <button
                  onClick={() => enabledLayers.forEach(layer => handleLayerToggle(layer.id, true))}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {t('DASHBOARD_MAP_LAYERS_SHOW_ALL')}
                </button>
                <button
                  onClick={() => enabledLayers.forEach(layer => handleLayerToggle(layer.id, false))}
                  className="text-xs text-gray-600 dark:text-gray-400 hover:underline"
                >
                  {t('DASHBOARD_MAP_LAYERS_HIDE_ALL')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
