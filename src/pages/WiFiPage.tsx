import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  InteractiveMap, 
  createMarkerLayer, 
  createHeatmapLayer,
  mapPresets 
} from '../../packages/map-microservice/src';
import { wifiHotspots, generateWiFiCoverageData, providerColors, wifiStats } from '../data/wifiData';
import Navigation from '../components/Navigation';

// WiFi Coverage Page Component
export const WiFiCoveragePage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);

  // Filter hotspots by provider
  const filteredHotspots = useMemo(() => {
    return selectedProvider === 'all' 
      ? wifiHotspots 
      : wifiHotspots.filter(h => h.provider === selectedProvider);
  }, [selectedProvider]);

  // Get unique providers
  const providers = useMemo(() => {
    return ['all', ...new Set(wifiHotspots.map(h => h.provider))];
  }, []);

  // Configure map for WiFi visualization
  const mapConfig = useMemo(() => {
    const config = mapPresets.dashboard();
    config.initialCenter = [38.7223, -9.1393]; // Lisbon center
    config.initialZoom = 12;
    config.theme = 'auto';
    
    // Customize controls for WiFi analysis
    config.controls = {
      showZoom: true,
      showFullscreen: true,
      showLayers: true,
      showMeasurement: true,
      showDrawing: false, // Not needed for WiFi coverage
    };

    config.features = {
      clickableMarkers: true,
      draggableMarkers: false,
      zoomOnMarkerClick: true,
      clustering: false, // Show individual hotspots
      drawing: { enabled: false },
      measurement: { enabled: true, units: 'metric' }
    };

    return config;
  }, []);

  // Create WiFi hotspot markers
  const hotspotLayer = useMemo(() => {
    if (!showHotspots) return null;

    return createMarkerLayer(
      'wifi-hotspots',
      'WiFi Hotspots',
      filteredHotspots.map(hotspot => ({
        lat: hotspot.lat,
        lng: hotspot.lng,
        popup: `
          <div class="p-3 min-w-64">
            <h3 class="font-semibold text-lg mb-2">${hotspot.name}</h3>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span>Provider:</span>
                <span class="font-medium">${hotspot.provider}</span>
              </div>
              <div class="flex justify-between">
                <span>Signal Strength:</span>
                <span class="font-medium">${Math.round(hotspot.signalStrength * 100)}%</span>
              </div>
              <div class="flex justify-between">
                <span>Frequency:</span>
                <span class="font-medium">${hotspot.frequency}</span>
              </div>
              <div class="flex justify-between">
                <span>Type:</span>
                <span class="font-medium">${hotspot.isPublic ? 'Public' : 'Private'}</span>
              </div>
              <div class="flex justify-between">
                <span>Users:</span>
                <span class="font-medium">${hotspot.currentUsers}/${hotspot.maxUsers}</span>
              </div>
              <div class="flex justify-between">
                <span>Speed:</span>
                <span class="font-medium">${hotspot.speed.download}↓/${hotspot.speed.upload}↑ Mbps</span>
              </div>
            </div>
          </div>
        `,
        metadata: {
          id: hotspot.id,
          name: hotspot.name,
          provider: hotspot.provider,
          signalStrength: hotspot.signalStrength,
          isPublic: hotspot.isPublic
        }
      })),
      {
        icon: {
          iconUrl: 'data:image/svg+xml;base64,' + btoa(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="${providerColors[filteredHotspots[0]?.provider] || providerColors.default}" stroke="white" stroke-width="2"/>
              <path d="M12 15.5A3.5 3.5 0 0 0 8.5 12A3.5 3.5 0 0 0 5 8.5" stroke="white" stroke-width="2" fill="none"/>
              <path d="M12 12A3 3 0 0 0 9 9A3 3 0 0 0 6 6" stroke="white" stroke-width="1.5" fill="none"/>
              <circle cx="12" cy="12" r="1.5" fill="white"/>
            </svg>
          `),
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -12]
        }
      }
    );
  }, [filteredHotspots, showHotspots]);

  // Create WiFi coverage heatmap
  const coverageHeatmap = useMemo(() => {
    if (!showHeatmap) return null;

    const coverageData = generateWiFiCoverageData();
    
    // Filter coverage data based on selected provider
    const filteredCoverageData = selectedProvider === 'all' 
      ? coverageData 
      : coverageData.filter(point => 
          point.connectedHotspots.some(hotspotId => 
            wifiHotspots.find(h => h.id === hotspotId)?.provider === selectedProvider
          ) || point.connectedHotspots.length === 0
        );

    return createHeatmapLayer(
      'wifi-coverage',
      'WiFi Coverage Heatmap',
      filteredCoverageData.map(point => ({
        lat: point.lat,
        lng: point.lng,
        intensity: point.signalStrength,
        metadata: { connectedHotspots: point.connectedHotspots }
      })),
      {
        config: {
          radius: 30,
          blur: 20,
          maxZoom: 15,
          gradient: {
            0.1: '#3b82f6', // Blue for weak signal
            0.3: '#06b6d4', // Cyan
            0.5: '#10b981', // Emerald
            0.7: '#f59e0b', // Amber
            0.9: '#ef4444', // Red for strong signal
            1.0: '#dc2626'  // Dark red for excellent signal
          }
        },
        opacity: 0.6
      }
    );
  }, [showHeatmap, selectedProvider]);

  // Create layers array
  const layers = useMemo(() => {
    const layerList = [];
    if (coverageHeatmap) layerList.push(coverageHeatmap);
    if (hotspotLayer) layerList.push(hotspotLayer);
    return layerList;
  }, [coverageHeatmap, hotspotLayer]);

  // Statistics cards data
  const statsCards = [
    {
      icon: '📶',
      label: t('WIFI_STATISTICS_TOTAL_HOTSPOTS'),
      value: wifiStats.totalHotspots,
      color: 'text-blue-600 dark:text-blue-400'
    },
    {
      icon: '🌐',
      label: 'Public Hotspots',
      value: wifiStats.publicHotspots,
      color: 'text-green-600 dark:text-green-400'
    },
    {
      icon: '📡',
      label: t('WIFI_STATISTICS_AVG_SIGNAL'),
      value: `${Math.round(wifiStats.averageSignalStrength * 100)}%`,
      color: 'text-yellow-600 dark:text-yellow-400'
    },
    {
      icon: '👥',
      label: 'Connected Users',
      value: wifiStats.totalConnectedUsers,
      color: 'text-purple-600 dark:text-purple-400'
    },
    {
      icon: '⚡',
      label: 'Avg Speed',
      value: `${Math.round(wifiStats.averageDownloadSpeed)} Mbps`,
      color: 'text-orange-600 dark:text-orange-400'
    },
    {
      icon: '🛡️',
      label: 'Network Usage',
      value: `${Math.round(wifiStats.utilizationRate * 100)}%`,
      color: 'text-red-600 dark:text-red-400'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('WIFI_TITLE')}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            {t('WIFI_SUBTITLE')}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Provider Filter */}
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {providers.map(provider => (
              <option key={provider} value={provider}>
                {provider === 'all' ? t('WIFI_PROVIDERS_ALL') : provider}
              </option>
            ))}
          </select>

          {/* Layer Toggles */}
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showHeatmap}
                onChange={(e) => setShowHeatmap(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('WIFI_CONTROLS_SHOW_HEATMAP')}</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showHotspots}
                onChange={(e) => setShowHotspots(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{t('WIFI_CONTROLS_SHOW_HOTSPOTS')}</span>
            </label>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statsCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center space-x-3">
              <div className={`text-2xl ${stat.color}`}>{stat.icon}</div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Map Container */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Interactive Coverage Map
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Click on hotspot markers to view details. Use measurement tools to analyze coverage areas.
          </p>
        </div>
        
        <div style={{ height: '600px', width: '100%' }}>
          <InteractiveMap
            config={mapConfig}
            layers={layers}
            className="border border-gray-300 dark:border-gray-600 rounded-lg"
            style={{ 
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          />
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Map Legend
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Signal Strength Legend */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Signal Strength</h4>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Weak (10-30%)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-cyan-500 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Fair (30-50%)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-emerald-500 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Good (50-70%)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-amber-500 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Strong (70-90%)</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-sm text-gray-600 dark:text-gray-300">Excellent (90-100%)</span>
              </div>
            </div>
          </div>

          {/* Providers Legend */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Providers</h4>
            <div className="space-y-2">
              {Object.entries(providerColors).slice(0, -1).map(([provider, color]) => (
                <div key={provider} className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded" 
                    style={{ backgroundColor: color }}
                  ></div>
                  <span className="text-sm text-gray-600 dark:text-gray-300">{provider}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default WiFiCoveragePage;
