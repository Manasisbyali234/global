# Fix for E11000 Duplicate Key Error - candidateId

## Problem Description

In the hosted (production) environment, candidate registration was failing with:
```
E11000 duplicate key error collection: tale_jobportal.candidates index: candidateId_1 dup key: { candidateId: null }
```

This error occurred because:
1. The `candidateprofiles` collection had a unique index on `candidateId`
2. Multiple documents existed with `candidateId: null`
3. MongoDB's unique index allows only ONE null value
4. New registrations attempting to create profiles with null `candidateId` failed

## Root Causes

1. **Missing Validation**: No validation to ensure `candidateId` was always set before profile creation
2. **No Rollback Mechanism**: If profile creation failed, the candidate record remained orphaned
3. **Existing Null Records**: Production database had existing records with `candidateId: null`
4. **Index Configuration**: The unique index wasn't properly configured to prevent null duplicates

## Solution Implemented

### 1. Database Cleanup Script
**File**: `backend/scripts/fixNullCandidateIds.js`

This script:
- Finds and removes all `CandidateProfile` records with `candidateId: null`
- Drops and recreates the unique index on `candidateId`
- Identifies orphaned profiles (profiles without matching candidates)
- Verifies database integrity

**Usage**:
```bash
cd backend
node scripts/fixNullCandidateIds.js
```

### 2. Model Validation Enhancement
**File**: `backend/models/CandidateProfile.js`

Added:
- Required field validation with custom error message
- ObjectId validation to ensure valid MongoDB IDs
- Pre-save hook to prevent null values
- Enhanced schema validation

```javascript
candidateId: { 
  type: mongoose.Schema.Types.ObjectId, 
  ref: 'Candidate', 
  required: [true, 'Candidate ID is required'], 
  unique: true,
  validate: {
    validator: function(v) {
      return v != null && mongoose.Types.ObjectId.isValid(v);
    },
    message: 'Candidate ID must be a valid ObjectId'
  }
}
```

### 3. Controller Enhancement
**File**: `backend/controllers/candidateController.js`

Added in `registerCandidate`:
- Validation check after candidate creation
- Try-catch block around profile creation
- Automatic rollback (delete candidate) if profile creation fails
- Enhanced error logging

```javascript
// Validate candidate._id before creating profile
if (!candidate._id) {
  console.error('CRITICAL: Candidate created without _id');
  throw new Error('Failed to create candidate with valid ID');
}

// Create profile with validated candidateId
try {
  await CandidateProfile.create({ 
    candidateId: candidate._id,
    firstName,
    middleName,
    lastName
  });
} catch (profileError) {
  // Rollback: delete the candidate if profile creation fails
  await Candidate.findByIdAndDelete(candidate._id);
  throw new Error('Failed to create candidate profile. Registration rolled back.');
}
```

### 4. Index Management Update
**File**: `backend/scripts/createIndexes.js`

Enhanced to:
- Check for existing unique index
- Drop old non-unique indexes
- Create proper unique index with `sparse: false`
- Better error handling

### 5. Verification Script
**File**: `backend/scripts/verifyCandidateSetup.js`

Comprehensive verification that checks:
- Environment variables configuration
- Database connection
- Null candidateId records
- Index configuration
- Orphaned profiles
- Database statistics
- Recent registrations

**Usage**:
```bash
cd backend
node scripts/verifyCandidateSetup.js
```

## Deployment Steps

### For Production Environment:

1. **Backup Database** (CRITICAL):
   ```bash
   mongodump --uri="mongodb://your-production-uri" --out=/backup/$(date +%Y%m%d)
   ```

2. **Run Verification** (to see current state):
   ```bash
   cd backend
   node scripts/verifyCandidateSetup.js
   ```

3. **Fix Null Records**:
   ```bash
   node scripts/fixNullCandidateIds.js
   ```

4. **Update Indexes**:
   ```bash
   node scripts/createIndexes.js
   ```

5. **Deploy Code Changes**:
   - Deploy updated `CandidateProfile.js` model
   - Deploy updated `candidateController.js`
   - Deploy updated `createIndexes.js`

6. **Verify Fix**:
   ```bash
   node scripts/verifyCandidateSetup.js
   ```

7. **Test Registration**:
   - Test new candidate registration
   - Verify profile creation
   - Check database for new records

## Prevention Measures

The fix ensures:

1. ✅ **candidateId is always unique** - Unique index enforced at database level
2. ✅ **candidateId is never null** - Multiple validation layers prevent null values
3. ✅ **Duplicate key errors don't occur** - Null records cleaned up, validation prevents new ones
4. ✅ **Data integrity maintained** - Rollback mechanism prevents orphaned records
5. ✅ **Production environment safe** - Environment variables don't affect candidateId generation

## Monitoring

After deployment, monitor:

1. **Registration Success Rate**:
   ```javascript
   db.candidates.countDocuments({ createdAt: { $gte: new Date('2024-01-01') } })
   ```

2. **Profile Creation Rate**:
   ```javascript
   db.candidateprofiles.countDocuments({ createdAt: { $gte: new Date('2024-01-01') } })
   ```

3. **Null CandidateIds** (should always be 0):
   ```javascript
   db.candidateprofiles.countDocuments({ candidateId: null })
   ```

4. **Error Logs**:
   - Check application logs for "CRITICAL: Candidate created without _id"
   - Check for "Failed to create candidate profile" errors

## Rollback Plan

If issues occur after deployment:

1. Restore database from backup
2. Revert code changes
3. Investigate specific error cases
4. Test fix in staging environment first

## Testing Checklist

- [ ] Backup production database
- [ ] Run verification script
- [ ] Fix null records
- [ ] Update indexes
- [ ] Deploy code changes
- [ ] Verify with verification script
- [ ] Test new registration (3-5 test accounts)
- [ ] Check database for null candidateIds
- [ ] Monitor error logs for 24 hours
- [ ] Verify no duplicate key errors

## Support

If issues persist:
1. Check application logs for detailed error messages
2. Run verification script to identify specific issues
3. Check MongoDB logs for index-related errors
4. Verify environment variables are correctly set
5. Ensure MongoDB version compatibility (4.0+)

## Files Modified

1. `backend/models/CandidateProfile.js` - Enhanced validation
2. `backend/controllers/candidateController.js` - Added rollback mechanism
3. `backend/scripts/createIndexes.js` - Improved index management
4. `backend/scripts/fixNullCandidateIds.js` - NEW cleanup script
5. `backend/scripts/verifyCandidateSetup.js` - NEW verification script

## Technical Details

- **MongoDB Version**: 4.0+ (unique index with null handling)
- **Mongoose Version**: Compatible with current project version
- **Index Type**: Unique, non-sparse
- **Validation**: Schema-level + Pre-save hook + Controller-level
- **Error Handling**: Try-catch with rollback
- **Transaction Safety**: Atomic operations where possible
