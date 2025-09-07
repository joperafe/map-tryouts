// WiFi Coverage Mock Data
export interface WiFiHotspot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  signalStrength: number; // 0-1 (0 = no signal, 1 = excellent)
  frequency: '2.4GHz' | '5GHz' | 'dual';
  provider: string;
  isPublic: boolean;
  maxUsers: number;
  currentUsers: number;
  speed: {
    download: number; // Mbps
    upload: number; // Mbps
  };
}

export interface WiFiCoveragePoint {
  lat: number;
  lng: number;
  signalStrength: number; // 0-1 intensity for heatmap
  connectedHotspots: string[]; // IDs of nearby hotspots
}

// WiFi Hotspots in Lisbon area
export const wifiHotspots: WiFiHotspot[] = [
  {
    id: 'hotspot-001',
    name: 'Lisboa WiFi - Rossio',
    lat: 38.7131,
    lng: -9.1395,
    signalStrength: 0.95,
    frequency: 'dual',
    provider: 'Lisboa Digital',
    isPublic: true,
    maxUsers: 100,
    currentUsers: 45,
    speed: { download: 50, upload: 25 }
  },
  {
    id: 'hotspot-002',
    name: 'Café Central WiFi',
    lat: 38.7125,
    lng: -9.1380,
    signalStrength: 0.85,
    frequency: '2.4GHz',
    provider: 'MEO',
    isPublic: false,
    maxUsers: 30,
    currentUsers: 12,
    speed: { download: 30, upload: 10 }
  },
  {
    id: 'hotspot-003',
    name: 'Metro Baixa-Chiado WiFi',
    lat: 38.7107,
    lng: -9.1421,
    signalStrength: 0.75,
    frequency: 'dual',
    provider: 'Metropolitano de Lisboa',
    isPublic: true,
    maxUsers: 200,
    currentUsers: 89,
    speed: { download: 25, upload: 15 }
  },
  {
    id: 'hotspot-004',
    name: 'Marquês de Pombal Plaza',
    lat: 38.7369,
    lng: -9.1420,
    signalStrength: 0.90,
    frequency: 'dual',
    provider: 'Lisboa Digital',
    isPublic: true,
    maxUsers: 150,
    currentUsers: 67,
    speed: { download: 75, upload: 35 }
  },
  {
    id: 'hotspot-005',
    name: 'Belém Tower WiFi',
    lat: 38.6917,
    lng: -9.2158,
    signalStrength: 0.80,
    frequency: '5GHz',
    provider: 'Turismo de Lisboa',
    isPublic: true,
    maxUsers: 80,
    currentUsers: 23,
    speed: { download: 40, upload: 20 }
  },
  {
    id: 'hotspot-006',
    name: 'Cais do Sodré Station',
    lat: 38.7053,
    lng: -9.1445,
    signalStrength: 0.70,
    frequency: 'dual',
    provider: 'CP - Comboios de Portugal',
    isPublic: true,
    maxUsers: 120,
    currentUsers: 54,
    speed: { download: 20, upload: 8 }
  },
  {
    id: 'hotspot-007',
    name: 'Príncipe Real Garden',
    lat: 38.7188,
    lng: -9.1458,
    signalStrength: 0.65,
    frequency: '2.4GHz',
    provider: 'Lisboa Digital',
    isPublic: true,
    maxUsers: 60,
    currentUsers: 18,
    speed: { download: 35, upload: 18 }
  },
  {
    id: 'hotspot-008',
    name: 'Avenida da Liberdade Mall',
    lat: 38.7255,
    lng: -9.1426,
    signalStrength: 0.88,
    frequency: 'dual',
    provider: 'NOS',
    isPublic: false,
    maxUsers: 300,
    currentUsers: 156,
    speed: { download: 100, upload: 50 }
  },
  {
    id: 'hotspot-009',
    name: 'Universidade de Lisboa',
    lat: 38.7503,
    lng: -9.1551,
    signalStrength: 0.92,
    frequency: 'dual',
    provider: 'FCCN',
    isPublic: false,
    maxUsers: 500,
    currentUsers: 234,
    speed: { download: 150, upload: 75 }
  },
  {
    id: 'hotspot-010',
    name: 'Parque Eduardo VII',
    lat: 38.7319,
    lng: -9.1508,
    signalStrength: 0.60,
    frequency: '2.4GHz',
    provider: 'Lisboa Digital',
    isPublic: true,
    maxUsers: 40,
    currentUsers: 11,
    speed: { download: 15, upload: 5 }
  }
];

// Generate WiFi coverage heatmap points
export const generateWiFiCoverageData = (): WiFiCoveragePoint[] => {
  const coveragePoints: WiFiCoveragePoint[] = [];
  
  // Generate coverage area around each hotspot
  wifiHotspots.forEach(hotspot => {
    // Create coverage radius around each hotspot
    const maxRadius = hotspot.signalStrength * 0.01; // Max ~1km for strongest signals
    const pointsCount = Math.floor(hotspot.signalStrength * 20); // More points for stronger signals
    
    for (let i = 0; i < pointsCount; i++) {
      const angle = (i / pointsCount) * 2 * Math.PI;
      const distance = Math.random() * maxRadius;
      
      const lat = hotspot.lat + (distance * Math.cos(angle));
      const lng = hotspot.lng + (distance * Math.sin(angle));
      
      // Signal strength decreases with distance
      const distanceFromCenter = distance / maxRadius;
      const signalStrength = hotspot.signalStrength * (1 - distanceFromCenter * 0.7);
      
      coveragePoints.push({
        lat,
        lng,
        signalStrength: Math.max(0.1, signalStrength),
        connectedHotspots: [hotspot.id]
      });
    }
  });
  
  // Add some additional random coverage points for more realistic distribution
  for (let i = 0; i < 100; i++) {
    coveragePoints.push({
      lat: 38.7000 + Math.random() * 0.08, // Random points in Lisbon area
      lng: -9.2000 + Math.random() * 0.10,
      signalStrength: Math.random() * 0.4 + 0.1, // Lower random signal strength
      connectedHotspots: []
    });
  }
  
  return coveragePoints;
};

// WiFi provider colors for visualization
export const providerColors: Record<string, string> = {
  'Lisboa Digital': '#e11d48', // Rose
  'MEO': '#3b82f6', // Blue
  'NOS': '#f59e0b', // Amber
  'Vodafone': '#dc2626', // Red
  'Metropolitano de Lisboa': '#6b7280', // Gray
  'CP - Comboios de Portugal': '#059669', // Emerald
  'Turismo de Lisboa': '#7c3aed', // Violet
  'FCCN': '#0891b2', // Cyan
  'default': '#6b7280' // Gray fallback
};

// WiFi statistics for the dashboard
export const wifiStats = {
  totalHotspots: wifiHotspots.length,
  publicHotspots: wifiHotspots.filter(h => h.isPublic).length,
  averageSignalStrength: wifiHotspots.reduce((sum, h) => sum + h.signalStrength, 0) / wifiHotspots.length,
  totalConnectedUsers: wifiHotspots.reduce((sum, h) => sum + h.currentUsers, 0),
  totalCapacity: wifiHotspots.reduce((sum, h) => sum + h.maxUsers, 0),
  averageDownloadSpeed: wifiHotspots.reduce((sum, h) => sum + h.speed.download, 0) / wifiHotspots.length,
  providerCount: new Set(wifiHotspots.map(h => h.provider)).size,
  utilizationRate: wifiHotspots.reduce((sum, h) => sum + h.currentUsers, 0) / wifiHotspots.reduce((sum, h) => sum + h.maxUsers, 0)
};
