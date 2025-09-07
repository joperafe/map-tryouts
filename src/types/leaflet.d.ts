// Leaflet type extensions
import 'leaflet';

declare module 'leaflet' {
  namespace Icon {
    interface DefaultStatic {
      prototype: {
        _getIconUrl?: () => string;
      };
    }
  }
}

export {};
