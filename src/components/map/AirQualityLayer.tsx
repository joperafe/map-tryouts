import { CircleMarker, Popup, Tooltip } from 'react-leaflet';
import type { AirQualityStation } from '../../types/airQuality';
import { AIR_QUALITY_COLORS } from '../../types/airQuality';

interface AirQualityLayerProps {
  stations: AirQualityStation[];
  visible: boolean;
  onStationClick?: (station: AirQualityStation) => void;
}

/**
 * Air Quality Layer component for Leaflet map
 * Renders air quality monitoring stations as colored circles
 */
export function AirQualityLayer({
  stations,
  visible,
  onStationClick,
}: AirQualityLayerProps) {
  if (!visible) {
    return null;
  }

  if (stations.length === 0) {
    return <></>;
  }

  return (
    <>
      {stations.map(station => (
        <CircleMarker
          key={station.id}
          center={[station.latitude, station.longitude]}
          radius={8}
          pathOptions={{
            color: AIR_QUALITY_COLORS[station.qualityLevel],
            fillColor: AIR_QUALITY_COLORS[station.qualityLevel],
            fillOpacity: 0.7,
            weight: 2,
            opacity: station.isRecent ? 1 : 0.5,
          }}
          eventHandlers={{
            click: () => onStationClick?.(station),
          }}
        >
          {/* Quick tooltip on hover */}
          <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
            <div className="text-sm">
              <div className="font-semibold text-gray-900">
                Air Quality: {station.qualityLevel}
              </div>
              <div className="text-gray-600">
                AQI: {station.airQualityIndex}
              </div>
              {station.primaryPollutant !== 'None' && (
                <div className="text-gray-600">
                  Primary: {station.primaryPollutant}
                </div>
              )}
            </div>
          </Tooltip>

          {/* Detailed popup on click */}
          <Popup maxWidth={300} className="air-quality-popup">
            <AirQualityStationPopup station={station} />
          </Popup>
        </CircleMarker>
      ))}
    </>
  );
};

/**
 * Detailed popup content for air quality stations
 */
function AirQualityStationPopup({
  station,
}: { station: AirQualityStation }) {
  const formatValue = (value: number | undefined, unit: string) => {
    return value !== undefined ? `${value.toFixed(1)} ${unit}` : 'N/A';
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div className="air-quality-popup-content">
      {/* Header */}
      <div className="mb-3 pb-2 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900 text-base">
          Air Quality Station
        </h3>
        <p className="text-xs text-gray-500">
          ID: {station.id.split(':').pop()}
        </p>
      </div>

      {/* Overall Status */}
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-3 h-3 rounded-full border"
            style={{ backgroundColor: AIR_QUALITY_COLORS[station.qualityLevel] }}
          />
          <span className="font-medium text-gray-900">
            {station.qualityLevel}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          AQI: {station.airQualityIndex}
          {station.primaryPollutant !== 'None' && (
            <span className="ml-2">
              (Primary: {station.primaryPollutant})
            </span>
          )}
        </div>
      </div>

      {/* Measurements */}
      <div className="mb-3">
        <h4 className="font-medium text-gray-800 text-sm mb-2">
          Measurements
        </h4>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {station.measurements.pm25 !== undefined && (
            <div className="flex justify-between">
              <span>PM2.5:</span>
              <span>{formatValue(station.measurements.pm25, 'μg/m³')}</span>
            </div>
          )}
          {station.measurements.pm10 !== undefined && (
            <div className="flex justify-between">
              <span>PM10:</span>
              <span>{formatValue(station.measurements.pm10, 'μg/m³')}</span>
            </div>
          )}
          {station.measurements.o3 !== undefined && (
            <div className="flex justify-between">
              <span>O₃:</span>
              <span>{formatValue(station.measurements.o3, 'μg/m³')}</span>
            </div>
          )}
          {station.measurements.no2 !== undefined && (
            <div className="flex justify-between">
              <span>NO₂:</span>
              <span>{formatValue(station.measurements.no2, 'μg/m³')}</span>
            </div>
          )}
          {station.measurements.co !== undefined && (
            <div className="flex justify-between">
              <span>CO:</span>
              <span>{formatValue(station.measurements.co, 'mg/m³')}</span>
            </div>
          )}
          {station.measurements.so2 !== undefined && (
            <div className="flex justify-between">
              <span>SO₂:</span>
              <span>{formatValue(station.measurements.so2, 'μg/m³')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Environmental data */}
      {(station.measurements.temperature !== undefined || 
        station.measurements.humidity !== undefined) && (
        <div className="mb-3">
          <h4 className="font-medium text-gray-800 text-sm mb-2">
            Environmental
          </h4>
          <div className="grid grid-cols-2 gap-1 text-xs">
            {station.measurements.temperature !== undefined && (
              <div className="flex justify-between">
                <span>Temperature:</span>
                <span>{formatValue(station.measurements.temperature, '°C')}</span>
              </div>
            )}
            {station.measurements.humidity !== undefined && (
              <div className="flex justify-between">
                <span>Humidity:</span>
                <span>{formatValue(station.measurements.humidity, '%')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="pt-2 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Last updated:</span>
          <span className={station.isRecent ? '' : 'text-orange-600'}>
            {formatDate(station.lastUpdated)}
            {!station.isRecent && ' ⚠️'}
          </span>
        </div>
      </div>

      {/* Coordinates (for debugging) */}
      <div className="text-xs text-gray-400 mt-1">
        {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
      </div>
    </div>
  );
};