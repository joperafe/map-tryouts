import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from './ThemeToggle';
import { LocaleSelector } from './LocaleSelector';

export function Navigation() {
  const location = useLocation();
  const { t } = useTranslation();

  const navItems = [
    { path: '/dashboard', label: t('NAVIGATION_CLIMATE_DASHBOARD'), icon: '🌡️' },
    { path: '/cockpit', label: t('NAVIGATION_COCKPIT'), icon: '🚁' },
    { path: '/wifi', label: t('NAVIGATION_WIFI_COVERAGE'), icon: '📶' }
  ];

  return (
    <header role="banner">
      <nav 
        className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Link 
                  to="/dashboard" 
                  className="text-xl font-bold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
                  aria-label="Climate App - Go to dashboard"
                >
                  🌍 Climate App
                </Link>
              </div>

              {/* Navigation Links */}
              <ul className="hidden md:flex space-x-8" role="menubar">
                {navItems.map((item) => (
                  <li key={item.path} role="none">
                    <Link
                      to={item.path}
                      role="menuitem"
                      aria-current={location.pathname === item.path ? 'page' : undefined}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 ${
                        location.pathname === item.path
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <span className="mr-2" aria-hidden="true">{item.icon}</span>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right side - Locale Selector and Theme Toggle */}
            <div className="flex items-center space-x-4" role="toolbar" aria-label="User preferences">
              <LocaleSelector />
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden" role="region" aria-label="Mobile navigation">
            <ul className="pt-2 pb-3 space-y-1" role="menu">
              {navItems.map((item) => (
                <li key={item.path} role="none">
                  <Link
                    to={item.path}
                    role="menuitem"
                    aria-current={location.pathname === item.path ? 'page' : undefined}
                    className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-800 ${
                      location.pathname === item.path
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <span className="mr-2" aria-hidden="true">{item.icon}</span>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navigation;
