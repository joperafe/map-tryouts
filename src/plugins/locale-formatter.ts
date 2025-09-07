import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

interface LocaleFormatterOptions {
  localesDir?: string;
  spacing?: boolean;
  alphabeticalSort?: boolean;
}

export function localeFormatter(options: LocaleFormatterOptions = {}): Plugin {
  const { localesDir = 'src/locales', spacing = true, alphabeticalSort = true } = options;

  return {
    name: 'locale-formatter',
    buildStart() {
      if (!spacing && !alphabeticalSort) return;

      // Get all locale files
      const localesPath = path.resolve(localesDir);
      if (!fs.existsSync(localesPath)) {
        console.warn(`Locales directory not found: ${localesPath}`);
        return;
      }

      const localeFiles = fs.readdirSync(localesPath)
        .filter(file => file.endsWith('.json'))
        .map(file => path.join(localesPath, file));

      // Format each locale file
      for (const filePath of localeFiles) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const localeData = JSON.parse(content);
          const formattedContent = formatLocaleWithSpacing(localeData, { spacing, alphabeticalSort });
          
          // Only write if content has changed
          if (content.trim() !== formattedContent.trim()) {
            fs.writeFileSync(filePath, formattedContent, 'utf-8');
            console.log(`✅ Formatted locale file: ${path.basename(filePath)}`);
          }
        } catch (error) {
          console.error(`❌ Error formatting locale file ${filePath}:`, error);
        }
      }
    }
  };
}

function formatLocaleWithSpacing(
  localeData: Record<string, string>, 
  options: { spacing: boolean; alphabeticalSort: boolean }
): string {
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

// Export standalone function for manual use
export { formatLocaleWithSpacing };
