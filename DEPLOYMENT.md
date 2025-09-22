# Deployment Guide

This application supports deployment to both **GitHub Pages** and **Vercel**. The build system automatically detects the deployment target and configures the appropriate base paths and settings.

## 🚀 Deployment Options

### Vercel Deployment

#### Automatic Deployment (Recommended)
1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the `vercel.json` configuration
3. Build command: `npm run build:vercel`
4. Output directory: `dist`

#### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
npm run deploy:vercel
```

#### Environment Configuration
- **Base Path**: `/` (root)
- **Build Command**: `npm run build:vercel`
- **Environment Variable**: `VITE_DEPLOYMENT_TARGET=vercel`

### GitHub Pages Deployment

#### Automatic Deployment
```bash
# Deploy to GitHub Pages
npm run deploy:github
```

#### Manual Build
```bash
# Build for GitHub Pages
npm run build:github
```

#### Environment Configuration
- **Base Path**: `/map-tryouts/`
- **Build Command**: `npm run build:github`
- **Environment Variable**: `VITE_DEPLOYMENT_TARGET=github-pages`

## ⚙️ Build Scripts

| Script | Purpose | Base Path | Target |
|--------|---------|-----------|--------|
| `npm run build` | Default production build (GitHub Pages) | `/map-tryouts/` | GitHub Pages |
| `npm run build:vercel` | Vercel-optimized build | `/` | Vercel |
| `npm run build:github` | GitHub Pages build | `/map-tryouts/` | GitHub Pages |
| `npm run deploy:github` | Build and deploy to GitHub Pages | `/map-tryouts/` | GitHub Pages |
| `npm run deploy:vercel` | Deploy to Vercel | `/` | Vercel |

## 🔧 Configuration Files

### vercel.json
- SPA routing configuration
- Build settings and output directory
- Headers for security and caching
- Environment variables for Vercel

### vite.config.ts
- Automatic deployment target detection
- Dynamic base path configuration
- Platform-specific optimizations

### App.tsx
- Runtime deployment target detection
- Router basename configuration
- Cross-platform compatibility

## 🌍 Environment Detection

The application automatically detects the deployment environment:

1. **Vercel**: Detected by `VITE_DEPLOYMENT_TARGET=vercel` or `vercel.app` hostname
2. **GitHub Pages**: Detected by `VITE_DEPLOYMENT_TARGET=github-pages` or default fallback
3. **Development**: Always uses root path (`/`)

## 🚦 Deployment Status

Both deployment targets support:
- ✅ Single Page Application (SPA) routing
- ✅ Static asset optimization
- ✅ Environment-based configuration
- ✅ Internationalization (EN/PT)
- ✅ Progressive Web App features
- ✅ Security headers
- ✅ Asset caching

## 📝 Notes

- The default `npm run build` remains unchanged for backward compatibility (GitHub Pages)
- Vercel builds use root path for better performance and SEO
- Both builds generate the same application with different base path configurations
- Environment variables are set at build time for optimal performance