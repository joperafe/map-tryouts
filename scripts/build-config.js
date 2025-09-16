#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get environment from command line args or default to 'DEV'
const environment = process.argv[2] || process.env.NODE_ENV || 'DEV';
const envMap = {
  'development': 'DEV',
  'integration': 'INT', 
  'production': 'PROD',
  'DEV': 'DEV',
  'INT': 'INT',
  'PROD': 'PROD'
};

const targetEnv = envMap[environment] || 'DEV';

console.log(`🔧 Building configuration for environment: ${targetEnv}`);

// Paths
const rootDir = path.resolve(__dirname, '..');
const configDir = path.join(rootDir, 'src', 'config', 'settings');
const publicDir = path.join(rootDir, 'public');
const distDir = path.join(rootDir, 'dist');

// Load default configuration
const defaultConfigPath = path.join(configDir, 'configs', 'default.settings.json');
const environmentConfigPath = path.join(configDir, 'environments', `${targetEnv.toLowerCase()}.settings.json`);

try {
  // Read configurations
  console.log(`📖 Reading default config from: ${defaultConfigPath}`);
  const defaultConfig = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'));
  
  console.log(`📖 Reading environment config from: ${environmentConfigPath}`);
  const environmentConfig = JSON.parse(fs.readFileSync(environmentConfigPath, 'utf8'));
  
  // Deep merge function
  function deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }
  
  // Merge configurations
  const mergedConfig = deepMerge(defaultConfig, environmentConfig);
  
  // Add build metadata
  mergedConfig.BUILD_INFO = {
    timestamp: new Date().toISOString(),
    environment: targetEnv,
    version: defaultConfig.APPLICATION?.version || '1.0.0',
    build_id: `${targetEnv}-${Date.now()}`
  };
  
  // Write configuration files based on environment
  const activeConfigContent = JSON.stringify(mergedConfig, null, 2);
  
  // Always write to src for TypeScript imports
  const srcConfigPath = path.join(configDir, 'active.settings.json');
  fs.writeFileSync(srcConfigPath, activeConfigContent);
  console.log(`✅ Generated config for TypeScript imports: ${srcConfigPath}`);
  
  if (targetEnv === 'DEV') {
    // For development: write to public (for dev server)
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    const publicConfigPath = path.join(publicDir, 'active.settings.json');
    fs.writeFileSync(publicConfigPath, activeConfigContent);
    console.log(`✅ Generated config for dev server: ${publicConfigPath}`);
    
  } else {
    // For INT/PROD: write to both dist (for production build) and public (for runtime access)
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    const distConfigPath = path.join(distDir, 'active.settings.json');
    fs.writeFileSync(distConfigPath, activeConfigContent);
    console.log(`✅ Generated config for production build: ${distConfigPath}`);
    
    const publicConfigPath = path.join(publicDir, 'active.settings.json');
    fs.writeFileSync(publicConfigPath, activeConfigContent);
    console.log(`✅ Generated config for runtime access: ${publicConfigPath}`);
  }
  
  console.log(`🎉 Configuration build complete for ${targetEnv} environment!`);
  
} catch (error) {
  console.error('❌ Error building configuration:', error.message);
  process.exit(1);
}
