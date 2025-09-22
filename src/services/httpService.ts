import axios from 'axios';
import type { AxiosResponse } from 'axios';
import type { Sensor, GreenZone, APIResponse } from '../types';

class HttpService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetchWithErrorHandling<T>(url: string): Promise<APIResponse<T>> {
    try {
      const response: AxiosResponse<T> = await axios.get(url, {
        validateStatus: (status) => status >= 200 && status < 300,
        responseType: 'json'
      });
      
      return {
        data: response.data,
        success: true,
      };
    } catch (error) {
      // Axios errors have a more specific structure
      console.error('HTTP service error:', error);
      
      let errorMessage = 'Unknown error occurred';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || error.message || `HTTP ${error.response?.status}: ${error.response?.statusText}`;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      return {
        data: null as T,
        success: false,
        message: errorMessage,
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
