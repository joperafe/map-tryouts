import type { Sensor } from '../../../types';
import { formatTemperature, formatHumidity, formatAirQuality, formatNoiseLevel, formatLastUpdated, getAirQualityColor } from '../../../utils';

interface SensorPopupProps {
  sensor: Sensor;
  onClose?: () => void;
}

export function SensorPopup({ sensor }: SensorPopupProps) {
  return (
    <div className="popup-content bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden min-w-[280px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {sensor.name}
          </h3>
          <div className={`flex items-center gap-2`}>
            <div
              className={`w-3 h-3 rounded-full ${
                sensor.status === 'active' ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className={`text-sm font-medium ${
              sensor.status === 'active' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {sensor.status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          ID: {sensor.id}
        </p>
      </div>

      {/* Data Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Temperature */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              Temperature
            </div>
            <div className="text-xl font-bold text-blue-900 dark:text-blue-100 mt-1">
              {formatTemperature(sensor.data.temperature)}
            </div>
          </div>

          {/* Humidity */}
          <div className="bg-cyan-50 dark:bg-cyan-900/20 p-3 rounded-lg">
            <div className="text-xs font-medium text-cyan-600 dark:text-cyan-400 uppercase tracking-wide">
              Humidity
            </div>
            <div className="text-xl font-bold text-cyan-900 dark:text-cyan-100 mt-1">
              {formatHumidity(sensor.data.humidity)}
            </div>
          </div>

          {/* Air Quality */}
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
              Air Quality
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: getAirQualityColor(sensor.data.airQualityIndex) }}
              />
              <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {formatAirQuality(sensor.data.airQualityIndex)}
              </span>
            </div>
          </div>

          {/* Noise Level */}
          <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
            <div className="text-xs font-medium text-orange-600 dark:text-orange-400 uppercase tracking-wide">
              Noise Level
            </div>
            <div className="text-xl font-bold text-orange-900 dark:text-orange-100 mt-1">
              {formatNoiseLevel(sensor.data.noiseLevel)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Last updated: {formatLastUpdated(sensor.lastUpdated)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Location: {sensor.coordinates[0].toFixed(4)}, {sensor.coordinates[1].toFixed(4)}
          </p>
        </div>
      </div>
    </div>
  );
};
