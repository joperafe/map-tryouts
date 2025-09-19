import axios from 'axios';
import type { AirQualityObserved, AirQualityObservedKeyValue, AirQualityStation, NGSIAttribute } from '../types/airQuality';
import { AIR_QUALITY_THRESHOLDS } from '../types/airQuality';

/**
 * FIWARE broker endpoints
 */
const FIWARE_ENDPOINT_DEV = '/api/fiware/v2/entities'; // Proxied through Vite
const FIWARE_ENDPOINT_PROD = 'https://broker.fiware.urbanplatform.portodigital.pt/v2/entities';

/**
 * Service for fetching and processing air quality data from FIWARE broker
 */
export class AirQualityService {
  /**
   * Load mock data from JSON file
   */
  private static async loadMockData(): Promise<AirQualityObserved[]> {
    try {
      const response = await axios.get('/air-quality.mock.json', {
        // Ensure we're expecting JSON and handle errors properly
        validateStatus: (status) => status >= 200 && status < 300,
        responseType: 'json'
      });
      return response.data;
    } catch (error) {
      console.error('Failed to load mock air quality data:', error);
      // Check if it's an axios error with a response
      if (axios.isAxiosError(error) && error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      return [];
    }
  }

  /**
   * Fetch raw air quality data from FIWARE broker
   * @param customUrl Optional custom URL to fetch data from (overrides default endpoints)
   */
  static async fetchRawData(customUrl?: string): Promise<AirQualityObserved[]> {
    const endpoint = customUrl || (import.meta.env.DEV ? FIWARE_ENDPOINT_DEV : FIWARE_ENDPOINT_PROD);

    try {
      const response = await axios.get(endpoint, {
        params: {
          type: 'AirQualityObserved',
          limit: 1000,
          options: 'keyValues',
        },
        timeout: 10000,
      });
      
      // Check if data is empty and provide fallback
      if (!response.data || response.data.length === 0) {
        console.warn('[AirQuality] No data received from FIWARE API, using fallback data');
        return await this.loadMockData();
      }
      
      return response.data;
      
    } catch (error) {
      console.warn('[AirQuality] API request failed, using mock data:', error instanceof Error ? error.message : error);
      
      // Use mock data as fallback
      const mockData = await this.loadMockData();
      return mockData;
    }
  }

  /**
   * Check if the data is in keyValue format (simplified) or full NGSI-LD format
   */
  private static isKeyValueFormat(station: AirQualityObserved): station is AirQualityObservedKeyValue {
    // In keyValue format, location is directly a GeoJsonPoint, not wrapped in {type, value}
    return 'coordinates' in station.location && typeof station.dateObserved === 'string';
  }

  /**
   * Transform raw FIWARE data into normalized air quality stations
   */
  static normalizeData(rawData: AirQualityObserved[]): AirQualityStation[] {
    const normalized = rawData
      .filter(station => {
        const isKeyValue = this.isKeyValueFormat(station);
        const hasLocation = isKeyValue 
          ? station.location.coordinates 
          : station.location.value?.coordinates;
        return hasLocation;
      })
      .map(station => {
        const isKeyValue = this.isKeyValueFormat(station);
        
        // Extract coordinates based on format
        const coordinates = isKeyValue 
          ? station.location.coordinates 
          : station.location.value.coordinates;
        const [longitude, latitude] = coordinates;
        
        // Extract dateObserved based on format
        const dateObservedValue = isKeyValue 
          ? station.dateObserved
          : station.dateObserved.value;
        const lastUpdated = new Date(dateObservedValue);
        
        // Extract measurements based on format
        const extractValue = (prop: number | NGSIAttribute<number> | undefined): number | undefined => 
          isKeyValue ? prop as number : (prop as NGSIAttribute<number>)?.value;
        
        const measurements = {
          co: extractValue(station.co),
          no2: extractValue(station.no2),
          o3: extractValue(station.o3),
          pm1: extractValue(station.pm1),
          pm10: extractValue(station.pm10),
          pm25: extractValue(station.pm25),
          temperature: extractValue(station.temperature),
          humidity: extractValue(station.humidity),
          so2: extractValue(station.so2),
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
    
    if (normalized.length === 0) {
      console.warn('[AirQuality] No stations passed filtering! Check data format.');
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
   * @param customUrl Optional custom URL to fetch data from (overrides default endpoints)
   */
  static async getAirQualityStations(customUrl?: string): Promise<AirQualityStation[]> {
    const rawData = await this.fetchRawData(customUrl);
    return this.normalizeData(rawData);
  }
}