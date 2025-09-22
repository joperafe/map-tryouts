#!/usr/bin/env node

/**
 * Push Validation Script
 * 
 * Runs comprehensive checks before allowing a push to proceed:
 * - TypeScript compilation
 * - ESLint checks
 * - Jest tests
 * - Production build
 * 
 * Usage:
 * - node scripts/validate-push.js (full validation)
 * - Use --no-verify with git push to bypass all checks
 */

const { execSync } = require('child_process');
const chalk = require('chalk');

// ANSI color codes (fallback if chalk is not available)
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  const colorCode = colors[color] || colors.reset;
  console.log(`${colorCode}${message}${colors.reset}`);
}

function logStep(step, message) {
  log(`\n${colors.bold}[${step}/4] ${message}${colors.reset}`, 'blue');
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function runCommand(command, description) {
  try {
    log(`Running: ${command}`, 'blue');
    execSync(command, { 
      stdio: 'pipe',
      encoding: 'utf8'
    });
    logSuccess(`${description} passed`);
    return true;
  } catch (error) {
    logError(`${description} failed`);
    
    // Show the actual error output
    if (error.stdout) {
      console.log('\n--- STDOUT ---');
      console.log(error.stdout);
    }
    if (error.stderr) {
      console.log('\n--- STDERR ---');
      console.log(error.stderr);
    }
    
    return false;
  }
}

function main() {
  log('\n🚀 Running pre-push validation checks...', 'bold');
  
  const checks = [
    {
      step: 1,
      command: 'npx tsc --noEmit',
      description: 'TypeScript compilation',
      name: 'TypeScript'
    },
    {
      step: 2,
      command: 'npm run lint',
      description: 'ESLint checks',
      name: 'Linting'
    },
    {
      step: 3,
      command: 'npm test -- --passWithNoTests',
      description: 'Jest tests',
      name: 'Tests'
    },
    {
      step: 4,
      command: 'npm run build',
      description: 'Production build',
      name: 'Build'
    }
  ];

  let allPassed = true;
  
  for (const check of checks) {
    logStep(check.step, check.description);
    
    const passed = runCommand(check.command, check.name);
    if (!passed) {
      allPassed = false;
      break; // Stop on first failure
    }
  }

  if (allPassed) {
    log('\n🎉 All validation checks passed! Push can proceed.', 'green');
    log('✨ Your code is ready for production!', 'green');
    process.exit(0);
  } else {
    log('\n💥 Validation failed! Push has been blocked.', 'red');
    log('\n📝 To fix this:', 'yellow');
    log('   1. Fix the failing check above', 'yellow');
    log('   2. Commit your fixes', 'yellow');
    log('   3. Try pushing again', 'yellow');
    log('\n🚨 To bypass these checks (NOT RECOMMENDED):', 'yellow');
    log('   git push --no-verify', 'yellow');
    log('   OR use: npm run push:unsafe', 'yellow');
    
    process.exit(1);
  }
}

// Handle process interruption gracefully
process.on('SIGINT', () => {
  log('\n\n⏹️  Validation interrupted by user', 'yellow');
  process.exit(1);
});

process.on('SIGTERM', () => {
  log('\n\n⏹️  Validation terminated', 'yellow');
  process.exit(1);
});

main();