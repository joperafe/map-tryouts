import { useAuth } from '../contexts/store';

export function DebugToggle() {
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
        title={`${debug ? 'Disable' : 'Enable'} debug mode`}
      >
        🐛 Debug: {debug ? 'ON' : 'OFF'}
      </button>
    </div>
  );
};