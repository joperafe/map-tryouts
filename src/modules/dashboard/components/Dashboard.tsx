import { useEffect } from 'react';
import { MapView } from './MapView';
import { ThemeToggle } from '../../../components/ThemeToggle';
import Navigation from '../../../components/Navigation';
import { EnvironmentIndicator } from '../../../components/EnvironmentIndicator';
import { DebugToggle } from '../../../components/DebugToggle';
import { useMapData, useSensorLayers } from '../../../contexts/store';
import { useSettings } from '../../../hooks';
import { useRuntimeEnvironment } from '../../../utils/useRuntimeEnvironment';

export function Dashboard() {
  const settings = useSettings();
  const { environment, config: runtimeConfig } = useRuntimeEnvironment();
  const sensorLayers = useSensorLayers();
  
  // Use global data instead of local hooks
  const { 
    sensors, 
    greenZones, 
    loading,
    errors,
    refreshAllLayers 
  } = useMapData();

  // Trigger re-render when environment changes
  useEffect(() => {
    // Environment changed - component will re-render with new config
  }, [environment, runtimeConfig]);

  if (loading.sensors || loading.greenZones) {
    return (
      <div className="h-full flex items-center justify-center">
        <section className="text-center" role="status" aria-live="polite">
          <div className="loading-spinner mx-auto mb-4" aria-hidden="true"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading environmental data...</p>
        </section>
      </div>
    );
  }

  if (errors.sensors || errors.greenZones) {
    return (
      <div className="h-full flex items-center justify-center">
        <section className="text-center max-w-md" role="alert" aria-live="assertive">
          <div className="text-red-500 text-6xl mb-4" aria-hidden="true">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Error Loading Data
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {errors.sensors || errors.greenZones}
          </p>
          <div className="space-x-2">
            <button
              onClick={() => {
                refreshAllLayers();
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
      
      {/* Environment Indicator */}
      <EnvironmentIndicator />
      
      {/* Debug Toggle */}
      <DebugToggle />
      
      {/* Mobile layout */}
      <div className="md:hidden">
        {/* Mobile Header with Toggle */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                Climate Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Environmental monitoring
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => sensorLayers.toggleSidebarCollapsed()}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label={sensorLayers.collapsedSidebar ? "Open sensor panel" : "Close sensor panel"}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {!sensorLayers.collapsedSidebar ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Mobile/Desktop Sidebar Overlay */}
        {!sensorLayers.collapsedSidebar && (
          <div className="fixed inset-0 z-50 flex">
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 md:hidden"
              onClick={() => sensorLayers.setSidebarCollapsed(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  sensorLayers.setSidebarCollapsed(true);
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Close sidebar"
            />
            <aside className="relative bg-white dark:bg-gray-800 w-80 max-w-[85vw] md:max-w-none shadow-xl overflow-y-auto md:static md:shadow-none md:border-l md:border-gray-200 dark:md:border-gray-700">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Active Sensors
                  </h2>
                  <button
                    onClick={() => sensorLayers.setSidebarCollapsed(true)}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 md:hidden"
                    aria-label="Close sidebar"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                {/* Sidebar Content */}
                <div className="space-y-6">
                  {/* Active Sensors by Layer */}
                  {Object.entries(sensorLayers.getVisibleLayers()).map(([layerName, layerData]) => (
                    <section key={layerName}>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-md font-medium text-gray-900 dark:text-gray-100">
                          {layerName === 'sensors' && 'Environment Sensors'}
                          {layerName === 'airQuality' && 'Air Quality Stations'}
                          {layerName !== 'sensors' && layerName !== 'airQuality' && layerName.charAt(0).toUpperCase() + layerName.slice(1)}
                          {' '}({layerData.sensors.length})
                        </h3>
                        {layerData.loading && (
                          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        )}
                      </div>
                      
                      {layerData.error && (
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-lg mb-2">
                          Error: {layerData.error}
                        </div>
                      )}
                      
                      <ul className="space-y-2">
                        {layerData.sensors.slice(0, 8).map(sensor => (
                          <li
                            key={sensor.id}
                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                                {sensor.name}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {sensor.data.temperature > 0 && `${sensor.data.temperature.toFixed(1)}°C`}
                                {sensor.data.airQualityIndex > 0 && (
                                  <span className="ml-2">
                                    AQI: {sensor.data.airQualityIndex}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Updated: {new Date(sensor.lastUpdated).toLocaleTimeString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  sensor.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                                }`}
                                aria-label={`Sensor ${sensor.name} is ${sensor.status}`}
                              />
                              {layerName === 'airQuality' && (
                                <div className="text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                                  Air
                                </div>
                              )}
                            </div>
                          </li>
                        ))}
                        {layerData.sensors.length > 8 && (
                          <li className="text-xs text-gray-500 dark:text-gray-400 text-center py-1">
                            ... and {layerData.sensors.length - 8} more
                          </li>
                        )}
                      </ul>
                    </section>
                  ))}
                  
                  {Object.keys(sensorLayers.getVisibleLayers()).length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <div className="text-4xl mb-2">📊</div>
                      <p className="text-sm">No active sensor layers</p>
                      <p className="text-xs mt-1">Enable layer controls in the map to view sensors</p>
                    </div>
                  )}

                  {/* Green Zones Summary */}
                  {settings?.FEATURES.enableGreenZones && (
                    <section>
                      <h3 className="text-md font-medium text-gray-900 dark:text-gray-100 mb-3">
                        Green Zones ({greenZones.length})
                      </h3>
                      <ul className="space-y-2">
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
                      </ul>
                    </section>
                  )}

                  {/* Stats */}
                  <section className="pt-4 border-t border-gray-200 dark:border-gray-700">
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
              </div>
            </aside>
          </div>
        )}

        {/* Mobile Map */}
        <main className="h-[calc(100vh-theme(spacing.16))]" role="main" aria-label="Interactive map">
          {settings?.MAP && (
            <MapView
              mapConfig={settings.MAP}
              showSensors={true}
              showGreenZones={runtimeConfig.enableGreenZones}
            />
          )}
        </main>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:flex h-screen">
        {/* Desktop Sidebar */}
        {!sensorLayers.collapsedSidebar && (
          <aside className="sidebar w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto" role="complementary" aria-label="Dashboard information">
            <header className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    Climate Dashboard
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Active sensors from map layers
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <button
                    onClick={() => sensorLayers.setSidebarCollapsed(true)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300"
                    aria-label="Collapse sidebar"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </header>

            <div className="p-4">
              {/* Active Sensors by Layer */}
              {Object.entries(sensorLayers.getVisibleLayers()).map(([layerName, layerData]) => (
                <section key={layerName} className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {layerName === 'sensors' && 'Environment Sensors'}
                      {layerName === 'airQuality' && 'Air Quality Stations'}
                      {layerName !== 'sensors' && layerName !== 'airQuality' && layerName.charAt(0).toUpperCase() + layerName.slice(1)}
                      {' '}({layerData.sensors.length})
                    </h2>
                    {layerData.loading && (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    )}
                  </div>
                  
                  {layerData.error && (
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded-lg mb-2">
                      Error: {layerData.error}
                    </div>
                  )}
                  
                  <ul className="space-y-2" role="list">
                    {layerData.sensors.slice(0, 10).map(sensor => (
                      <li
                        key={sensor.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                            {sensor.name}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            {sensor.data.temperature > 0 && `${sensor.data.temperature.toFixed(1)}°C`}
                            {sensor.data.airQualityIndex > 0 && (
                              <span className="ml-2">
                                AQI: {sensor.data.airQualityIndex}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(sensor.lastUpdated).toLocaleTimeString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              sensor.status === 'active' ? 'bg-green-500' : 'bg-red-500'
                            }`}
                            aria-label={`Sensor ${sensor.name} is ${sensor.status}`}
                            role="status"
                          />
                          {layerName === 'airQuality' && (
                            <div className="text-xs px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                              Air
                            </div>
                          )}
                        </div>
                      </li>
                    ))}
                    {layerData.sensors.length > 10 && (
                      <li className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                        +{layerData.sensors.length - 10} more sensors
                      </li>
                    )}
                  </ul>
                </section>
              ))}
              
              {Object.keys(sensorLayers.getVisibleLayers()).length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-sm">No active sensor layers</p>
                  <p className="text-xs mt-1">Enable layer controls in the map to view sensors</p>
                </div>
              )}

              {/* Summary Stats */}
              <section className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="sr-only">Sensor Statistics</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">
                      {sensorLayers.getActiveSensors().filter(s => s.status === 'active').length}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Active
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-500">
                      {sensorLayers.getActiveSensors().filter(s => s.status === 'inactive').length}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      Offline
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </aside>
        )}

        {/* Collapse/Expand Button for Desktop */}
        {sensorLayers.collapsedSidebar && (
          <div className="flex flex-col">
            <button
              onClick={() => sensorLayers.setSidebarCollapsed(false)}
              className="p-2 m-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 self-start"
              aria-label="Expand sidebar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}

        {/* Desktop Main Content - Map */}
        <main className="flex-1 relative" role="main" aria-label="Interactive map">
          {settings?.MAP && (
            <MapView
              mapConfig={settings.MAP}
              showSensors={true}
              showGreenZones={runtimeConfig.enableGreenZones}
            />
          )}
        </main>
      </div>
    </div>
  );
};
