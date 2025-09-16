import React from 'react';
import type { ControlsConfig } from '../types';
import { getThemeColors } from '../utils/theme';

interface MapControlsProps {
  config: ControlsConfig;
  theme: 'light' | 'dark';
}

export const MapControls: React.FC<MapControlsProps> = ({ config, theme }) => {
  const themeColors = getThemeColors(theme);
  
  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  } as const;

  const containerStyle: React.CSSProperties = {
    backgroundColor: themeColors.controlBackground,
    border: `1px solid ${themeColors.controlBorder}`,
    color: themeColors.text,
  };

  return (
    <div 
      className={`absolute z-[10] flex flex-col gap-2 ${positionClasses[config.position || 'top-right']}`}
      style={{ gap: config.spacing || 8 }}
    >
      {config.showZoom && (
        <div className="flex flex-col gap-1">
          <button
            className="p-2 rounded-lg shadow-lg hover:opacity-80 transition-opacity duration-200"
            style={containerStyle}
            title="Zoom In"
          >
            +
          </button>
          <button
            className="p-2 rounded-lg shadow-lg hover:opacity-80 transition-opacity duration-200"
            style={containerStyle}
            title="Zoom Out"
          >
            -
          </button>
        </div>
      )}
      
      {config.showFullscreen && (
        <button
          className="p-2 rounded-lg shadow-lg hover:opacity-80 transition-opacity duration-200"
          style={containerStyle}
          title="Toggle Fullscreen"
        >
          ⛶
        </button>
      )}
      
      {config.showLayers && (
        <button
          className="p-2 rounded-lg shadow-lg hover:opacity-80 transition-opacity duration-200"
          style={containerStyle}
          title="Toggle Layers"
        >
          ☰
        </button>
      )}
      
      {config.showMeasurement && (
        <button
          className="p-2 rounded-lg shadow-lg hover:opacity-80 transition-opacity duration-200"
          style={containerStyle}
          title="Measurement Tools"
        >
          📏
        </button>
      )}
      
      {config.showDrawing && (
        <button
          className="p-2 rounded-lg shadow-lg hover:opacity-80 transition-opacity duration-200"
          style={containerStyle}
          title="Drawing Tools"
        >
          ✏️
        </button>
      )}
    </div>
  );
};
