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
        <section className="text-center" role="status" aria-live="polite">
          <div className="loading-spinner mx-auto mb-4" aria-hidden="true"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading environmental data...</p>
        </section>
      </div>
    );
  }

  if (sensorsError || greenZonesError) {
    return (
      <div className="h-full flex items-center justify-center">
        <section className="text-center max-w-md" role="alert" aria-live="assertive">
          <div className="text-red-500 text-6xl mb-4" aria-hidden="true">⚠️</div>
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
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Retry loading environmental data"
            >
              Retry
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <div className="h-full flex">
        {/* Sidebar */}
        <aside className="sidebar" role="complementary" aria-label="Dashboard information">
          <header className="sidebar-header">
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
          </header>

          <div className="sidebar-content">
            {/* Sensors Summary */}
            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Sensors ({sensors.length})
              </h2>
              <ul className="space-y-2" role="list">
                {sensors.slice(0, 5).map(sensor => (
                  <li
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
                      aria-label={`Sensor ${sensor.name} is ${sensor.status}`}
                      role="status"
                    />
                  </li>
                ))}
                {sensors.length > 5 && (
                  <li className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                    +{sensors.length - 5} more sensors
                  </li>
                )}
              </ul>
            </section>

            {/* Green Zones Summary */}
            {config.environment.FEATURES.enableGreenZones && (
              <section className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Green Zones ({greenZones.length})
                </h2>
                <ul className="space-y-2" role="list">
                  {greenZones.slice(0, 3).map(zone => (
                    <li
                      key={zone.id}
                      className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        {zone.name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {zone.type.replace('_', ' ')} • {(zone.area / 1000).toFixed(1)}k m²
                      </div>
                    </li>
                  ))}
                  {greenZones.length > 3 && (
                    <li className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                      +{greenZones.length - 3} more zones
                    </li>
                  )}
                </ul>
              </section>
            )}

            {/* Stats */}
            <section className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="sr-only">Sensor Statistics</h3>
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
            </section>
          </div>
        </aside>

        {/* Main Content - Map */}
        <main className="flex-1 relative" role="main" aria-label="Interactive map">
          <MapView
            sensors={sensors}
            greenZones={greenZones}
            mapConfig={config.environment.MAP}
            showSensors={true}
            showGreenZones={config.environment.FEATURES.enableGreenZones}
          />
        </main>
      </div>
    </div>
  );
};
