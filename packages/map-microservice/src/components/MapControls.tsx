import React from 'react';
import { ControlsConfig } from '../types';
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
  };

  const containerStyle: React.CSSProperties = {
    backgroundColor: themeColors.controlBackground,
    border: `1px solid ${themeColors.controlBorder}`,
    color: themeColors.text,
  };

  return (
    <div 
      className={`absolute z-[1000] flex flex-col gap-2 ${positionClasses[config.position]}`}
      style={{ gap: config.spacing || 8 }}
    >
      {config.controls.map(control => {
        if (!control.visible) return null;

        return (
          <button
            key={control.id}
            onClick={() => control.onClick?.(control)}
            disabled={control.disabled}
            title={control.tooltip || control.label}
            className="p-2 rounded-lg shadow-lg hover:opacity-80 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={containerStyle}
          >
            <span className="block w-5 h-5">
              {control.icon}
            </span>
            {control.label && (
              <span className="text-xs mt-1 block">{control.label}</span>
            )}
          </button>
        );
      })}
    </div>
  );
};
