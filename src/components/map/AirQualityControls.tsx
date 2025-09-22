import type { AirQualityStation } from '../../types/airQuality';
import { AIR_QUALITY_COLORS } from '../../types/airQuality';

interface AirQualityControlsProps {
  visible: boolean;
  onToggleVisibility: (visible: boolean) => void;
  stations: AirQualityStation[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  onRefresh: () => void;
  className?: string;
}

/**
 * Controls for the Air Quality layer
 */
export function AirQualityControls({
  visible,
  onToggleVisibility,
  stations,
  loading,
  error,
  lastUpdated,
  onRefresh,
  className = '',
}: AirQualityControlsProps) {
  const getStationCounts = () => {
    const counts = stations.reduce((acc, station) => {
      acc[station.qualityLevel] = (acc[station.qualityLevel] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return counts;
  };

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const stationCounts = getStationCounts();
  const totalStations = stations.length;
  const recentStations = stations.filter(s => s.isRecent).length;

  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="air-quality-toggle"
              checked={visible}
              onChange={(e) => onToggleVisibility(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded 
                         focus:ring-blue-500 focus:ring-2"
            />
            <label 
              htmlFor="air-quality-toggle" 
              className="text-sm font-medium text-gray-900 cursor-pointer"
            >
              Air Quality
            </label>
          </div>

          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-50 
                       disabled:cursor-not-allowed transition-colors"
            title="Refresh air quality data"
          >
            <svg
              className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="p-3">
        {error ? (
          <div className="text-red-600 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>Error loading data</span>
          </div>
        ) : loading ? (
          <div className="text-gray-600 text-sm flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent" />
            <span>Loading stations...</span>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Station count */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {totalStations} station{totalStations !== 1 ? 's' : ''}
              </span>
              <span className="text-gray-500">
                {recentStations} recent
              </span>
            </div>

            {/* Last updated */}
            {lastUpdated && (
              <div className="text-xs text-gray-500">
                Updated {formatLastUpdated(lastUpdated)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      {visible && totalStations > 0 && (
        <div className="p-3 border-t border-gray-200">
          <h4 className="text-xs font-medium text-gray-700 mb-2">
            Air Quality Index
          </h4>
          <div className="space-y-1">
            {Object.entries(AIR_QUALITY_COLORS).map(([level, color]) => {
              const count = stationCounts[level] || 0;
              return (
                <div
                  key={level}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-gray-700">{level}</span>
                  </div>
                  <span className="text-gray-500">
                    {count > 0 ? count : '—'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Quality ranges info */}
          <div className="mt-3 pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500 space-y-1">
              <div className="flex justify-between">
                <span>0-50</span>
                <span>Good</span>
              </div>
              <div className="flex justify-between">
                <span>51-100</span>
                <span>Moderate</span>
              </div>
              <div className="flex justify-between">
                <span>101+</span>
                <span>Unhealthy</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};