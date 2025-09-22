# Unified Store Architecture Documentation

This document explains how the unified state management system works in the Climate App, including the purpose of each file and how they work together.

## Overview

The unified store provides centralized state management for the entire application using React Context + useReducer pattern. It replaces multiple separate contexts with a single, type-safe, domain-organized state management system.

## Architecture Files

### Core Files (8 total)

```
src/contexts/store/
├── types.ts        # TypeScript interfaces and action types
├── actions.ts      # Action creators and business logic
├── reducer.ts      # State update logic
├── utils.ts        # Shared business logic utilities
├── context.tsx     # React context definition
├── provider.tsx    # React provider component
├── hooks.ts        # Domain-specific convenience hooks
└── index.ts        # Public API exports
```

## File Purposes and Responsibilities

### 1. `types.ts` - The Foundation

**Purpose**: Defines all TypeScript interfaces, state shapes, and action types.

```typescript
// State interfaces
interface AuthState { user, isAuthenticated, loading, error, ... }
interface MapDataState { sensors, loading, errors, ... }
interface AppState { auth, mapData, ui, theme, settings, ... }

// Action types
type AuthAction = 'AUTH_LOGIN_START' | 'AUTH_LOGIN_SUCCESS' | ...
type AppAction = AuthAction | MapDataAction | UIAction | ...
```

**Why needed**: Provides type safety throughout the entire state management system.

### 2. `actions.ts` - Business Logic

**Purpose**: Contains action creators that handle business logic and async operations.

```typescript
export const authActionCreators = {
  login: (email, password) => async (dispatch) => {
    dispatch({ type: 'AUTH_LOGIN_START' });
    try {
      const result = await authService.login(email, password);
      dispatch({ type: 'AUTH_LOGIN_SUCCESS', payload: result });
    } catch (error) {
      dispatch({ type: 'AUTH_LOGIN_FAILURE', payload: error.message });
    }
  }
};
```

**Why needed**: Centralizes business logic and async operations, keeps components clean.

### 3. `reducer.ts` - State Management Logic

**Purpose**: Handles how state changes when actions are dispatched. Pure functions only.

```typescript
export function appReducer(state: AppState, action: AppAction): AppState {
  if (action.type.startsWith('AUTH_')) {
    return { ...state, auth: authReducer(state.auth, action) };
  }
  if (action.type.startsWith('MAP_DATA_')) {
    return { ...state, mapData: mapDataReducer(state.mapData, action) };
  }
  // ... handle other domains
}
```

**Why needed**: Ensures predictable state updates and immutability.

### 4. `utils.ts` - Shared Business Logic

**Purpose**: Contains reusable utilities that eliminate code duplication.

```typescript
// Generic async action helper
export const createAsyncAction = (start, success, error, operation) => {
  return async (dispatch) => {
    dispatch(start);
    try {
      const data = await operation();
      dispatch(success(data));
    } catch (err) {
      dispatch(error(err.message));
    }
  };
};

// Shared mock data
export const MOCK_USERS = { ... };

// State update utilities
export const updateLoadingState = (state, layer, loading) => ({ ... });
```

**Why needed**: Eliminates ~300 lines of duplicated code across actions and reducers.

### 5. `context.tsx` - React Context Definition

**Purpose**: Defines the React context interface without implementation.

```typescript
export interface AppStoreContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  actions: BoundActionCreators;
}

export const AppStoreContext = createContext<AppStoreContextValue | undefined>(undefined);
```

**Why needed**: Separates context definition from provider implementation for better organization.

### 6. `provider.tsx` - React Provider Component

**Purpose**: Binds everything together and provides state to the React component tree.

```typescript
export const AppStoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Bind action creators to dispatch
  const actions = useMemo(() => bindActions(actionCreators, dispatch), [state]);
  
  return (
    <AppStoreContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppStoreContext.Provider>
  );
};
```

**Why needed**: Creates the actual React provider that components consume.

### 7. `hooks.ts` - Developer Experience Layer ⭐

**Purpose**: Provides domain-specific hooks that make the unified store easy to use.

#### Without hooks.ts (bad):
```typescript
// Components would need to do this mess:
const { state, actions } = useAppStore();
const user = state.auth.user;
const sensors = state.mapData.sensors;
const loading = state.mapData.loading.sensors;
const login = actions.auth.login;
const refreshSensors = actions.mapData.refreshSensors;
```

#### With hooks.ts (clean):
```typescript
// Components can use domain-specific hooks:
const { user, login } = useAuth();
const { sensors, loading, refreshSensors } = useSensors();
```

**Available hooks**:
- `useAuth()` - Authentication state and actions
- `useMapData()` - Map data, sensors, green zones
- `useSensorLayers()` - Sensor layer management
- `useUI()` - UI state, notifications, modals
- `useTheme()` - Theme and dark mode
- `useSettings()` - App configuration
- `useSensors()` - Shorthand for just sensor data
- `useGreenZones()` - Shorthand for green zone data
- `useAirQuality()` - Shorthand for air quality data

**Why essential**: Makes the powerful unified store actually pleasant to use. Without this, every component would need to understand the internal structure of the entire app state.

### 8. `index.ts` - Public API

**Purpose**: Exports everything components need to consume the store.

```typescript
// Core exports
export { AppStoreProvider } from './provider';
export { useAuth, useMapData, useUI } from './hooks';
export type { AppState, AuthState } from './types';
```

**Why needed**: Provides a clean public interface and controls what's exported.

## How It All Works Together

### The Complete Flow:

1. **Component** calls `const { user, login } = useAuth()`
2. **hooks.ts** calls `useAppStore()` to get full context
3. **hooks.ts** extracts only `auth` state/actions and returns them
4. **Component** calls `login(email, password)`
5. **provider.tsx** receives the bound action and calls the action creator
6. **actions.ts** handles the async login process, dispatching multiple actions
7. **reducer.ts** receives each action and updates the state accordingly
8. **hooks.ts** automatically returns the new state to the component
9. **Component** re-renders with updated data

### Usage in Components:

```typescript
// In App.tsx - Setup
function App() {
  return (
    <AppStoreProvider>
      <Dashboard />
    </AppStoreProvider>
  );
}

// In Dashboard.tsx - Consume
function Dashboard() {
  const { user, login, logout } = useAuth();
  const { sensors, refreshSensors } = useSensors();
  const { notifications, addNotification } = useUI();
  
  // Use state and actions naturally
  if (!user) {
    return <LoginForm onLogin={login} />;
  }
  
  return (
    <div>
      <button onClick={logout}>Logout {user.name}</button>
      <button onClick={refreshSensors}>Refresh Data</button>
      {sensors.map(sensor => <SensorCard key={sensor.id} sensor={sensor} />)}
    </div>
  );
}
```

## Benefits of This Architecture

### ✅ **Type Safety**
Full TypeScript support throughout the entire system. No `any` types or loose interfaces.

### ✅ **Separation of Concerns**
Each file has a single, clear responsibility:
- Types define contracts
- Actions handle business logic
- Reducers handle state updates
- Hooks provide convenience
- Provider binds it together

### ✅ **Developer Experience**
Domain-specific hooks (`useAuth`, `useMapData`) are intuitive and easy to use.

### ✅ **Centralized State**
Single source of truth for all app state instead of multiple separate contexts.

### ✅ **Code Reuse**
Utils eliminate ~300 lines of duplicated code across actions and reducers.

### ✅ **Testability**
Each piece can be tested independently:
- Actions can be tested with mock dispatch
- Reducers are pure functions
- Hooks can be tested with React Testing Library

### ✅ **Scalability**
Easy to add new domains (e.g., notifications, settings) by following the same patterns.

## Migration from Old Contexts

The unified store replaces these old separate contexts:
- ❌ `MapDataContext.tsx` - Now handled by `useMapData()` hook
- ❌ `SensorLayersContext.tsx` - Now handled by `useSensorLayers()` hook  
- ❌ `AuthProvider` (if existed) - Now handled by `useAuth()` hook

### Migration example:
```typescript
// OLD WAY - Multiple contexts
const mapData = useMapData();        // From MapDataContext
const sensorLayers = useSensorLayers(); // From SensorLayersContext

// NEW WAY - Unified store
const mapData = useMapData();        // From unified store
const sensorLayers = useSensorLayers(); // From unified store
```

The hook names stay the same, but they now come from a single, unified system.

## Common Patterns

### Adding a New Feature Domain

1. **Add types** in `types.ts`:
```typescript
interface NewFeatureState { ... }
type NewFeatureAction = ...
```

2. **Add actions** in `actions.ts`:
```typescript
export const newFeatureActionCreators = { ... };
```

3. **Add reducer** in `reducer.ts`:
```typescript
function newFeatureReducer(state, action) { ... }
```

4. **Add hook** in `hooks.ts`:
```typescript
export const useNewFeature = () => { ... };
```

5. **Export** in `index.ts`:
```typescript
export { useNewFeature } from './hooks';
```

### Async Operations

All async operations follow the same pattern using utilities:

```typescript
const myAsyncAction = (): AsyncActionCreator<DataType> => {
  return createAsyncAction(
    { type: 'START' },
    (data: DataType) => ({ type: 'SUCCESS', payload: data }),
    (error: string) => ({ type: 'FAILURE', payload: error }),
    () => apiCall() // The actual async operation
  );
};
```

## Why Each File is Necessary

| File | Could Remove? | Impact |
|------|---------------|---------|
| `types.ts` | ❌ No | Lose all type safety |
| `actions.ts` | ❌ No | No way to dispatch actions |
| `reducer.ts` | ❌ No | No way to update state |
| `context.tsx` | ⚠️ Maybe | Could inline in provider, but less organized |
| `provider.tsx` | ❌ No | No way to provide state to components |
| `hooks.ts` | ⚠️ Maybe | Components would be much harder to write |
| `utils.ts` | ⚠️ Maybe | Would have ~300 lines of code duplication |
| `index.ts` | ⚠️ Maybe | Would need to import from individual files |

**Conclusion**: All files serve important purposes. The hooks and utils provide the biggest developer experience benefits and code deduplication.

## Performance Considerations

- **Memoization**: Provider uses `useMemo` to prevent unnecessary re-renders
- **Selective subscriptions**: Hooks only return relevant state slices
- **Action batching**: Multiple actions in sequence are batched automatically
- **Immutable updates**: All state updates create new objects, enabling React optimizations

## Testing Strategy

```typescript
// Test actions
const mockDispatch = jest.fn();
await authActions.login('email', 'pass')(mockDispatch);
expect(mockDispatch).toHaveBeenCalledWith({ type: 'AUTH_LOGIN_START' });

// Test reducers
const newState = authReducer(initialState, { type: 'AUTH_LOGIN_SUCCESS', payload: user });
expect(newState.user).toBe(user);

// Test hooks
const { result } = renderHook(() => useAuth(), { wrapper: AppStoreProvider });
expect(result.current.user).toBe(null);
```

This architecture provides a solid foundation for scaling the application while maintaining code quality and developer productivity.
- **Async Action Support**: Built-in thunk-style async action creators
- **Type Safety**: Full TypeScript support throughout
- **Performance Optimized**: Proper memoization and selective re-renders
- **Easy Testing**: Isolated reducers and action creators

## Architecture Components

### Core Files

```
src/contexts/store/
├── types.ts           # TypeScript interfaces for state and actions
├── reducer.ts         # Root reducer with domain-specific reducers
├── actions.ts         # Async and sync action creators
├── context.tsx        # React context definition
├── provider.tsx       # Context provider with state management
├── hooks.ts           # Domain-specific custom hooks
└── index.ts           # Public API exports
```

### State Domains

The unified store manages six main domains:

1. **Auth**: User authentication, sessions, permissions
2. **Map Data**: Sensors, green zones, air quality stations
3. **Sensor Layers**: Layer management and visualization
4. **UI**: Interface state, modals, notifications
5. **Theme**: Dark/light mode, system preferences
6. **Settings**: App configuration, user preferences

## Usage Examples

### Basic Setup

Replace your existing providers:

```tsx
// OLD - Multiple providers
<AppProvider>
  <ThemeProvider>
    <MapDataProvider>
      <SensorLayersProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </SensorLayersProvider>
    </MapDataProvider>
  </ThemeProvider>
</AppProvider>

// NEW - Unified store
import { AppStoreProvider } from './contexts/store';

<AppStoreProvider>
  <App />
</AppStoreProvider>
```

### Using Domain Hooks

```tsx
// Authentication
import { useAuth } from './contexts/store';

function LoginComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password', true);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };
  
  return (
    <div>
      {isAuthenticated ? (
        <div>Welcome {user?.name}! <button onClick={logout}>Logout</button></div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

```tsx
// Map Data
import { useMapData } from './contexts/store';

function MapComponent() {
  const { 
    sensors, 
    loading, 
    errors, 
    refreshSensors,
    setLayerVisibility 
  } = useMapData();
  
  useEffect(() => {
    refreshSensors();
  }, [refreshSensors]);
  
  if (loading.sensors) return <div>Loading sensors...</div>;
  if (errors.sensors) return <div>Error: {errors.sensors}</div>;
  
  return (
    <div>
      <h3>Sensors ({sensors.length})</h3>
      <button onClick={() => setLayerVisibility('sensors', false)}>
        Hide Sensors
      </button>
      {/* Map rendering logic */}
    </div>
  );
}
```

```tsx
// UI State and Notifications
import { useUI } from './contexts/store';

function NotificationExample() {
  const { notifications, addNotification, removeNotification } = useUI();
  
  const showSuccess = () => {
    addNotification({
      type: 'success',
      message: 'Operation completed successfully!',
      duration: 3000,
    });
  };
  
  return (
    <div>
      <button onClick={showSuccess}>Show Success</button>
      
      {notifications.map(notification => (
        <div key={notification.id} className="notification">
          {notification.message}
          <button onClick={() => removeNotification(notification.id)}>×</button>
        </div>
      ))}
    </div>
  );
}
```

### Async Actions in Components

The store handles async operations with proper loading/error states:

```tsx
import { useSensors } from './contexts/store';

function SensorsList() {
  const { sensors, loading, error, refresh } = useSensors();
  
  const handleRefresh = async () => {
    try {
      await refresh(); // This dispatches the async action
      // Success state is handled automatically
    } catch (err) {
      // Error state is handled automatically
      console.error('Failed to refresh:', err);
    }
  };
  
  return (
    <div>
      <button onClick={handleRefresh} disabled={loading}>
        {loading ? 'Refreshing...' : 'Refresh Sensors'}
      </button>
      
      {error && <div className="error">{error}</div>}
      
      {sensors.map(sensor => (
        <div key={sensor.id}>{sensor.name}</div>
      ))}
    </div>
  );
}
```

## Available Hooks

### Core Hooks

- `useAppStore()`: Access to complete store (use sparingly)
- `useAuth()`: Authentication state and actions
- `useMapData()`: Map data (sensors, green zones, air quality)
- `useSensorLayers()`: Sensor layer management
- `useUI()`: UI state, notifications, modals
- `useTheme()`: Theme management
- `useSettings()`: App settings and configuration

### Convenience Hooks

- `useSensors()`: Quick access to sensor data only
- `useGreenZones()`: Quick access to green zones only
- `useAirQuality()`: Quick access to air quality data only

## State Structure

```typescript
interface AppState {
  auth: {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    sessionExpiry: Date | null;
    rememberMe: boolean;
    lastActivity: Date | null;
    debugMode: boolean;
  };
  
  mapData: {
    sensors: Sensor[];
    greenZones: GreenZone[];
    airQualityStations: AirQualityStation[];
    loading: { sensors: boolean; greenZones: boolean; airQuality: boolean; general: boolean };
    errors: { sensors: string | null; greenZones: string | null; airQuality: string | null };
    lastUpdated: { sensors: Date | null; greenZones: Date | null; airQuality: Date | null };
    layersVisible: { sensors: boolean; greenZones: boolean; airQuality: boolean; heatmap: boolean };
    currentBaseMap: string;
  };
  
  sensorLayers: {
    layers: Record<string, SensorLayerData>;
    collapsedSidebar: boolean;
  };
  
  ui: {
    sidebarCollapsed: boolean;
    fullscreenMode: boolean;
    debugPanelVisible: boolean;
    drawingMode: boolean;
    measurementMode: boolean;
    addSensorMode: boolean;
    selectedPosition: [number, number] | null;
    globalLoading: boolean;
    notifications: Notification[];
  };
  
  theme: {
    mode: 'light' | 'dark' | 'system';
    systemPreference: 'light' | 'dark';
    customColors?: Record<string, string>;
  };
  
  settings: {
    language: string;
    environment: 'DEV' | 'INT' | 'PROD';
    debugEnabled: boolean;
    autoRefreshInterval: number;
    mapDefaultZoom: number;
    mapDefaultCenter: [number, number];
    temperatureUnit: 'celsius' | 'fahrenheit';
    showTooltips: boolean;
  };
}
```

## Action Patterns

### Sync Actions

```typescript
// Simple state updates
actions.ui.setSidebarCollapsed(true);
actions.theme.setMode('dark');
actions.settings.setLanguage('pt');
```

### Async Actions (Thunks)

```typescript
// API calls with loading/error handling
await actions.auth.login('user@example.com', 'password', true);
await actions.mapData.refreshSensors();
await actions.mapData.refreshAllLayers();
```

### Action Creators Structure

All action creators are organized by domain:

```typescript
const actions = {
  auth: { login, logout, refreshToken, ... },
  mapData: { refreshSensors, setLayerVisibility, ... },
  sensorLayers: { setSensorLayer, setLayerLoading, ... },
  ui: { addNotification, setDrawingMode, ... },
  theme: { setMode, setCustomColors, ... },
  settings: { setLanguage, loadSettings, ... },
};
```

## Migration Guide

### From Individual Contexts

1. **Replace Provider Setup**:
   ```tsx
   // Remove old providers
   // <AuthProvider>, <MapDataProvider>, <ThemeProvider>, etc.
   
   // Add unified provider
   <AppStoreProvider>
     <App />
   </AppStoreProvider>
   ```

2. **Update Hook Usage**:
   ```tsx
   // OLD
   import { useData } from './contexts/DataContext';
   import { useAuth } from './contexts/AuthContext';
   const { sensors } = useData();
   const { user } = useAuth();
   
   // NEW
   import { useMapData, useAuth } from './contexts/store';
   const { sensors } = useMapData();
   const { user } = useAuth();
   ```

3. **Replace Action Calls**:
   ```tsx
   // OLD
   const { refreshSensors } = useData();
   refreshSensors(); // void function
   
   // NEW
   const { refreshSensors } = useMapData();
   await refreshSensors(); // returns Promise
   ```

### Gradual Migration Strategy

You can migrate gradually by keeping both old and new systems:

1. Add `AppStoreProvider` alongside existing providers
2. Start using unified hooks in new components
3. Migrate existing components one by one
4. Remove old providers when migration is complete

## Performance Considerations

### Optimizations Built-in

- **Selective Subscriptions**: Hooks only subscribe to relevant state slices
- **Memoized Context**: Context value is memoized to prevent unnecessary re-renders  
- **Bound Actions**: Action creators are bound once and memoized
- **State Partitioning**: State is split by domain to minimize update impact

### Best Practices

1. **Use Specific Hooks**: Prefer `useSensors()` over `useMapData()` when you only need sensors
2. **Memoize Selectors**: Use `useMemo()` for expensive computed values
3. **Batch Updates**: The store automatically batches related updates
4. **Avoid useAppStore()**: Only use when you need multiple domains

## Testing

### Testing Reducers

```typescript
import { appReducer, initialAppState } from './reducer';

test('should handle sensor loading', () => {
  const action = { type: 'MAP_DATA_SET_LOADING', payload: { layer: 'sensors', loading: true } };
  const state = appReducer(initialAppState, action);
  
  expect(state.mapData.loading.sensors).toBe(true);
});
```

### Testing Components

```tsx
import { render } from '@testing-library/react';
import { AppStoreProvider } from './contexts/store';

function renderWithStore(component, initialState = {}) {
  return render(
    <AppStoreProvider initialState={initialState}>
      {component}
    </AppStoreProvider>
  );
}

test('should display user name when authenticated', () => {
  const { getByText } = renderWithStore(
    <MyComponent />,
    {
      auth: {
        isAuthenticated: true,
        user: { name: 'John Doe' }
      }
    }
  );
  
  expect(getByText('Welcome John Doe!')).toBeInTheDocument();
});
```

### Testing Actions

```typescript
import { authActionCreators } from './actions';

test('should create login action', async () => {
  const dispatch = jest.fn();
  const getState = () => initialAppState;
  
  const loginAction = authActionCreators.login('user@example.com', 'password');
  await loginAction(dispatch, getState);
  
  expect(dispatch).toHaveBeenCalledWith({ type: 'AUTH_LOGIN_START' });
});
```

## Advanced Usage

### Custom Action Creators

You can create additional action creators for specific use cases:

```typescript
// Custom composite action
const fetchDashboardData = (): AsyncActionCreator => {
  return async (dispatch, getState) => {
    dispatch({ type: 'UI_SET_GLOBAL_LOADING', payload: true });
    
    try {
      await Promise.all([
        dispatch(mapDataActionCreators.refreshSensors()),
        dispatch(mapDataActionCreators.refreshGreenZones()),
        dispatch(mapDataActionCreators.refreshAirQuality()),
      ]);
      
      dispatch(uiActionCreators.addNotification({
        type: 'success',
        message: 'Dashboard data loaded successfully',
      }));
    } catch (error) {
      dispatch(uiActionCreators.addNotification({
        type: 'error',
        message: 'Failed to load dashboard data',
      }));
    } finally {
      dispatch({ type: 'UI_SET_GLOBAL_LOADING', payload: false });
    }
  };
};
```

### Middleware Integration

The store can be extended with middleware for logging, persistence, etc:

```typescript
// Add to provider
const [state, dispatch] = useReducer(
  loggingMiddleware(appReducer), // Wrap reducer with middleware
  initialAppState
);
```

## Troubleshooting

### Common Issues

1. **"useAppStore must be used within AppStoreProvider"**
   - Ensure `AppStoreProvider` wraps your component tree

2. **Actions not updating state**
   - Check that action creators return proper action objects
   - Verify reducer handles the action type

3. **Performance issues**
   - Use specific hooks instead of `useAppStore()`
   - Memoize expensive computations
   - Check for unnecessary re-renders

4. **TypeScript errors**
   - Ensure all action payloads match interface definitions
   - Use type assertions carefully

### Debug Mode

The store includes built-in debug capabilities:

```typescript
const { debugMode, toggleDebugMode } = useAuth();

// Enable debug logging
toggleDebugMode(); // Logs all actions and state changes
```

## Benefits

### Before (Multiple Contexts)

- Prop drilling between contexts
- Complex provider nesting  
- Inconsistent loading states
- Scattered action logic
- Difficult to test
- Performance issues with deep updates

### After (Unified Store)

- Single source of truth
- Clean, typed API
- Consistent async patterns
- Easy testing and debugging
- Optimized performance
- Scalable architecture

The Unified Store Architecture provides a robust foundation for complex React applications while maintaining simplicity and excellent developer experience.