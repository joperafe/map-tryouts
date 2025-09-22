# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Climate Data Visualization Dashboard

A modern React TypeScript application for monitoring environmental data through interactive maps.

## Recent Updates
- ✅ Auto-merge workflow fixed and operational

![Climate Dashboard](https://img.shields.io/badge/React-18.2.0-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.1.4-646CFF?style=flat-square&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.6-06B6D4?style=flat-square&logo=tailwindcss)

## 🚀 Features

- **Interactive Map**: Display sensors, green zones, and environmental data on a Leaflet-based map
- **Dynamic Heatmap**: Visualize temperature/climate data as color-coded overlays
- **Sensor Management**: Show real sensor locations with popup details and real-time data
- **Green Zones**: Display and manage environmental green zones with polygon overlays
- **Configurable Controls**: Map controls for layer toggling, drawing tools, measurements, and fullscreen
- **Multi-environment Support**: DEV, INT, and PROD configurations
- **Internationalization**: Multi-language support (EN/PT)
- **Dark Theme**: Modern dark theme support
- **Mobile-first**: Responsive design optimized for mobile devices

## 🛠 Technical Stack

- **Frontend**: React 18+ with TypeScript
- **Build Tool**: Vite with Hot Module Replacement
- **Styling**: Tailwind CSS with custom components
- **Map Library**: React-Leaflet with Leaflet.js
- **HTTP Client**: Axios for API calls
- **Routing**: React Router DOM
- **Internationalization**: react-i18next
- **State Management**: React hooks (useState, useEffect, useContext)
- **Testing**: Jest with React Testing Library
- **Deployment**: GitHub Pages + Vercel (dual platform support)

## 📋 Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd climate-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
├── modules/             # Feature-based modules
│   └── dashboard/       # Main dashboard module
│       ├── components/  # Dashboard-specific components
│       ├── hooks/       # Custom hooks
│       └── __tests__/   # Module tests
├── services/            # API services and HTTP client
├── config/              # Environment configurations
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── assets/              # Static assets
└── locales/             # Translation files
public/
├── data/                # Mock data files
└── assets/              # Public assets
```

## ⚙️ Configuration Management

Environment-specific configurations are managed through JSON files:

- **settings.dev.json**: Development environment (mock data, all controls enabled)
- **settings.int.json**: Integration environment (staging APIs, limited controls)
- **settings.prod.json**: Production environment (live APIs, essential controls)

### Configuration Schema

```json
{
  "environment": "DEV",
  "api": { "baseUrl": "mock/live endpoints" },
  "data": { 
    "sensors": "/path/to/data", 
    "greenzones": "/path/to/data" 
  },
  "features": { 
    "enableHeatmap": true, 
    "enableGreenZones": true 
  },
  "mapControls": {
    "position": "topright",
    "controls": [
      { "type": "layerToggle", "enabled": true },
      { "type": "draw", "enabled": false },
      { "type": "fullscreen", "enabled": true }
    ]
  },
  "map": { 
    "center": [41.1579, -8.6291], 
    "zoom": 13, 
    "maxZoom": 18 
  }
}
```

## 🎨 Styling & UI

- **Tailwind CSS**: Modern, responsive design system
- **Component Styles**: Separate .css files for complex components
- **Map Styling**: Custom Leaflet control styling
- **Responsive**: Mobile-first design approach
- **Theme Support**: Configurable color schemes

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Generate coverage report
npm test -- --coverage
```

## 📊 Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run test suite
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## 🌐 Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=https://api.example.com
VITE_MAP_TILES_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
VITE_DEFAULT_LANGUAGE=en
VITE_ENVIRONMENT=DEV
```

## 📊 Mock Data

Development uses mock data files located in `public/data/`:

- `sensors.mock.json` - Sample sensor data with temperature, humidity, air quality, and noise levels
- `greenzones.mock.json` - Sample green zone data with polygons and area information

### Sample Sensor Data Structure

```json
{
  "id": "sensor-001",
  "name": "Downtown Temperature Sensor",
  "coordinates": [41.1579, -8.6291],
  "data": {
    "temperature": 22.5,
    "humidity": 65,
    "airQualityIndex": 45,
    "noiseLevel": 55
  },
  "lastUpdated": "2025-09-06T10:30:00Z",
  "status": "active"
}
```

## 🚀 Deployment

This application supports deployment to both **GitHub Pages** and **Vercel**. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Quick Start

#### Vercel (Recommended)
```bash
npm run build:vercel
npm run deploy:vercel
```

#### GitHub Pages 
```bash
npm run build:github  
npm run deploy:github
```

### GitHub Pages (Automatic) 

The project includes a comprehensive CI/CD pipeline that automatically:

1. **Tests and validates** code on every push and PR
2. **Builds** the application for production 
3. **Deploys** to GitHub Pages when code is pushed to `main`

#### Setup GitHub Pages:

1. Go to your repository settings on GitHub
2. Navigate to **Pages** section
3. Select **Source**: `GitHub Actions`
4. The workflow will automatically deploy on next push to `main`

#### Live URL:
After deployment, your app will be available at:
`https://joperafe.github.io/map-tryouts/`

### Workflow Features:

- ✅ **Automated Testing**: Runs linting and tests before deployment  
- ✅ **Type Safety**: TypeScript compilation checks
- ✅ **Environment Variables**: Production environment configuration
- ✅ **Build Optimization**: Vite production optimizations
- ✅ **SPA Support**: Proper routing for single-page applications

### Manual Deployment (Alternative)

```bash
# Build for production
npm run build

# Deploy using gh-pages (if needed)
npm run deploy
```

### Environment Configuration

The build process automatically uses:
- `NODE_ENV=production` 
- `VITE_ENVIRONMENT=PROD`
- Base path configured for GitHub Pages (`/map-tryouts/`)

### Troubleshooting Deployment

1. **404 Errors**: Ensure GitHub Pages is configured to use GitHub Actions as source
2. **Build Failures**: Check GitHub Actions logs in the **Actions** tab
3. **Routing Issues**: The SPA redirect script handles client-side routing
4. **API Issues**: Verify production API endpoints in environment settings

## 🌐 Internationalization

The application supports multiple languages through react-i18next:

```typescript
// Language switching
const { t, i18n } = useTranslation();

// Usage in components
<h1>{t('dashboard.title')}</h1>

// Change language
i18n.changeLanguage('pt');
```

Translation files are located in `src/locales/`:
- `en.json` - English translations
- `pt.json` - Portuguese translations

## 🔧 API Integration

The application uses a configurable HTTP service that can work with:

- **Development**: Mock JSON files in `public/data/`
- **Integration**: Staging API endpoints
- **Production**: Live API endpoints

Example API service usage:

```typescript
import { httpService } from './services';

// Fetch sensors
const sensorsResponse = await httpService.getSensors();

// Fetch green zones
const greenZonesResponse = await httpService.getGreenZones();
```

## 📈 Performance Features

- **Code Splitting**: Route-based lazy loading
- **Map Clustering**: Efficient marker clustering for large datasets
- **Bundle Optimization**: Vite's optimized production builds
- **API Caching**: Response caching with appropriate TTL

## 🔍 Troubleshooting

### Common Issues

1. **Build Errors**: Ensure all dependencies are installed with `npm install`
2. **Port Conflicts**: Development server uses port 3000 by default
3. **Map Not Loading**: Check if Leaflet CSS is properly imported
4. **API Errors**: Verify environment configuration files

### Development Tips

- Use `npm run dev` for hot reloading during development
- Check browser console for any JavaScript errors
- Ensure mock data files are properly formatted JSON
- Use browser dev tools to inspect network requests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI library
- [Leaflet](https://leafletjs.com/) - Interactive maps
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Vite](https://vitejs.dev/) - Build tool
- [TypeScript](https://www.typescriptlang.org/) - Type safety

---

Made with ❤️ for environmental monitoring

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
