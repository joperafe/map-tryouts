import React from 'react';
import { MapView } from './MapView';
import { ThemeToggle } from '../../../components/ThemeToggle';
import Navigation from '../../../components/Navigation';
import { useSensors, useGreenZones } from '../hooks';
import { getConfig } from '../../../config';

export const Dashboard: React.FC = () => {
  const config = getConfig();
  const { sensors, loading: sensorsLoading, error: sensorsError, refetch: refetchSensors } = useSensors();
  const { greenZones, loading: greenZonesLoading, error: greenZonesError, refetch: refetchGreenZones } = useGreenZones();

  if (sensorsLoading || greenZonesLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading environmental data...</p>
        </div>
      </div>
    );
  }

  if (sensorsError || greenZonesError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {sensorsError || greenZonesError}
          </p>
          <div className="space-x-2">
            <button
              onClick={() => {
                refetchSensors();
                refetchGreenZones();
              }}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <div className="h-full flex">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Climate Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Environmental monitoring system
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <div className="sidebar-content">
          {/* Sensors Summary */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
              Sensors ({sensors.length})
            </h2>
            <div className="space-y-2">
              {sensors.slice(0, 5).map(sensor => (
                <div
                  key={sensor.id}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {sensor.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {sensor.data.temperature.toFixed(1)}°C
                    </div>
                  </div>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      sensor.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  />
                </div>
              ))}
              {sensors.length > 5 && (
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                  +{sensors.length - 5} more sensors
                </div>
              )}
            </div>
          </div>

          {/* Green Zones Summary */}
          {config.environment.features.enableGreenZones && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Green Zones ({greenZones.length})
              </h2>
              <div className="space-y-2">
                {greenZones.slice(0, 3).map(zone => (
                  <div
                    key={zone.id}
                    className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                      {zone.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {zone.type.replace('_', ' ')} • {(zone.area / 1000).toFixed(1)}k m²
                    </div>
                  </div>
                ))}
                {greenZones.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                    +{greenZones.length - 3} more zones
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-500">
                  {sensors.filter(s => s.status === 'active').length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Active
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500">
                  {sensors.filter(s => s.status === 'inactive').length}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  Offline
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Map */}
      <div className="flex-1 relative">
        <MapView
          sensors={sensors}
          greenZones={greenZones}
          mapConfig={config.environment.map}
          showSensors={true}
          showGreenZones={config.environment.features.enableGreenZones}
        />
      </div>
      </div>
    </div>
  );
};
