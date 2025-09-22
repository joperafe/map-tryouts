import type { MapConfig, ControlSetting, ControlLayout, DataLayer } from '../types';

/**
 * Utility to adapt MAP configuration from main app settings to microservice format
 * This ensures compatibility between the main application's settings structure
 * and the microservice's expected configuration format.
 */

/**
 * Type for the main application's MAP configuration structure
 * This should match the AppConfig.MAP interface from the main app
 */
export interface MainAppMapConfig {
  controls_settings: Record<string, ControlSetting>;
  map_controls: Record<string, ControlLayout>;
  map_settings: {
    center: number[];
    zoom: number;
    maxZoom: number;
    minZoom: number;
    scrollWheelZoom?: boolean;
    doubleClickZoom?: boolean;
    boxZoom?: boolean;
    keyboard?: boolean;
    displayControlLabel?: boolean;
  };
  data_layers?: Record<string, DataLayer>;
  default_tile_layer?: string;
  default_attribution?: string;
  tile_layers?: Record<string, {
    name: string;
    url: string;
    attribution: string;
  }>;
}

/**
 * Adapts the main application's MAP configuration to the microservice's expected format
 * @param mainAppConfig - The MAP configuration from the main application
 * @returns MapConfig compatible with the microservice
 */
export function adaptMapConfig(mainAppConfig: MainAppMapConfig): MapConfig {
  return {
    map_settings: {
      center: mainAppConfig.map_settings.center,
      zoom: mainAppConfig.map_settings.zoom,
      maxZoom: mainAppConfig.map_settings.maxZoom,
      minZoom: mainAppConfig.map_settings.minZoom,
      scrollWheelZoom: mainAppConfig.map_settings.scrollWheelZoom,
      doubleClickZoom: mainAppConfig.map_settings.doubleClickZoom,
      boxZoom: mainAppConfig.map_settings.boxZoom,
      keyboard: mainAppConfig.map_settings.keyboard,
      displayControlLabel: mainAppConfig.map_settings.displayControlLabel,
    },
    default_tile_layer: mainAppConfig.default_tile_layer,
    default_attribution: mainAppConfig.default_attribution,
    tile_layers: mainAppConfig.tile_layers,
    data_layers: mainAppConfig.data_layers,
    controls_settings: mainAppConfig.controls_settings,
    map_controls: mainAppConfig.map_controls,
  };
}