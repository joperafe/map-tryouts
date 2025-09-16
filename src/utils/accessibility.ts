import React from 'react';

// Initialize axe-core for accessibility testing in development
if (import.meta.env.DEV) {
  const initializeAxe = async () => {
    try {
      const axe = await import('@axe-core/react');
      axe.default(React, window.ReactDOM, 1000, {});
      console.log('🔍 Accessibility testing enabled - Check console for violations');
    } catch (error) {
      console.error('Failed to initialize axe-core:', error);
    }
  };

  initializeAxe();
}