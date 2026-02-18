# Quick Fix Guide - Duplicate candidateId Error

## Problem
```
E11000 duplicate key error collection: tale_jobportal.candidates index: candidateId_1 
dup key: { candidateId: null }
```

## Quick Fix (Production)

### Option 1: Automated Fix (Recommended)
```bash
cd backend
node scripts/deployFix.js
```
This interactive script will:
- Check current database state
- Remove null candidateId records
- Fix indexes
- Verify the fix

### Option 2: Manual Fix
```bash
cd backend

# Step 1: Verify current state
node scripts/verifyCandidateSetup.js

# Step 2: Fix null records and indexes
node scripts/fixNullCandidateIds.js

# Step 3: Update all indexes
node scripts/createIndexes.js

# Step 4: Verify fix
node scripts/verifyCandidateSetup.js
```

## What Was Fixed

1. **Database**: Removed all records with `candidateId: null`
2. **Model**: Added validation to prevent null candidateId
3. **Controller**: Added rollback mechanism if profile creation fails
4. **Indexes**: Ensured unique index on candidateId

## Files Changed

- ✅ `models/CandidateProfile.js` - Enhanced validation
- ✅ `controllers/candidateController.js` - Added error handling
- ✅ `scripts/createIndexes.js` - Improved index management
- ✅ `scripts/fixNullCandidateIds.js` - NEW cleanup script
- ✅ `scripts/verifyCandidateSetup.js` - NEW verification script
- ✅ `scripts/deployFix.js` - NEW automated fix script

## Testing After Fix

1. **Test Registration**:
   - Register a new candidate
   - Verify profile is created
   - Check no errors in logs

2. **Verify Database**:
   ```javascript
   // Should return 0
   db.candidateprofiles.countDocuments({ candidateId: null })
   ```

3. **Check Indexes**:
   ```javascript
   db.candidateprofiles.getIndexes()
   // Should show unique index on candidateId
   ```

## Rollback (If Needed)

If issues occur:
1. Restore database from backup
2. Revert code changes in git
3. Contact support

## Support Commands

```bash
# Check for null records
mongo tale_jobportal --eval "db.candidateprofiles.countDocuments({candidateId: null})"

# Check indexes
mongo tale_jobportal --eval "db.candidateprofiles.getIndexes()"

# View recent candidates
mongo tale_jobportal --eval "db.candidates.find().sort({createdAt:-1}).limit(5)"
```

## Prevention

The fix ensures:
- ✅ candidateId is always unique
- ✅ candidateId is never null
- ✅ No duplicate key errors
- ✅ Automatic rollback on failure
- ✅ Production environment safe

## Need Help?

1. Run verification: `node scripts/verifyCandidateSetup.js`
2. Check logs for detailed errors
3. Review `CANDIDATEID_FIX_GUIDE.md` for full documentation
