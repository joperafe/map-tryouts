import HttpService from './httpService';
import { getConfig } from '../config';

// Lazy initialization to avoid module load time issues
let _httpService: HttpService | null = null;

export const getHttpService = (): HttpService => {
  if (!_httpService) {
    const config = getConfig();
    _httpService = new HttpService(config.environment.API.baseUrl);
  }
  return _httpService;
};

// Backward compatibility - getter that returns the service
export const httpService = new Proxy({} as HttpService, {
  get(_target, prop) {
    const service = getHttpService();
    const value = service[prop as keyof HttpService];
    // Bind methods to maintain context
    if (typeof value === 'function') {
      return value.bind(service);
    }
    return value;
  }
});

export * from './httpService';
