<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Climate Data Visualization Dashboard - Copilot Instructions

This is a React TypeScript project using Vite for building a climate monitoring dashboard with interactive maps, real-time sensor data visualization, and environmental monitoring capabilities.

## Project Structure

- **Frontend**: React 18+ with TypeScript, Functional Components + Hooks
- **Build Tool**: Vite with Hot Module Replacement and environment-based builds
- **Styling**: Tailwind CSS with responsive design classes
- **Map Library**: React-Leaflet with Leaflet.js for interactive mapping
- **HTTP Client**: Axios for API calls with proper error handling
- **Routing**: React Router DOM with SPA routing support
- **State Management**: React Context API with useReducer pattern, custom hooks
- **Internationalization**: react-i18next with EN/PT support
- **Testing**: Jest with React Testing Library
- **Deployment**: GitHub Pages with Vercel compatibility

## Architecture Patterns

### State Management
- Use React Context API for global state (AppContext, MapDataContext, SensorLayersContext)
- Implement useReducer pattern for complex state logic
- Create custom hooks for reusable logic (useMapSettings, useSensorLayers)
- Keep component state local when possible

### Component Structure
```
src/
├── modules/dashboard/components/     # Feature-specific components
├── components/                      # Shared/reusable components  
├── contexts/                        # Global state management
├── hooks/                          # Custom React hooks
├── services/                       # API and data services
├── utils/                          # Utility functions
├── types/                          # TypeScript interfaces
└── config/                         # Environment-based configuration
```

### Configuration System
- Environment-based configs (DEV/INT/PROD) in `src/config/settings/`
- Runtime environment switching via URL parameters (`?env=dev`)
- Dynamic configuration overrides for different deployment targets
- Settings-driven UI controls and feature flags

## Development Guidelines

### Code Standards
- **Components**: PascalCase, functional components with TypeScript interfaces
- **Hooks**: Start with `use`, return objects for complex state
- **Files**: kebab-case for utilities, PascalCase for components
- **Imports**: Absolute imports using `@/` alias, group by type (React, libraries, local)

### TypeScript Usage
- Define interfaces for all props, state, and API responses
- Use strict typing, avoid `any`
- Create union types for enums (e.g., `Environment = 'DEV' | 'INT' | 'PROD'`)
- Export types from `src/types/index.ts`

### React Patterns
- Prefer composition over inheritance
- Use custom hooks for shared logic
- Implement proper cleanup in useEffect
- Handle loading, error, and success states consistently
- Use React.useMemo() for expensive components

### Map Integration
- Use React-Leaflet components exclusively
- Implement proper layer visibility controls
- Handle map events through custom components (MapEvents)
- Create reusable marker components (TempSensorMarker, SensorPopup)
- Use Leaflet icons with proper cleanup

### Styling Approach
- Mobile-first responsive design with Tailwind classes
- Use CSS custom properties for dynamic values (--controls-width, --controls-height)
- Implement dark mode support with `dark:` variants
- Create reusable component variants
- Handle fullscreen and overlay states

### Error Handling
- Implement error boundaries for component trees
- Use try-catch in async functions with proper error logging
- Provide fallback UI states for failed data loading
- Show user-friendly error messages with translation support

### Performance Optimization
- Implement proper dependency arrays in useEffect
- Lazy load components and data when appropriate
- Optimize map rendering with conditional layer rendering
- Use ResizeObserver for dynamic measurements

## Feature Implementation Patterns

### Map Controls
- Configuration-driven control system using settings files
- Controls only visible when configured in `map_controls.primary_toolbar`
- Support for buttons, dropdowns, and toggle panels
- Implement keyboard shortcuts (ESC for mode cancellation)

### Layer Management
- Layers only visible when corresponding controls are configured
- Use `isLayerControlEnabled()` helper for conditional rendering
- Sync layer state with global contexts (SensorLayersContext)
- Support dynamic layer toggling and refresh functionality

### Data Integration
- Environment-specific API endpoints and mock data
- Automatic fallback to mock data on API failures
- Real-time data updates with loading states
- Consistent data transformation between API and UI formats

### Internationalization
- All user-facing text through `t()` function
- Structured translation keys (e.g., `DASHBOARD_MAP_TOOLTIPS_BASE_MAP`)
- Support for pluralization and variable interpolation
- Consistent translation patterns across components

### State Synchronization
- Map layer data synced to SensorLayersContext on changes
- Environment switching triggers configuration reloads
- URL parameters reflected in component state
- Proper cleanup of subscriptions and effects

## Common Implementation Patterns

### Loading States
```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// In async functions
try {
  setLoading(true);
  setError(null);
  const data = await apiCall();
  // handle success
} catch (err) {
  setError(err.message);
} finally {
  setLoading(false);
}
```

### Context Usage
```typescript
// Create context with proper typing
const MyContext = React.createContext<MyContextValue | undefined>(undefined);

// Custom hook with error handling
export const useMyContext = () => {
  const context = React.useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;
};
```

### Map Component Pattern
```typescript
// Conditional rendering based on configuration
{layersVisible.myLayer && isLayerControlEnabled('myLayer') && (
  <MyLayerComponent data={data} />
)}
```

### Translation Pattern
```typescript
// Component translations
{t('COMPONENT_SECTION_KEY', { count: items.length })}

// Translation keys structure
COMPONENT_SECTION_SPECIFIC_KEY
```

## File Organization Rules

- **Components**: One component per file, co-locate related types
- **Hooks**: Group related hooks in feature directories
- **Utils**: Pure functions, no React dependencies
- **Services**: API calls and data transformation logic
- **Types**: Shared interfaces, group by feature area
- **Config**: Environment-specific settings, build-time configuration

## Testing Guidelines

- Test components with React Testing Library
- Mock external dependencies (API calls, maps)
- Test user interactions and state changes
- Include accessibility testing
- Test error states and edge cases

## Performance Considerations

- Minimize re-renders with proper memoization
- Use virtualization for large datasets
- Implement progressive loading for map layers
- Optimize bundle size with code splitting
- Cache expensive calculations

## Accessibility Requirements

- Implement proper ARIA labels and roles
- Support keyboard navigation
- Provide screen reader compatible content
- Use semantic HTML elements
- Test with accessibility tools

## Deployment Targets

- **GitHub Pages**: Uses base path `/map-tryouts/`
- **Vercel**: Uses root path `/`
- **Development**: Local server on port 5001
- Support for custom domains with proper routing

Always follow these patterns and conventions to maintain consistency across the codebase.
