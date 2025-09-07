# Settings Configuration Structure

This directory contains the application settings organized by purpose and environment.

## Structure

```
src/config/settings/
├── configs/              # Static configuration files
│   └── default.json     # Default app configuration (languages, themes, UI settings)
├── environments/        # Environment-specific settings
│   ├── settings.dev.json    # Development environment settings
│   ├── settings.int.json    # Integration environment settings
│   └── settings.prod.json   # Production environment settings
└── index.ts            # Settings loader utilities
```

## Usage

### Loading Configuration

```typescript
import { getAppConfig, getEnvironmentSettings, getDefaultConfig } from '@/config/settings';

// Get all configuration
const { environment, config } = getAppConfig();

// Get only environment-specific settings
const envSettings = getEnvironmentSettings();

// Get only default/static configuration
const defaultSettings = getDefaultConfig();
```

### Environment Settings

Environment settings contain environment-specific values like:
- API endpoints
- Feature flags
- Map configuration
- Data source URLs

### Default Configuration

Default configuration contains static app settings like:
- Supported languages
- Theme options
- Date/number formats
- UI defaults
- Default map settings

## Configuration Files

### `configs/default.json`
Contains static configuration that doesn't change between environments:
- **Languages**: Supported languages with codes, names, flags
- **Themes**: Available themes and default selection
- **Formats**: Date and number formatting by locale
- **UI**: Default UI settings (pagination, animations)
- **Map**: Default map tile layer and attribution

### `environments/settings.{env}.json`
Contains environment-specific settings:
- **Environment**: Current environment identifier
- **API**: Base URLs and endpoints
- **Data**: Mock data file paths
- **Features**: Feature toggles
- **Map Controls**: Available map controls and positioning
- **Map**: Environment-specific map center and zoom levels

## Environment Detection

The system automatically detects the current environment from:
1. `VITE_ENVIRONMENT` environment variable
2. Falls back to `DEV` if not specified

## Adding New Languages

To add a new language:
1. Add the language configuration to `configs/default.json`:
```json
{
  "languages": {
    "supported": [
      ...
      {
        "code": "es",
        "name": "Español",
        "flag": "🇪🇸",
        "nativeName": "Español"
      }
    ]
  }
}
```
2. Create the translation file in `src/locales/es.json`
3. Update the i18n resources in `src/i18n.ts`
