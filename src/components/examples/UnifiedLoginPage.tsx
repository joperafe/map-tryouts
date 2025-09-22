import React, { useState } from 'react';
import { useAuth, useUI } from '../../contexts/store';

/**
 * Example LoginPage component using the unified store
 * 
 * Demonstrates:
 * - Using useAuth hook for authentication state and actions
 * - Using useUI hook for notifications
 * - Dispatching async actions (login) through the unified store
 * - Proper error handling and loading states
 */
export const UnifiedLoginPage: React.FC = () => {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password');
  const [rememberMe, setRememberMe] = useState(false);
  
  const { 
    isAuthenticated, 
    isLoading, 
    error, 
    login, 
    clearError 
  } = useAuth();
  
  const { addNotification } = useUI();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(email, password, rememberMe);
      addNotification({
        type: 'success',
        message: 'Successfully logged in!',
        duration: 3000,
      });
    } catch {
      addNotification({
        type: 'error',
        message: 'Login failed. Please check your credentials.',
        duration: 5000,
      });
    }
  };

  const handleErrorDismiss = () => {
    clearError();
  };

  if (isAuthenticated) {
    return (
      <div className="p-8 max-w-md mx-auto">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> You are now logged in.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-6 text-center">Login to Climate Dashboard</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={handleErrorDismiss}
                className="text-red-700 hover:text-red-900 font-bold text-lg"
              >
                ×
              </button>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2 leading-tight"
                disabled={isLoading}
              />
              <span className="text-sm text-gray-700">Remember me</span>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-sm text-gray-600">
          <p>Demo accounts:</p>
          <ul className="list-disc list-inside mt-2">
            <li>Admin: admin@example.com / password</li>
            <li>User: user@example.com / password</li>
            <li>Viewer: viewer@example.com / password</li>
          </ul>
        </div>
      </div>
    </div>
  );
};