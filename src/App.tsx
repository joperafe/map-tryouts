import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './modules/dashboard';
import { AppProviders } from './contexts';
import WiFiCoveragePage from './pages/WiFiPage';
import CockpitPage from './pages/CockpitPage';
import './utils/debugEnvironment'; // Auto-run debug in development
import './utils/testEnvironmentDetection'; // Test environment detection
import './i18n';

function App() {
  // Match the Vite base path exactly for consistency
  const basename = import.meta.env.PROD ? '/map-tryouts' : '';
  
  console.log(`🔧 App: PROD=${import.meta.env.PROD}, basename=${basename}`);
  
  return (
    <AppProviders>
      <Router basename={basename}>
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
          {/* Skip to main content link for keyboard users */}
          <a 
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded focus:m-2"
          >
            Skip to main content
          </a>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <main id="main-content" role="main">
                <Dashboard />
              </main>
            } />
            <Route path="/cockpit" element={
              <main id="main-content" role="main">
                <CockpitPage />
              </main>
            } />
            <Route path="/wifi" element={
              <main id="main-content" role="main">
                <WiFiCoveragePage />
              </main>
            } />
            <Route path="*" element={
              <main id="main-content" role="main" className="flex items-center justify-center h-full">
                <section className="text-center" role="alert" aria-live="polite">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Page Not Found</h1>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">The page you're looking for doesn't exist.</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Current path: {window.location.pathname}
                  </p>
                  <Navigate to="/dashboard" replace />
                </section>
              </main>
            } />
          </Routes>
        </div>
      </Router>
    </AppProviders>
  );
}

export default App;
