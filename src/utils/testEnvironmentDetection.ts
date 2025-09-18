/**
 * Simple test script to verify environment detection
 */
import { detectRuntimeEnvironment } from './environmentDetector';

// Mock different URL scenarios
const testCases = [
  { url: 'http://localhost:3000/', expected: 'DEV' },
  { url: 'http://localhost:3000/?env=dev', expected: 'DEV' },
  { url: 'http://localhost:3000/?env=staging', expected: 'STAGING' },
  { url: 'https://joperafe.github.io/map-tryouts/', expected: 'PROD' },
  { url: 'https://joperafe.github.io/map-tryouts/?env=dev', expected: 'DEV' },
  { url: 'https://joperafe.github.io/map-tryouts/?env=staging', expected: 'STAGING' },
];

export function testEnvironmentDetection() {
  console.group('🧪 Environment Detection Test');
  
  testCases.forEach(({ url, expected }) => {
    // Mock window.location
    const mockLocation = new URL(url);
    
    // Temporarily replace window.location.search
    const originalSearch = window.location.search;
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        search: mockLocation.search,
        href: url,
      },
      writable: true,
    });
    
    const result = detectRuntimeEnvironment();
    const passed = result === expected;
    
    console.log(
      `${passed ? '✅' : '❌'} URL: ${url} | Expected: ${expected} | Got: ${result}`
    );
    
    // Restore original search
    Object.defineProperty(window, 'location', {
      value: {
        ...window.location,
        search: originalSearch,
      },
      writable: true,
    });
  });
  
  console.groupEnd();
}

// Run test in development
if (import.meta.env.DEV) {
  // Run after a delay to ensure everything is loaded
  setTimeout(() => {
    testEnvironmentDetection();
  }, 1000);
}