import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './modules/dashboard';
import { ThemeProvider } from './contexts/ThemeContext';
import WiFiCoveragePage from './pages/WiFiPage';
import './i18n';

function App() {
  const basename = import.meta.env.PROD ? '/map-tryouts' : '';
  
  console.log('App starting with basename:', basename, 'isProd:', import.meta.env.PROD);
  
  return (
    <ThemeProvider>
      <Router basename={basename}>
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/wifi" element={<WiFiCoveragePage />} />
            <Route path="*" element={
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Page Not Found</h1>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">The page you're looking for doesn't exist.</p>
                  <Navigate to="/dashboard" replace />
                </div>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
