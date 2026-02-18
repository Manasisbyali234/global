# Production Deployment Checklist - candidateId Fix

## Pre-Deployment (CRITICAL - DO NOT SKIP)

### 1. Backup Database ⚠️
```bash
# Create backup with timestamp
mongodump --uri="YOUR_PRODUCTION_MONGODB_URI" --out=/backup/$(date +%Y%m%d_%H%M%S)

# Verify backup was created
ls -lh /backup/
```

**Status**: [ ] Completed - Backup location: _______________

---

### 2. Run Pre-Deployment Check
```bash
cd backend
node scripts/preDeploymentCheck.js
```

**Expected Output**: "ALL CHECKS PASSED! System is ready for deployment."

**Status**: [ ] Passed  [ ] Failed (if failed, proceed to step 3)

---

### 3. Fix Issues (If Pre-Check Failed)
```bash
cd backend
node scripts/deployFix.js
```

Follow the interactive prompts. Answer "yes" to delete null records.

**Status**: [ ] Completed

---

### 4. Verify Fix
```bash
node scripts/preDeploymentCheck.js
```

**Expected Output**: "ALL CHECKS PASSED!"

**Status**: [ ] Passed (proceed to deployment)  [ ] Failed (contact support)

---

## Deployment

### 5. Deploy Code Changes

**Files to Deploy**:
- [ ] `backend/models/CandidateProfile.js`
- [ ] `backend/controllers/candidateController.js`
- [ ] `backend/scripts/createIndexes.js`
- [ ] `backend/scripts/fixNullCandidateIds.js`
- [ ] `backend/scripts/verifyCandidateSetup.js`
- [ ] `backend/scripts/deployFix.js`
- [ ] `backend/scripts/preDeploymentCheck.js`

**Deployment Method**: [ ] Git Push  [ ] FTP  [ ] Other: _______________

**Status**: [ ] Completed

---

### 6. Restart Application
```bash
# Example commands (adjust for your setup)
pm2 restart backend
# OR
systemctl restart your-app-service
# OR
docker-compose restart backend
```

**Status**: [ ] Completed

---

## Post-Deployment Verification

### 7. Run Post-Deployment Check
```bash
cd backend
node scripts/verifyCandidateSetup.js
```

**Expected Output**: "No profiles with null candidateId" and "candidateId index exists (unique)"

**Status**: [ ] Passed  [ ] Failed

---

### 8. Test Candidate Registration

**Test 1**: Register new candidate
- Email: test1_$(date +%s)@example.com
- Result: [ ] Success  [ ] Failed
- Error (if any): _______________

**Test 2**: Register another candidate
- Email: test2_$(date +%s)@example.com
- Result: [ ] Success  [ ] Failed
- Error (if any): _______________

**Test 3**: Register third candidate
- Email: test3_$(date +%s)@example.com
- Result: [ ] Success  [ ] Failed
- Error (if any): _______________

**Status**: [ ] All tests passed

---

### 9. Verify Database State
```bash
# Check for null candidateIds (should be 0)
mongo tale_jobportal --eval "db.candidateprofiles.countDocuments({candidateId: null})"

# Check recent registrations
mongo tale_jobportal --eval "db.candidates.find().sort({createdAt:-1}).limit(5).pretty()"
```

**Null candidateId count**: _____ (should be 0)

**Status**: [ ] Verified

---

### 10. Check Application Logs
```bash
# Check for errors in last 100 lines
tail -n 100 /path/to/your/app.log | grep -i error

# Check for duplicate key errors
tail -n 100 /path/to/your/app.log | grep -i "E11000"
```

**Errors found**: [ ] None  [ ] Some (describe): _______________

**Status**: [ ] Clean

---

## Monitoring (Next 24-48 Hours)

### 11. Monitor Registration Success Rate

**Hour 1**: _____ registrations, _____ successful
**Hour 4**: _____ registrations, _____ successful
**Hour 12**: _____ registrations, _____ successful
**Hour 24**: _____ registrations, _____ successful

**Status**: [ ] Normal  [ ] Issues detected

---

### 12. Monitor Error Logs

Check for these errors:
- [ ] E11000 duplicate key error (should be NONE)
- [ ] "Candidate ID cannot be null" (should be NONE)
- [ ] "Failed to create candidate profile" (should be NONE)

**Status**: [ ] No errors  [ ] Errors found (describe): _______________

---

### 13. Database Health Check

Run daily for 3 days:

**Day 1**:
```bash
node scripts/verifyCandidateSetup.js
```
Result: [ ] Passed  [ ] Failed

**Day 2**:
```bash
node scripts/verifyCandidateSetup.js
```
Result: [ ] Passed  [ ] Failed

**Day 3**:
```bash
node scripts/verifyCandidateSetup.js
```
Result: [ ] Passed  [ ] Failed

---

## Rollback Plan (If Needed)

### If Critical Issues Occur:

1. **Stop Application**
   ```bash
   pm2 stop backend
   # OR your stop command
   ```
   Status: [ ] Completed

2. **Restore Database**
   ```bash
   mongorestore --uri="YOUR_MONGODB_URI" --drop /backup/BACKUP_FOLDER
   ```
   Status: [ ] Completed

3. **Revert Code**
   ```bash
   git revert HEAD
   # OR restore previous version
   ```
   Status: [ ] Completed

4. **Restart Application**
   ```bash
   pm2 start backend
   ```
   Status: [ ] Completed

5. **Verify Rollback**
   ```bash
   node scripts/verifyCandidateSetup.js
   ```
   Status: [ ] Verified

---

## Success Criteria

Deployment is successful when ALL of these are true:

- [x] Pre-deployment check passed
- [x] Code deployed successfully
- [x] Post-deployment check passed
- [x] Test registrations successful (3/3)
- [x] No null candidateId records in database
- [x] No E11000 errors in logs
- [x] Application logs are clean
- [x] Monitoring shows normal operation

---

## Sign-Off

**Deployed By**: _______________
**Date**: _______________
**Time**: _______________
**Environment**: [ ] Production  [ ] Staging  [ ] Other: _______________

**Pre-Deployment Backup Location**: _______________

**Deployment Status**: [ ] Successful  [ ] Failed  [ ] Rolled Back

**Notes**:
_______________________________________________________________
_______________________________________________________________
_______________________________________________________________

---

## Quick Reference Commands

```bash
# Pre-deployment check
node scripts/preDeploymentCheck.js

# Automated fix
node scripts/deployFix.js

# Detailed verification
node scripts/verifyCandidateSetup.js

# Check for null records
mongo tale_jobportal --eval "db.candidateprofiles.countDocuments({candidateId: null})"

# Check indexes
mongo tale_jobportal --eval "db.candidateprofiles.getIndexes()"

# View recent candidates
mongo tale_jobportal --eval "db.candidates.find().sort({createdAt:-1}).limit(5).pretty()"

# Check application logs
tail -f /path/to/app.log | grep -i error
```

---

## Support Contacts

**Technical Lead**: _______________
**Database Admin**: _______________
**DevOps**: _______________

**Emergency Rollback Authority**: _______________

---

**Document Version**: 1.0
**Last Updated**: $(date)
**Status**: Ready for Use
