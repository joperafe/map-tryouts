import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSensors } from '../modules/dashboard/hooks/useSensors';
import Navigation from '../components/Navigation';
import type { Sensor } from '../types';

interface SensorCommand {
  id: string;
  sensorId: string;
  command: string;
  parameters?: Record<string, unknown>;
  timestamp: string;
  status: 'pending' | 'sent' | 'completed' | 'failed';
}

interface SensorAlert {
  id: string;
  sensorId: string;
  type: 'temperature' | 'humidity' | 'airQuality' | 'noise' | 'offline';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export function CockpitPage() {
  const { t } = useTranslation();
  const { sensors, loading, error } = useSensors();
  // Defensive: ensure sensors is an array (some environments may return an object or null)
  const sensorsList = Array.isArray(sensors) ? sensors : (console.warn('[CockpitPage] sensors is not an array, coercing to empty array', sensors), [] as Sensor[]);
  const [selectedSensor, setSelectedSensor] = useState<Sensor | null>(null);
  const [commands, setCommands] = useState<SensorCommand[]>([]);
  const [alerts, setAlerts] = useState<SensorAlert[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'commands' | 'alerts' | 'settings'>('overview');

  // Generate mock alerts based on sensor data
  useEffect(() => {
    if (sensorsList.length > 0) {
      const mockAlerts: SensorAlert[] = sensorsList.flatMap((sensor: Sensor) => {
        const sensorAlerts: SensorAlert[] = [];
        
        // Temperature alerts
        if (sensor.data.temperature > 30) {
          sensorAlerts.push({
            id: `alert-${sensor.id}-temp`,
            sensorId: sensor.id,
            type: 'temperature',
            severity: sensor.data.temperature > 35 ? 'critical' : 'high',
            message: `High temperature detected: ${sensor.data.temperature}°C`,
            timestamp: new Date().toISOString(),
            acknowledged: false
          });
        }

        // Air quality alerts
        if (sensor.data.airQualityIndex > 80) {
          sensorAlerts.push({
            id: `alert-${sensor.id}-air`,
            sensorId: sensor.id,
            type: 'airQuality',
            severity: sensor.data.airQualityIndex > 100 ? 'critical' : 'medium',
            message: `Poor air quality: AQI ${sensor.data.airQualityIndex}`,
            timestamp: new Date().toISOString(),
            acknowledged: false
          });
        }

        // Offline sensors
        if (sensor.status === 'inactive') {
          sensorAlerts.push({
            id: `alert-${sensor.id}-offline`,
            sensorId: sensor.id,
            type: 'offline',
            severity: 'high',
            message: `Sensor offline`,
            timestamp: new Date().toISOString(),
            acknowledged: false
          });
        }

        return sensorAlerts;
      });

      setAlerts(mockAlerts);
    }
  }, [sensors]);

  const handleSensorCommand = (sensorId: string, command: string, parameters?: Record<string, unknown>) => {
    const newCommand: SensorCommand = {
      id: `cmd-${Date.now()}`,
      sensorId,
      command,
      parameters,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };

    setCommands(prev => [newCommand, ...prev]);

    // Simulate command execution
    setTimeout(() => {
      setCommands(prev => prev.map(cmd => 
        cmd.id === newCommand.id ? { ...cmd, status: 'sent' } : cmd
      ));
    }, 1000);

    setTimeout(() => {
      setCommands(prev => prev.map(cmd => 
        cmd.id === newCommand.id ? { ...cmd, status: 'completed' } : cmd
      ));
    }, 3000);
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'sent': return 'text-blue-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">{t('COCKPIT_LOADING_SENSORS')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col">
        <Navigation />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400">{t('COCKPIT_ERROR_LOADING_SENSORS')}: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  const activeSensors = sensorsList.filter((sensor: Sensor) => sensor.status === 'active');
  const inactiveSensors = sensorsList.filter((sensor: Sensor) => sensor.status === 'inactive');
  const unacknowledgedAlerts = alerts.filter(alert => !alert.acknowledged);
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical' && !alert.acknowledged);

  return (
    <div className="h-screen flex flex-col">
      <Navigation />
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex">
          {/* Sidebar */}
          <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Stats Overview */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sensor Network</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{activeSensors.length}</div>
                  <div className="text-sm text-green-600 dark:text-green-400">{t('COCKPIT_STATUS_ACTIVE')}</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{inactiveSensors.length}</div>
                  <div className="text-sm text-red-600 dark:text-red-400">{t('COCKPIT_STATUS_OFFLINE')}</div>
                </div>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{unacknowledgedAlerts.length}</div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-400">{t('COCKPIT_ALERTS')}</div>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{criticalAlerts.length}</div>
                  <div className="text-sm text-red-600 dark:text-red-400">{t('COCKPIT_STATUS_CRITICAL')}</div>
                </div>
              </div>
            </div>

            {/* Sensor List */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{t('COCKPIT_SENSORS')}</h3>
                <div className="space-y-2">
                  {sensorsList.map((sensor: Sensor) => (
                    <button
                      key={sensor.id}
                      onClick={() => setSelectedSensor(sensor)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors duration-200 ${
                        selectedSensor?.id === sensor.id
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700'
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900 dark:text-white text-sm">{sensor.name}</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          sensor.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {sensor.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {sensor.data.temperature}°C • AQI {sensor.data.airQualityIndex}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Tab Navigation */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <div className="flex space-x-8 px-6">
                {[
                  { id: 'overview', label: t('COCKPIT_TAB_OVERVIEW') },
                  { id: 'commands', label: t('COCKPIT_TAB_COMMANDS') },
                  { id: 'alerts', label: t('COCKPIT_TAB_ALERTS') },
                  { id: 'settings', label: t('COCKPIT_TAB_SETTINGS') }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'overview' | 'commands' | 'alerts' | 'settings')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.label}
                    {tab.id === 'alerts' && unacknowledgedAlerts.length > 0 && (
                      <span className="ml-2 bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                        {unacknowledgedAlerts.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
              {activeTab === 'overview' && (
                <div className="p-6">
                  {selectedSensor ? (
                    <div className="max-w-4xl">
                      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                        <div className="flex items-center justify-between mb-4">
                          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {selectedSensor.name}
                          </h2>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            selectedSensor.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedSensor.status}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {selectedSensor.data.temperature}°C
                            </div>
                            <div className="text-sm text-blue-600 dark:text-blue-400">Temperature</div>
                          </div>
                          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {selectedSensor.data.humidity}%
                            </div>
                            <div className="text-sm text-green-600 dark:text-green-400">Humidity</div>
                          </div>
                          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {selectedSensor.data.airQualityIndex}
                            </div>
                            <div className="text-sm text-purple-600 dark:text-purple-400">Air Quality</div>
                          </div>
                          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                              {selectedSensor.data.noiseLevel} dB
                            </div>
                            <div className="text-sm text-orange-600 dark:text-orange-400">Noise Level</div>
                          </div>
                        </div>

                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                          <strong>Location:</strong> {selectedSensor.coordinates[0].toFixed(4)}, {selectedSensor.coordinates[1].toFixed(4)}
                          <br />
                          <strong>Last Updated:</strong> {new Date(selectedSensor.lastUpdated).toLocaleString()}
                        </div>

                        {/* Quick Actions */}
                        <div className="flex flex-wrap gap-3">
                          <button 
                            onClick={() => handleSensorCommand(selectedSensor.id, 'calibrate')}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Calibrate Sensor
                          </button>
                          <button 
                            onClick={() => handleSensorCommand(selectedSensor.id, 'reset')}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Reset
                          </button>
                          <button 
                            onClick={() => handleSensorCommand(selectedSensor.id, 'update_interval', { interval: 30 })}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Update Interval
                          </button>
                          <button 
                            onClick={() => handleSensorCommand(selectedSensor.id, 'diagnostics')}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Run Diagnostics
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-gray-400 dark:text-gray-500 mb-4">
                        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Select a sensor</h3>
                      <p className="text-gray-600 dark:text-gray-400">Choose a sensor from the sidebar to view its details and manage it.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'commands' && (
                <div className="p-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Command History</h2>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {commands.length > 0 ? commands.map((command) => (
                        <div key={command.id} className="p-6 flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-1">
                              <span className="font-medium text-gray-900 dark:text-white">{command.command}</span>
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(command.status)}`}>
                                {command.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              Sensor: {sensors.find((s: Sensor) => s.id === command.sensorId)?.name || command.sensorId}
                              <span className="mx-2">•</span>
                              {new Date(command.timestamp).toLocaleString()}
                            </div>
                            {command.parameters && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                Parameters: {JSON.stringify(command.parameters)}
                              </div>
                            )}
                          </div>
                        </div>
                      )) : (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                          No commands sent yet. Select a sensor and use the action buttons to send commands.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'alerts' && (
                <div className="p-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Alerts</h2>
                    </div>
                    <div className="divide-y divide-gray-200 dark:divide-gray-700">
                      {alerts.length > 0 ? alerts.map((alert) => (
                        <div key={alert.id} className={`p-6 ${alert.acknowledged ? 'opacity-60' : ''}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <span className={`px-2 py-1 text-xs rounded-full font-medium border ${getSeverityColor(alert.severity)}`}>
                                  {alert.severity.toUpperCase()}
                                </span>
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                  {sensors.find((s: Sensor) => s.id === alert.sensorId)?.name || alert.sensorId}
                                </span>
                              </div>
                              <p className="text-gray-900 dark:text-white font-medium mb-1">{alert.message}</p>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date(alert.timestamp).toLocaleString()}
                              </p>
                            </div>
                            {!alert.acknowledged && (
                              <button
                                onClick={() => acknowledgeAlert(alert.id)}
                                className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 px-3 py-1 rounded text-sm font-medium transition-colors"
                              >
                                Acknowledge
                              </button>
                            )}
                          </div>
                        </div>
                      )) : (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                          No alerts at the moment. All systems are operating normally.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="p-6">
                  <div className="max-w-2xl">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Cockpit Settings</h2>
                      
                      <div className="space-y-6">
                        <div>
                          <label htmlFor="auto-refresh-interval" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Auto-refresh Interval
                          </label>
                          <select id="auto-refresh-interval" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            <option>30 seconds</option>
                            <option>1 minute</option>
                            <option>5 minutes</option>
                            <option>10 minutes</option>
                          </select>
                        </div>
                        
                        <div>
                          <fieldset>
                            <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Alert Notifications
                            </legend>
                            <div className="space-y-2">
                              <label className="flex items-center">
                                <input type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" defaultChecked />
                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Email notifications</span>
                              </label>
                              <label className="flex items-center">
                                <input type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" defaultChecked />
                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Browser notifications</span>
                              </label>
                              <label className="flex items-center">
                                <input type="checkbox" className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" />
                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">SMS notifications</span>
                              </label>
                            </div>
                          </fieldset>
                        </div>
                        
                        <div>
                          <label htmlFor="command-timeout" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Command Timeout
                          </label>
                          <select id="command-timeout" className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md">
                            <option>30 seconds</option>
                            <option>1 minute</option>
                            <option>2 minutes</option>
                            <option>5 minutes</option>
                          </select>
                        </div>
                        
                        <div className="pt-4">
                          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                            Save Settings
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CockpitPage;
