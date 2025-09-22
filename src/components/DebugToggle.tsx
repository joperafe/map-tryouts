import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/store';

export function DebugToggle() {
  const { t } = useTranslation();
  const { debugMode: debug, toggleDebugMode } = useAuth();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={toggleDebugMode}
        className={`px-4 py-2 rounded-lg shadow-lg font-medium transition-colors ${
          debug
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        title={`${debug ? t('DEBUG_DISABLE') : t('DEBUG_ENABLE')} ${t('DEBUG_MODE')}`}
      >
        🐛 {t('DEBUG_LABEL')}: {debug ? t('DEBUG_ON') : t('DEBUG_OFF')}
      </button>
    </div>
  );
};