# Auto-merge System: Main → Release

This repository includes an automated system to keep the `release` branch synchronized with `main`.

## 🤖 How It Works

### Automatic Merge (Smart)
- **Trigger**: Every push to `main` branch
- **Process**:
  1. ✅ Run all tests and linting
  2. 🔍 Check for merge conflicts
  3. 🚀 **If no conflicts**: Direct merge to `release`
  4. ⚠️ **If conflicts**: Create PR for manual resolution

### Manual Sync (Fallback)
- **Trigger**: Manual workflow dispatch
- **Options**:
  - Force merge (even with conflicts)
  - Skip tests (emergency use)

## 📋 Workflow Details

### Smart Auto-merge (`auto-merge-main-to-release.yml`)

**Success Path:**
```
Push to main → Tests Pass → No Conflicts → Direct Merge → ✅ Done
```

**Conflict Path:**
```
Push to main → Tests Pass → Conflicts Found → Create PR → 👤 Manual Resolution
```

**Quality Gates:**
- ✅ `npm run test:ci` must pass
- ✅ `npm run lint` must pass  
- ✅ `npm run build` must succeed
- 🔍 Merge conflict detection

### Manual Sync (`manual-sync-main-to-release.yml`)

Use this when:
- Auto-merge failed
- You want to sync immediately
- Emergency situations

**Usage:**
1. Go to Actions → Manual sync main to release
2. Click "Run workflow"
3. Choose options:
   - `force_merge`: Merge even with conflicts (⚠️ risky)
   - `skip_tests`: Skip quality checks (🚨 emergency only)

## 🚨 When Conflicts Occur

### Auto-created PR includes:
- 📋 List of conflicting files
- 📝 Step-by-step resolution guide
- 🏷️ Automatic labels: `automerge-conflict`, `needs-resolution`

### Resolution steps:
```bash
# 1. Fetch the conflict resolution branch
git fetch origin
git checkout auto-merge/main-to-release-[NUMBER]

# 2. Merge and resolve conflicts
git merge main
# Fix conflicts in your editor
git add .
git commit -m "resolve: merge conflicts from main to release"

# 3. Push resolution
git push origin auto-merge/main-to-release-[NUMBER]

# 4. Merge the PR on GitHub
```

## 🔧 Configuration

### Required Permissions
The workflow needs these permissions:
- `contents: write` - To push to branches
- `pull-requests: write` - To create conflict PRs
- `issues: write` - To create failure notifications

### Branch Protection
Recommended settings for `release` branch:
- ✅ Require pull request reviews (for conflict PRs)
- ✅ Require status checks to pass
- ✅ Include administrators
- ✅ Allow auto-merge

### Repository Secrets
Uses default `GITHUB_TOKEN` - no additional secrets needed.

## 📊 Monitoring

### Workflow Status
- ✅ **Success**: Direct merge completed
- ⚠️ **Action Required**: PR created for conflicts
- ❌ **Failed**: Check workflow logs

### Notifications
- 📧 GitHub notifications for created PRs
- 🚨 Issues created if critical failures occur
- 📱 Standard GitHub Actions status updates

## 🛠️ Troubleshooting

### Common Issues

**1. Workflow not triggering**
- Check branch protection settings
- Verify workflow file syntax
- Ensure permissions are correct

**2. Tests failing**
- Fix tests on `main` branch first
- Auto-merge will resume once tests pass

**3. Persistent conflicts**
- Use manual sync with force merge
- Consider restructuring branches

**4. PR creation failing**
- Check repository permissions
- Verify GITHUB_TOKEN has required scopes

### Emergency Procedures

**Skip auto-merge temporarily:**
```bash
# Disable workflow
mv .github/workflows/auto-merge-main-to-release.yml .github/workflows/auto-merge-main-to-release.yml.disabled
git commit -m "chore: temporarily disable auto-merge"
```

**Manual merge as fallback:**
```bash
git checkout release
git pull origin release  
git merge main
# Resolve conflicts if any
git push origin release
```

## 📈 Benefits

- ✅ **Automated synchronization** between main and release
- 🛡️ **Quality gates** prevent broken code from reaching release
- 🔍 **Conflict detection** with guided resolution
- 📱 **Zero-config** operation for clean merges
- 🚨 **Fallback options** for edge cases
- 📋 **Audit trail** through PRs and commit messages

## 🎯 Best Practices

1. **Keep main stable** - Auto-merge depends on passing tests
2. **Review conflict PRs quickly** - Don't let them accumulate  
3. **Monitor workflow status** - Check Actions tab regularly
4. **Test the system** - Use manual sync to verify setup
5. **Document exceptions** - Note when manual intervention was needed