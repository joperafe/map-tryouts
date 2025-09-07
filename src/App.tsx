import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from './modules/dashboard';
import { ThemeProvider } from './contexts/ThemeContext';
import WiFiCoveragePage from './pages/WiFiPage';
import './i18n';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/wifi" element={<WiFiCoveragePage />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
