import React from 'react';
import { getEnvironmentConfig, getEnvironmentUrls } from '../utils/environmentDetector';
import { useApp } from '../contexts';

export const EnvironmentIndicator: React.FC = () => {
  const config = getEnvironmentConfig();
  const urls = getEnvironmentUrls();
  const { debug } = useApp();
  
  // Only show indicator if debug flag is enabled
  if (!debug) {
    return null;
  }

  const environmentStyles = {
    PROD: 'bg-green-500 text-white',
    DEV: 'bg-blue-500 text-white',
    STAGING: 'bg-orange-500 text-white',
  };

  const environmentLabels = {
    PROD: '🚀 Production',
    DEV: '🔧 Development', 
    STAGING: '🧪 Staging',
  };

  return (
    <div className="fixed top-4 left-4 z-50 flex items-center gap-2">
      {/* Environment Badge */}
      <div 
        className={`px-3 py-1 rounded-full text-xs font-bold shadow-lg ${
          environmentStyles[config.environment]
        }`}
        role="status"
        aria-label={`Current environment: ${config.environment}`}
      >
        {environmentLabels[config.environment]}
      </div>
      
      {/* Environment Switcher */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-2 border border-gray-200 dark:border-gray-700">
        <div className="flex gap-1">
          <a
            href={urls.production}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              config.environment === 'PROD'
                ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            title="Switch to Production"
          >
            PROD
          </a>
          <a
            href={urls.development}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              config.environment === 'DEV'
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            title="Switch to Development"
          >
            DEV
          </a>
          <a
            href={urls.staging}
            className={`px-2 py-1 text-xs rounded transition-colors ${
              config.environment === 'STAGING'
                ? 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
            title="Switch to Staging"
          >
            STAGING
          </a>
        </div>
      </div>
      
      {/* Debug Info */}
      {config.enableDebugMode && (
        <div className="bg-gray-800 text-white text-xs p-2 rounded shadow-lg max-w-xs">
          <div className="font-semibold mb-1">Debug Info:</div>
          <div>API: {config.apiBaseUrl}</div>
          <div>Green Zones: {config.enableGreenZones ? '✅' : '❌'}</div>
          <div>Zoom: {config.mapDefaultZoom}</div>
        </div>
      )}
    </div>
  );
};