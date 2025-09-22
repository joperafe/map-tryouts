# Migration Checklist: From Individual Contexts to Unified Store

This checklist helps you migrate from the existing individual context architecture to the new unified store system.

## Pre-Migration

- [ ] **Backup current codebase** - Create a branch or backup before starting
- [ ] **Review existing context usage** - Identify all components using individual contexts
- [ ] **Test current functionality** - Ensure all features work before migration
- [ ] **Update dependencies** - Ensure React is at compatible version (16.8+ for hooks)

## Phase 1: Setup Unified Store

- [ ] **Install unified store** - Verify all files in `src/contexts/store/` are present
- [ ] **Add provider to root** - Update main App component to use `AppStoreProvider`
- [ ] **Keep old providers** - Maintain existing providers during gradual migration
- [ ] **Test store initialization** - Verify store loads without errors

### Main App Component Update

```tsx
// OLD - Multiple providers (keep temporarily)
<AppProvider>
  <ThemeProvider>
    <MapDataProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MapDataProvider>
  </ThemeProvider>
</AppProvider>

// NEW - Add unified store alongside (for gradual migration)
<AppStoreProvider>
  <AppProvider>
    <ThemeProvider>
      <MapDataProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </MapDataProvider>
    </ThemeProvider>
  </AppProvider>
</AppStoreProvider>

// FINAL - Only unified store (after complete migration)
<AppStoreProvider>
  <App />
</AppStoreProvider>
```

## Phase 2: Migrate Authentication Components

### Priority Files (High Impact)

- [ ] **`src/modules/auth/components/LoginForm.tsx`**
  - [ ] Replace `useAuth()` from AuthContext with `useAuth()` from store
  - [ ] Update login action call to return Promise
  - [ ] Test login/logout functionality

- [ ] **`src/components/layout/Header.tsx`** (if exists)
  - [ ] Replace auth context usage
  - [ ] Update user display logic
  - [ ] Test authentication state display

- [ ] **`src/components/ProtectedRoute.tsx`** (if exists)
  - [ ] Replace auth context usage
  - [ ] Test route protection

### Migration Pattern for Auth

```tsx
// OLD
import { useAuth } from '../contexts/AuthContext';

function LoginComponent() {
  const { user, login, loading } = useAuth();
  
  const handleLogin = () => {
    login(email, password); // void function
  };
}

// NEW
import { useAuth } from '../contexts/store';

function LoginComponent() {
  const { user, login, loading } = useAuth();
  
  const handleLogin = async () => {
    try {
      await login(email, password, rememberMe); // async function
      // Handle success (automatic via store)
    } catch (error) {
      // Handle error (automatic via store + notifications)
    }
  };
}
```

## Phase 3: Migrate Map Components

### Priority Files (High Impact)

- [ ] **`src/modules/dashboard/components/Dashboard.tsx`**
  - [ ] Replace map data context usage
  - [ ] Update sensor fetching logic
  - [ ] Test map rendering

- [ ] **`src/modules/dashboard/components/MapView.tsx`**
  - [ ] Replace map data context usage
  - [ ] Update layer visibility controls
  - [ ] Test interactive map features

- [ ] **`src/modules/dashboard/components/SensorsList.tsx`** (if exists)
  - [ ] Replace sensor data context usage
  - [ ] Update loading/error states
  - [ ] Test sensor display

### Migration Pattern for Map Data

```tsx
// OLD
import { useMapData } from '../contexts/MapDataContext';
import { useSensorLayers } from '../contexts/SensorLayersContext';

function MapComponent() {
  const { sensors, loading } = useMapData();
  const { layersVisible } = useSensorLayers();
  
  useEffect(() => {
    refreshSensors(); // void function
  }, []);
}

// NEW
import { useMapData } from '../contexts/store';

function MapComponent() {
  const { sensors, loading, layersVisible, refreshSensors } = useMapData();
  
  useEffect(() => {
    refreshSensors(); // async function, handles its own errors
  }, [refreshSensors]);
}
```

## Phase 4: Migrate UI Components

### Priority Files (Medium Impact)

- [ ] **`src/components/layout/Sidebar.tsx`** (if exists)
  - [ ] Replace UI context usage for sidebar state
  - [ ] Update toggle functionality
  - [ ] Test sidebar behavior

- [ ] **`src/components/common/NotificationManager.tsx`** (if exists)
  - [ ] Replace notification context usage
  - [ ] Update notification display
  - [ ] Test notification system

- [ ] **`src/components/modals/`** (all modal components)
  - [ ] Replace modal state management
  - [ ] Update show/hide logic
  - [ ] Test modal functionality

### Migration Pattern for UI State

```tsx
// OLD
import { useUI } from '../contexts/UIContext';

function SidebarComponent() {
  const { sidebarCollapsed, toggleSidebar } = useUI();
}

// NEW
import { useUI } from '../contexts/store';

function SidebarComponent() {
  const { sidebarCollapsed, setSidebarCollapsed } = useUI();
  
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);
}
```

## Phase 5: Migrate Theme Components

### Priority Files (Low Impact)

- [ ] **`src/components/layout/ThemeToggle.tsx`** (if exists)
  - [ ] Replace theme context usage
  - [ ] Update theme switching
  - [ ] Test theme changes

### Migration Pattern for Theme

```tsx
// OLD
import { useTheme } from '../contexts/ThemeContext';

function ThemeToggle() {
  const { mode, setMode } = useTheme();
}

// NEW
import { useTheme } from '../contexts/store';

function ThemeToggle() {
  const { mode, setMode } = useTheme();
  // API remains the same, just different source
}
```

## Phase 6: Update Settings Components

### Priority Files (Low Impact)

- [ ] **`src/components/settings/SettingsPanel.tsx`** (if exists)
  - [ ] Replace settings context usage
  - [ ] Update configuration options
  - [ ] Test settings persistence

### Migration Pattern for Settings

```tsx
// OLD
import { useSettings } from '../contexts/SettingsContext';

function SettingsPanel() {
  const { language, setLanguage } = useSettings();
}

// NEW
import { useSettings } from '../contexts/store';

function SettingsPanel() {
  const { language, setLanguage } = useSettings();
  // API remains the same
}
```

## Phase 7: Testing & Validation

- [ ] **Test authentication flow**
  - [ ] Login/logout functionality
  - [ ] Session persistence
  - [ ] Protected routes

- [ ] **Test map functionality**  
  - [ ] Sensor data loading
  - [ ] Layer visibility controls
  - [ ] Map interactions

- [ ] **Test UI components**
  - [ ] Sidebar toggle
  - [ ] Modal functionality
  - [ ] Notifications

- [ ] **Test theme switching**
  - [ ] Light/dark mode toggle
  - [ ] System preference detection

- [ ] **Test settings**
  - [ ] Language switching
  - [ ] Configuration persistence

## Phase 8: Cleanup

- [ ] **Remove old context files**
  - [ ] `src/contexts/AuthContext.tsx`
  - [ ] `src/contexts/MapDataContext.tsx`
  - [ ] `src/contexts/SensorLayersContext.tsx`
  - [ ] `src/contexts/UIContext.tsx`
  - [ ] `src/contexts/ThemeContext.tsx`
  - [ ] `src/contexts/SettingsContext.tsx`

- [ ] **Remove old providers**
  - [ ] Update main App component to only use `AppStoreProvider`
  - [ ] Remove provider imports

- [ ] **Update imports throughout codebase**
  - [ ] Global find/replace for context imports
  - [ ] Update to use unified store hooks

- [ ] **Clean up unused dependencies**
  - [ ] Remove unused context-related utilities
  - [ ] Update package.json if needed

## Phase 9: Performance Optimization

- [ ] **Use specific hooks**
  - [ ] Replace `useAppStore()` with domain-specific hooks
  - [ ] Use `useSensors()` instead of `useMapData()` when only sensors needed

- [ ] **Add memoization where needed**
  - [ ] Memoize expensive computations
  - [ ] Use `React.memo()` for frequently re-rendering components

- [ ] **Profile performance**
  - [ ] Use React DevTools Profiler
  - [ ] Check for unnecessary re-renders
  - [ ] Optimize component updates

## Phase 10: Documentation & Training

- [ ] **Update component documentation**
  - [ ] Document new hook usage
  - [ ] Update example code

- [ ] **Create usage examples**
  - [ ] Common patterns
  - [ ] Error handling examples
  - [ ] Performance tips

- [ ] **Train team members**
  - [ ] Review new architecture
  - [ ] Practice common tasks
  - [ ] Establish best practices

## Rollback Plan

If issues arise during migration:

1. **Keep git commits small** - Easy to revert individual changes
2. **Test incrementally** - Don't migrate everything at once  
3. **Maintain old contexts** - Keep them until migration is complete
4. **Feature flags** - Use environment variables to switch between systems

## Common Migration Issues

### Issue: "Hook must be used within Provider"
**Solution**: Ensure `AppStoreProvider` wraps your component tree

### Issue: Actions not working
**Solution**: 
- Check that you're using bound action creators from the hook
- Verify async actions are properly awaited
- Ensure reducer handles the action type

### Issue: State not updating
**Solution**:
- Verify you're using the correct hook for the state domain
- Check that the action payload is correct
- Use React DevTools to inspect state changes

### Issue: Performance regression
**Solution**:
- Use more specific hooks instead of `useAppStore()`
- Add memoization for expensive computations  
- Profile with React DevTools

### Issue: TypeScript errors
**Solution**:
- Ensure all imports are updated to unified store
- Check that action payloads match interface definitions
- Update component prop types if needed

## Success Criteria

Migration is complete when:

- [ ] All components use unified store hooks
- [ ] No references to old individual contexts remain
- [ ] All tests pass
- [ ] Performance is maintained or improved  
- [ ] No console errors or warnings
- [ ] All features work as before
- [ ] Team is comfortable with new architecture

## Estimated Timeline

- **Phase 1 (Setup)**: 1-2 hours
- **Phase 2 (Auth)**: 2-4 hours  
- **Phase 3 (Map)**: 4-6 hours
- **Phase 4 (UI)**: 2-4 hours
- **Phase 5 (Theme)**: 1-2 hours
- **Phase 6 (Settings)**: 1-2 hours
- **Phase 7 (Testing)**: 2-4 hours
- **Phase 8 (Cleanup)**: 1-2 hours
- **Phase 9 (Optimization)**: 2-3 hours
- **Phase 10 (Documentation)**: 1-2 hours

**Total Estimated Time**: 17-31 hours (depends on codebase size and complexity)

## Next Steps

1. Review this checklist with your team
2. Plan migration in phases over several sprints
3. Start with Phase 1 setup and testing
4. Migrate one domain at a time
5. Test thoroughly after each phase
6. Clean up and optimize once complete

Remember: Take your time with the migration. It's better to do it correctly in phases than to rush and introduce bugs.