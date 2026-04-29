import HttpService from './httpService';
import { getConfig } from '../config';

// Lazy initialization to avoid module load time issues
let _httpService: HttpService | null = null;

export const getHttpService = (): HttpService => {
  if (!_httpService) {
    const config = getConfig();
    // Prepend Vite's BASE_URL so paths are correct for all deployment targets
    // (e.g. '/' on Vercel → '/data', '/map-tryouts/' on GitHub Pages → '/map-tryouts/data')
    // apiBaseUrl must start with '/' (as defined in all environment settings files)
    const apiBaseUrl = config.environment.API.baseUrl;
    const normalizedApiBaseUrl = apiBaseUrl.startsWith('/') ? apiBaseUrl : `/${apiBaseUrl}`;
    const baseUrl = `${import.meta.env.BASE_URL.replace(/\/$/, '')}${normalizedApiBaseUrl}`;
    _httpService = new HttpService(baseUrl);
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
