#!/usr/bin/env node

/**
 * Manual locale formatter script
 * Run this to format locale files with alphabetical spacing
 * Usage: node scripts/format-locales.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function formatLocaleWithSpacing(localeData, options = { spacing: true, alphabeticalSort: true }) {
  let keys = Object.keys(localeData);
  
  if (options.alphabeticalSort) {
    keys = keys.sort();
  }
  
  if (keys.length === 0) {
    return '{}';
  }

  let result = '{\n';
  let lastInitialLetter = '';
  
  keys.forEach((key, index) => {
    const currentInitialLetter = key.charAt(0).toLowerCase();
    
    // Add spacing when initial letter changes (if spacing is enabled)
    if (options.spacing && lastInitialLetter && currentInitialLetter !== lastInitialLetter) {
      result += '\n';
    }
    
    // Add the key-value pair
    const value = localeData[key];
    const escapedValue = JSON.stringify(value);
    result += `  "${key}": ${escapedValue}`;
    
    // Add comma if not the last item
    if (index < keys.length - 1) {
      result += ',';
    }
    
    result += '\n';
    lastInitialLetter = currentInitialLetter;
  });
  
  result += '}';
  return result;
}

function formatLocaleFiles() {
  const localesDir = path.resolve(__dirname, '../src/locales');
  
  if (!fs.existsSync(localesDir)) {
    console.error(`❌ Locales directory not found: ${localesDir}`);
    process.exit(1);
  }

  const localeFiles = fs.readdirSync(localesDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(localesDir, file));

  console.log('🚀 Formatting locale files...\n');

  for (const filePath of localeFiles) {
    try {
      const originalContent = fs.readFileSync(filePath, 'utf-8');
      const localeData = JSON.parse(originalContent);
      const formattedContent = formatLocaleWithSpacing(localeData, {
        spacing: true,
        alphabeticalSort: true
      });
      
      // Only write if content has changed
      if (originalContent.trim() !== formattedContent.trim()) {
        fs.writeFileSync(filePath, formattedContent, 'utf-8');
        console.log(`✅ Formatted: ${path.basename(filePath)}`);
      } else {
        console.log(`✨ Already formatted: ${path.basename(filePath)}`);
      }
    } catch (error) {
      console.error(`❌ Error formatting ${path.basename(filePath)}:`, error.message);
    }
  }

  console.log('\n🎉 Locale formatting complete!');
}

// Run the formatter
formatLocaleFiles();
