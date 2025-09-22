# Push Safety Workflow

This document explains the push safety safeguards implemented to prevent broken code from being pushed to the repository.

## Overview

The project now includes automatic validation checks that run before every push to ensure code quality and prevent breaking changes from entering the main branch.

## How It Works

### Automatic Validation (Pre-push Hook)

Every time you run `git push`, the following checks are automatically executed:

1. **TypeScript Compilation** - Ensures no type errors exist
2. **ESLint Checks** - Validates code style and catches potential issues  
3. **Jest Tests** - Runs all tests to ensure functionality works
4. **Production Build** - Verifies the app builds successfully for production

If any check fails, the push is **blocked** and you'll see detailed error information.

### Validation Checks Details

#### 1. TypeScript Compilation
```bash
npx tsc --noEmit
```
- Checks for type errors across the entire codebase
- Does not emit files, only validates types
- Must pass with zero errors

#### 2. ESLint Checks  
```bash
npm run lint
```
- Validates code style and quality
- Catches potential bugs and anti-patterns
- Must pass with zero errors or warnings

#### 3. Jest Tests
```bash
npm test -- --passWithNoTests
```
- Runs all unit and integration tests
- Uses `--passWithNoTests` to handle cases where no tests exist
- All tests must pass

#### 4. Production Build
```bash
npm run build
```
- Builds the application for production
- Includes TypeScript compilation and Vite bundling
- Must complete successfully without errors

## Available Commands

### Safe Push Commands (Recommended)

These commands run validation before pushing:

```bash
# Manual validation (without pushing)
npm run validate

# Push with validation to current branch
npm run push

# Push with validation to origin
npm run push:origin  

# Push with validation to origin/main
npm run push:main
```

### Standard Git Push

```bash
# This now automatically runs validation
git push
git push origin
git push origin main
```

### Unsafe Push Commands (Emergency Only)

⚠️ **Use these only in emergencies** - they bypass all safety checks:

```bash
# Bypass validation scripts
npm run push:unsafe
npm run push:unsafe:origin
npm run push:unsafe:main

# Bypass with git directly
git push --no-verify
git push origin --no-verify  
git push origin main --no-verify
```

## Workflow Examples

### Normal Development Workflow ✅

```bash
# Make your changes
git add .
git commit -m "feat: add new feature"

# Push with automatic validation
git push origin main
```

The push will proceed only if all validation checks pass.

### When Validation Fails ❌

```bash
git push origin main

# Output:
# 🔍 Pre-push validation starting...
# [1/4] TypeScript compilation
# ❌ TypeScript failed
# 💥 Validation failed! Push has been blocked.
```

**What to do:**
1. Fix the failing check (TypeScript errors in this case)
2. Commit your fixes
3. Try pushing again

### Emergency Push (Not Recommended) 🚨

If you absolutely need to push without running checks:

```bash
# Only use in emergencies!
npm run push:unsafe:main
```

## Configuration

### Modifying Validation Checks

Edit `scripts/validate-push.cjs` to:
- Add new validation steps
- Modify existing checks
- Change error handling

### Disabling Validation

To temporarily disable pre-push validation:

```bash
# Rename the hook to disable it
mv .husky/pre-push .husky/pre-push.disabled

# Re-enable later
mv .husky/pre-push.disabled .husky/pre-push
```

## Troubleshooting

### Hook Not Running

If the pre-push hook isn't running:

```bash
# Reinstall husky
npm run prepare

# Check hook permissions (Linux/Mac)
chmod +x .husky/pre-push
```

### Validation Script Errors

If `scripts/validate-push.cjs` fails to run:

```bash
# Check Node.js version (requires Node 14+)
node --version

# Verify script exists and is executable
ls -la scripts/validate-push.cjs
```

### CI/CD Integration

For continuous integration, use the same validation:

```yaml
# GitHub Actions example
- name: Run Validation
  run: npm run validate
```

## Best Practices

1. **Always use safe push commands** - Let validation catch issues early
2. **Fix validation failures promptly** - Don't bypass checks unless absolutely necessary  
3. **Run `npm run validate` locally** - Before committing, ensure everything passes
4. **Keep tests up to date** - Add tests for new features to maintain coverage
5. **Monitor build times** - If validation becomes too slow, optimize the checks

## Benefits

- **Prevents broken builds** on the main branch
- **Catches issues early** before they reach production
- **Enforces code quality** consistently across the team
- **Reduces debugging time** by catching problems locally
- **Maintains type safety** and test coverage

## Emergency Procedures

If you're in a critical situation and must push despite failing checks:

1. **Document the reason** in your commit message
2. **Use unsafe push** with clear justification  
3. **Create a follow-up ticket** to fix the underlying issues
4. **Notify the team** about the bypass and reason

Remember: The safeguards are there to help maintain code quality and prevent production issues. Use the bypass options responsibly!