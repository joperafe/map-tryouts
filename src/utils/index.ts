export const formatTemperature = (temp: number): string => {
  return `${temp.toFixed(1)}°C`;
};

export const formatHumidity = (humidity: number): string => {
  return `${humidity}%`;
};

export const formatAirQuality = (aqi: number): string => {
  return `${aqi} AQI`;
};

export const formatNoiseLevel = (noise: number): string => {
  return `${noise} dB`;
};

export const getAirQualityStatus = (aqi: number): 'good' | 'moderate' | 'poor' | 'hazardous' => {
  if (aqi <= 50) return 'good';
  if (aqi <= 100) return 'moderate';
  if (aqi <= 150) return 'poor';
  return 'hazardous';
};

export const getAirQualityColor = (aqi: number): string => {
  const status = getAirQualityStatus(aqi);
  switch (status) {
    case 'good': return '#10b981'; // green
    case 'moderate': return '#f59e0b'; // yellow
    case 'poor': return '#f97316'; // orange
    case 'hazardous': return '#ef4444'; // red
    default: return '#6b7280'; // gray
  }
};

export const formatArea = (area: number): string => {
  if (area >= 1000000) {
    return `${(area / 1000000).toFixed(1)} km²`;
  }
  if (area >= 10000) {
    return `${(area / 10000).toFixed(1)} ha`;
  }
  return `${area} m²`;
};

export const formatLastUpdated = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  delay: number
): T => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  }) as T;
};
