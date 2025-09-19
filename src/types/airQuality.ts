/**
 * Air Quality data types for FIWARE NGSI-LD entities
 * Source: https://broker.fiware.urbanplatform.portodigital.pt/v2/entities?type=AirQualityObserved
 */

export interface NGSIAttribute<T = unknown> {
  type: string;
  value: T;
  metadata: Record<string, unknown>;
}

export interface GeoJsonPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
  crs?: {
    type: 'name';
    properties: {
      name: string;
    };
  };
}

export interface AirQualityObservedRaw {
  id: string;
  type: 'AirQualityObserved';
  
  // Location (required)
  location: NGSIAttribute<GeoJsonPoint>;
  
  // Timestamp
  dateObserved: NGSIAttribute<string>;
  
  // Air quality measurements (all optional)
  co?: NGSIAttribute<number>;      // Carbon Monoxide
  no2?: NGSIAttribute<number>;     // Nitrogen Dioxide  
  o3?: NGSIAttribute<number>;      // Ozone
  pm1?: NGSIAttribute<number>;     // Particulate Matter 1μm
  pm10?: NGSIAttribute<number>;    // Particulate Matter 10μm
  pm25?: NGSIAttribute<number>;    // Particulate Matter 2.5μm
  
  // Additional measurements
  temperature?: NGSIAttribute<number>;
  humidity?: NGSIAttribute<number>;
  so2?: NGSIAttribute<number>;     // Sulfur Dioxide
}

/**
 * Simplified key-value format returned when using options=keyValues
 */
export interface AirQualityObservedKeyValue {
  id: string;
  type: 'AirQualityObserved';
  
  // Location (required) - simplified format
  location: GeoJsonPoint;
  
  // Timestamp - simplified format
  dateObserved: string;
  
  // Air quality measurements (all optional) - simplified format
  co?: number;      // Carbon Monoxide
  no2?: number;     // Nitrogen Dioxide  
  o3?: number;      // Ozone
  pm1?: number;     // Particulate Matter 1μm
  pm10?: number;    // Particulate Matter 10μm
  pm25?: number;    // Particulate Matter 2.5μm
  
  // Additional measurements
  temperature?: number;
  humidity?: number;
  so2?: number;     // Sulfur Dioxide
}

/**
 * Union type to handle both formats
 */
export type AirQualityObserved = AirQualityObservedRaw | AirQualityObservedKeyValue;

/**
 * Normalized air quality data for easier use in components
 */
export interface AirQualityStation {
  id: string;
  
  // Location
  latitude: number;
  longitude: number;
  
  // Metadata
  lastUpdated: Date;
  isRecent: boolean; // Within last 24 hours
  
  // Air quality measurements
  measurements: {
    co?: number;
    no2?: number;
    o3?: number;
    pm1?: number;
    pm10?: number;
    pm25?: number;
    temperature?: number;
    humidity?: number;
    so2?: number;
  };
  
  // Computed quality indicators
  airQualityIndex: number; // 0-500 scale
  qualityLevel: 'Good' | 'Moderate' | 'Unhealthy for Sensitive' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  primaryPollutant: string;
}

/**
 * Air quality thresholds for different pollutants
 * Based on WHO and EPA guidelines
 */
export const AIR_QUALITY_THRESHOLDS = {
  pm25: {
    good: 12,
    moderate: 35.4,
    unhealthySensitive: 55.4,
    unhealthy: 150.4,
    veryUnhealthy: 250.4,
  },
  pm10: {
    good: 54,
    moderate: 154,
    unhealthySensitive: 254,
    unhealthy: 354,
    veryUnhealthy: 424,
  },
  o3: {
    good: 54,
    moderate: 70,
    unhealthySensitive: 85,
    unhealthy: 105,
    veryUnhealthy: 200,
  },
  no2: {
    good: 53,
    moderate: 100,
    unhealthySensitive: 360,
    unhealthy: 649,
    veryUnhealthy: 1249,
  },
  co: {
    good: 4.4,
    moderate: 9.4,
    unhealthySensitive: 12.4,
    unhealthy: 15.4,
    veryUnhealthy: 30.4,
  },
} as const;

/**
 * Color scheme for air quality visualization
 */
export const AIR_QUALITY_COLORS = {
  Good: '#00e400',
  Moderate: '#ffff00',
  'Unhealthy for Sensitive': '#ff7e00',
  Unhealthy: '#ff0000',
  'Very Unhealthy': '#8f3f97',
  Hazardous: '#7e0023',
} as const;