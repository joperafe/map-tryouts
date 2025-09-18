import axios from 'axios';
import type { AirQualityObservedRaw, AirQualityStation } from '../types/airQuality';
import { AIR_QUALITY_THRESHOLDS } from '../types/airQuality';

/**
 * FIWARE broker endpoints
 */
const FIWARE_ENDPOINT_DEV = '/api/fiware/v2/entities'; // Proxied through Vite
const FIWARE_ENDPOINT_PROD = 'https://broker.fiware.urbanplatform.portodigital.pt/v2/entities';

/**
 * Mock data for fallback when API is not available
 */
const MOCK_AIR_QUALITY_DATA: AirQualityObservedRaw[] = [
  {
    id: 'urn:ngsi-ld:AirQualityObserved:Porto:Station:001',
    type: 'AirQualityObserved',
    location: {
      type: 'geo:json',
      value: {
        type: 'Point',
        coordinates: [-8.6291, 41.1579], // Porto center
      },
      metadata: {},
    },
    dateObserved: {
      type: 'DateTime',
      value: new Date().toISOString(),
      metadata: {},
    },
    pm25: {
      type: 'Number',
      value: 15.2,
      metadata: {},
    },
    pm10: {
      type: 'Number',
      value: 22.8,
      metadata: {},
    },
    no2: {
      type: 'Number',
      value: 38.5,
      metadata: {},
    },
    o3: {
      type: 'Number',
      value: 65.1,
      metadata: {},
    },
    co: {
      type: 'Number',
      value: 2.1,
      metadata: {},
    },
    temperature: {
      type: 'Number',
      value: 18.5,
      metadata: {},
    },
    humidity: {
      type: 'Number',
      value: 72.3,
      metadata: {},
    },
  },
  {
    id: 'urn:ngsi-ld:AirQualityObserved:Porto:Station:002',
    type: 'AirQualityObserved',
    location: {
      type: 'geo:json',
      value: {
        type: 'Point',
        coordinates: [-8.6100, 41.1400], // Porto southeast
      },
      metadata: {},
    },
    dateObserved: {
      type: 'DateTime',
      value: new Date(Date.now() - 30 * 60000).toISOString(), // 30 minutes ago
      metadata: {},
    },
    pm25: {
      type: 'Number',
      value: 25.7,
      metadata: {},
    },
    pm10: {
      type: 'Number',
      value: 42.3,
      metadata: {},
    },
    no2: {
      type: 'Number',
      value: 55.2,
      metadata: {},
    },
    o3: {
      type: 'Number',
      value: 48.9,
      metadata: {},
    },
    co: {
      type: 'Number',
      value: 3.4,
      metadata: {},
    },
  },
  {
    id: 'urn:ngsi-ld:AirQualityObserved:Porto:Station:003',
    type: 'AirQualityObserved',
    location: {
      type: 'geo:json',
      value: {
        type: 'Point',
        coordinates: [-8.6500, 41.1700], // Porto northwest
      },
      metadata: {},
    },
    dateObserved: {
      type: 'DateTime',
      value: new Date(Date.now() - 2 * 60 * 60000).toISOString(), // 2 hours ago
      metadata: {},
    },
    pm25: {
      type: 'Number',
      value: 8.1,
      metadata: {},
    },
    pm10: {
      type: 'Number',
      value: 18.5,
      metadata: {},
    },
    no2: {
      type: 'Number',
      value: 28.7,
      metadata: {},
    },
    o3: {
      type: 'Number',
      value: 78.2,
      metadata: {},
    },
    co: {
      type: 'Number',
      value: 1.2,
      metadata: {},
    },
    temperature: {
      type: 'Number',
      value: 19.8,
      metadata: {},
    },
    humidity: {
      type: 'Number',
      value: 68.1,
      metadata: {},
    },
  },
];

/**
 * Service for fetching and processing air quality data from FIWARE broker
 */
export class AirQualityService {
  /**
   * Fetch raw air quality data from FIWARE broker with fallback
   */
  static async fetchRawData(): Promise<AirQualityObservedRaw[]> {
    // TEMPORARY: Force use mock data to test rendering
    console.log('🔧🔧🔧 [FORCED DEBUG] Using mock data instead of API - CHECK IF MARKERS APPEAR! 🔧🔧🔧');
    console.log('📍 Mock data stations count:', MOCK_AIR_QUALITY_DATA.length);
    return MOCK_AIR_QUALITY_DATA;
    const endpoint = import.meta.env.DEV ? FIWARE_ENDPOINT_DEV : FIWARE_ENDPOINT_PROD;

    try {
      console.log(`Attempting to fetch air quality data from: ${endpoint}`);
      
      const response = await axios.get(endpoint, {
        params: {
          type: 'AirQualityObserved',
          limit: 1000,
          options: 'keyValues',
        },
        timeout: 10000,
      });

      console.log(`Successfully fetched ${response.data.length} air quality stations`);
      
      // Check if data is empty and provide fallback
      if (!response.data || response.data.length === 0) {
        console.warn('⚠️ [API] No air quality data received from FIWARE API, using fallback data');
        return MOCK_AIR_QUALITY_DATA;
      }
      
      console.log('🔍 [API] First station structure check:', response.data[0]);
      console.log('Sample API response:', response.data.slice(0, 1)); // Log first station for debugging
      return response.data;
      
    } catch (error) {
      console.warn('Error fetching air quality data from API, using mock data:', error);
      
      // Use mock data as fallback
      console.log(`Using mock air quality data (${MOCK_AIR_QUALITY_DATA.length} stations)`);
      return MOCK_AIR_QUALITY_DATA;
    }
  }

  /**
   * Transform raw FIWARE data into normalized air quality stations
   */
  static normalizeData(rawData: AirQualityObservedRaw[]): AirQualityStation[] {
    console.log('🔍 [NORMALIZE] Starting normalization with raw data length:', rawData.length);
    console.log('🔍 [NORMALIZE] First raw station sample:', JSON.stringify(rawData[0], null, 2));
    
    const normalized = rawData
      .filter(station => {
        const hasLocation = station.location?.value?.coordinates;
        console.log('🔍 [FILTER] Station', station.id, 'has location:', !!hasLocation);
        return hasLocation;
      })
      .map(station => {
        const [longitude, latitude] = station.location.value.coordinates;
        const lastUpdated = new Date(station.dateObserved.value);
        
        // Extract measurements
        const measurements = {
          co: station.co?.value,
          no2: station.no2?.value,
          o3: station.o3?.value,
          pm1: station.pm1?.value,
          pm10: station.pm10?.value,
          pm25: station.pm25?.value,
          temperature: station.temperature?.value,
          humidity: station.humidity?.value,
          so2: station.so2?.value,
        };

        // Calculate air quality index and level
        const { airQualityIndex, qualityLevel, primaryPollutant } = 
          this.calculateAirQualityIndex(measurements);

        return {
          id: station.id,
          latitude,
          longitude,
          lastUpdated,
          isRecent: this.isRecentData(lastUpdated),
          measurements,
          airQualityIndex,
          qualityLevel,
          primaryPollutant,
        };
      });

    console.log('🔍 [NORMALIZE] Normalized data:', normalized.length, 'stations processed');
    console.log('🔍 [NORMALIZE] Sample normalized station:', JSON.stringify(normalized[0], null, 2));
    
    if (normalized.length === 0) {
      console.error('⚠️ [NORMALIZE] No stations passed filtering! All stations filtered out.');
    }
    
    return normalized;
  }

  /**
   * Calculate Air Quality Index (AQI) based on available measurements
   */
  private static calculateAirQualityIndex(measurements: Record<string, number | undefined>): {
    airQualityIndex: number;
    qualityLevel: AirQualityStation['qualityLevel'];
    primaryPollutant: string;
  } {
    let maxAqi = 0;
    let primaryPollutant = 'None';

    // Calculate AQI for each pollutant
    Object.entries(measurements).forEach(([pollutant, value]) => {
      if (!value || !(pollutant in AIR_QUALITY_THRESHOLDS)) return;

      const thresholds = AIR_QUALITY_THRESHOLDS[pollutant as keyof typeof AIR_QUALITY_THRESHOLDS];
      const aqi = this.calculatePollutantAqi(value, thresholds);
      
      if (aqi > maxAqi) {
        maxAqi = aqi;
        primaryPollutant = pollutant.toUpperCase();
      }
    });

    const qualityLevel = this.getQualityLevel(maxAqi);

    return {
      airQualityIndex: Math.round(maxAqi),
      qualityLevel,
      primaryPollutant,
    };
  }

  /**
   * Calculate AQI for a specific pollutant
   */
  private static calculatePollutantAqi(
    concentration: number, 
    thresholds: {
      good: number;
      moderate: number;
      unhealthySensitive: number;
      unhealthy: number;
      veryUnhealthy: number;
    }
  ): number {
    const { good, moderate, unhealthySensitive, unhealthy, veryUnhealthy } = thresholds;

    if (concentration <= good) return (50 / good) * concentration;
    if (concentration <= moderate) return 50 + ((100 - 50) / (moderate - good)) * (concentration - good);
    if (concentration <= unhealthySensitive) return 100 + ((150 - 100) / (unhealthySensitive - moderate)) * (concentration - moderate);
    if (concentration <= unhealthy) return 150 + ((200 - 150) / (unhealthy - unhealthySensitive)) * (concentration - unhealthySensitive);
    if (concentration <= veryUnhealthy) return 200 + ((300 - 200) / (veryUnhealthy - unhealthy)) * (concentration - unhealthy);
    
    return 300 + ((500 - 300) / (veryUnhealthy * 2 - veryUnhealthy)) * (concentration - veryUnhealthy);
  }

  /**
   * Get quality level based on AQI value
   */
  private static getQualityLevel(aqi: number): AirQualityStation['qualityLevel'] {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  }

  /**
   * Check if data is recent (within 24 hours)
   */
  private static isRecentData(date: Date): boolean {
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    return diffHours <= 24;
  }

  /**
   * Fetch and normalize air quality data
   */
  static async getAirQualityStations(): Promise<AirQualityStation[]> {
    const rawData = await this.fetchRawData();
    return this.normalizeData(rawData);
  }
}