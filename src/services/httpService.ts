import type { Sensor, GreenZone, APIResponse } from '../types';

class HttpService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetchWithErrorHandling<T>(url: string): Promise<APIResponse<T>> {
    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        data,
        success: true,
      };
    } catch (error) {
      console.error('Fetch error:', error);
      return {
        data: null as T,
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async getSensors(): Promise<APIResponse<Sensor[]>> {
    return this.fetchWithErrorHandling<Sensor[]>(`${this.baseUrl}/sensors.mock.json`);
  }

  async getGreenZones(): Promise<APIResponse<GreenZone[]>> {
    return this.fetchWithErrorHandling<GreenZone[]>(`${this.baseUrl}/greenzones.mock.json`);
  }

  async getSensorById(id: string): Promise<APIResponse<Sensor | null>> {
    const sensorsResponse = await this.getSensors();
    if (!sensorsResponse.success || !sensorsResponse.data) {
      return {
        data: null,
        success: false,
        message: 'Failed to fetch sensors',
      };
    }

    const sensor = sensorsResponse.data.find(s => s.id === id) || null;
    return {
      data: sensor,
      success: true,
    };
  }
}

export default HttpService;
