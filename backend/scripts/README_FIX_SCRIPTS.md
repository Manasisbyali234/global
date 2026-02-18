# Candidate Registration Fix Scripts

This directory contains scripts to fix the E11000 duplicate key error for candidateId.

## Quick Start

### For Production Deployment:

```bash
# 1. Check if system is ready
node scripts/preDeploymentCheck.js

# 2. If issues found, run automated fix
node scripts/deployFix.js

# 3. Verify fix was successful
node scripts/preDeploymentCheck.js
```

## Available Scripts

### 1. preDeploymentCheck.js ⭐ (Start Here)
**Purpose**: Comprehensive pre-deployment readiness check

**What it checks**:
- Environment variables
- Database connection
- Null candidateId records
- Index configuration
- Model and controller files
- Database statistics
- Recent registrations

**Usage**:
```bash
node scripts/preDeploymentCheck.js
```

**When to use**: Before any deployment to verify system readiness

---

### 2. deployFix.js ⭐ (Automated Fix)
**Purpose**: Interactive automated fix for the duplicate key error

**What it does**:
- Checks current database state
- Removes null candidateId records (with confirmation)
- Fixes indexes
- Verifies the fix
- Provides summary and next steps

**Usage**:
```bash
node scripts/deployFix.js
```

**When to use**: When preDeploymentCheck.js shows issues

---

### 3. fixNullCandidateIds.js
**Purpose**: Clean up null candidateId records and fix indexes

**What it does**:
- Finds and deletes profiles with null candidateId
- Drops old indexes
- Creates proper unique index
- Identifies orphaned profiles
- Provides detailed reporting

**Usage**:
```bash
node scripts/fixNullCandidateIds.js
```

**When to use**: Manual cleanup of null records

---

### 4. verifyCandidateSetup.js
**Purpose**: Detailed verification of candidate registration system

**What it checks**:
- Environment variables
- Database connection
- Null candidateId records
- Index configuration
- Orphaned profiles
- Database statistics
- Recent registrations

**Usage**:
```bash
node scripts/verifyCandidateSetup.js
```

**When to use**: After fixes to verify everything is working

---

### 5. createIndexes.js
**Purpose**: Create or update all database indexes

**What it does**:
- Creates indexes for all collections
- Handles candidateId unique index specially
- Drops old non-unique indexes
- Creates new unique indexes

**Usage**:
```bash
node scripts/createIndexes.js
```

**When to use**: Initial setup or after index changes

---

## Recommended Workflow

### First Time Setup:
```bash
1. node scripts/preDeploymentCheck.js    # Check current state
2. node scripts/deployFix.js             # Fix any issues
3. node scripts/preDeploymentCheck.js    # Verify fix
```

### Regular Deployment:
```bash
1. node scripts/preDeploymentCheck.js    # Always check first
2. Deploy code if checks pass
3. node scripts/verifyCandidateSetup.js  # Verify after deployment
```

### Troubleshooting:
```bash
1. node scripts/verifyCandidateSetup.js  # Detailed diagnostics
2. node scripts/fixNullCandidateIds.js   # Fix specific issues
3. node scripts/createIndexes.js         # Fix indexes
4. node scripts/verifyCandidateSetup.js  # Verify fix
```

## Script Comparison

| Script | Interactive | Fixes Issues | Detailed Report | Use Case |
|--------|-------------|--------------|-----------------|----------|
| preDeploymentCheck.js | No | No | Yes | Pre-deployment verification |
| deployFix.js | Yes | Yes | Yes | Automated fix with safety |
| fixNullCandidateIds.js | No | Yes | Yes | Manual cleanup |
| verifyCandidateSetup.js | No | No | Yes | Detailed diagnostics |
| createIndexes.js | No | Yes | Partial | Index management |

## Exit Codes

All scripts use standard exit codes:
- `0` - Success, all checks passed
- `1` - Failure, issues found or error occurred

Use in CI/CD:
```bash
node scripts/preDeploymentCheck.js && echo "Ready to deploy" || echo "Fix issues first"
```

## Environment Variables Required

All scripts require these environment variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `NODE_ENV` - Environment (development/production)

Set in `.env` file or environment.

## Safety Features

All scripts include:
- ✅ Database connection validation
- ✅ Detailed error messages
- ✅ Progress reporting
- ✅ Rollback recommendations
- ✅ Non-destructive checks (except fix scripts)

Fix scripts include:
- ✅ Interactive confirmations (deployFix.js)
- ✅ Backup reminders
- ✅ Verification after changes
- ✅ Detailed logging

## Common Issues

### "Cannot connect to database"
- Check MONGODB_URI in .env
- Verify database is running
- Check network connectivity

### "Found X records with null candidateId"
- Run: `node scripts/deployFix.js`
- Or: `node scripts/fixNullCandidateIds.js`

### "candidateId index is not unique"
- Run: `node scripts/createIndexes.js`
- Or: `node scripts/deployFix.js`

### "Model files not found"
- Ensure you're in the backend directory
- Verify file paths are correct

## Output Examples

### Success:
```
✓ All checks passed!
✓ Database is ready for production use
✅ You can proceed with deployment.
```

### Issues Found:
```
✗ Found 5 records with null candidateId
✗ candidateId index is not unique

Critical Issues:
  1. 5 profiles have null candidateId - run fixNullCandidateIds.js
  2. candidateId index is not unique - run createIndexes.js

❌ Fix the critical issues before deploying.
```

## Support

If scripts fail or show unexpected results:

1. Check the detailed error message
2. Verify environment variables
3. Check database connectivity
4. Review MongoDB logs
5. Consult CANDIDATEID_FIX_GUIDE.md

## Related Documentation

- `CANDIDATEID_FIX_GUIDE.md` - Comprehensive fix guide
- `QUICK_FIX_GUIDE.md` - Quick reference
- `FIX_SUMMARY.md` - Summary of all changes

## Script Maintenance

These scripts are part of the candidate registration fix and should be:
- ✅ Kept in version control
- ✅ Run before each deployment
- ✅ Updated if database schema changes
- ✅ Tested in staging before production

---

**Last Updated**: 2024
**Version**: 1.0
**Status**: Production Ready
