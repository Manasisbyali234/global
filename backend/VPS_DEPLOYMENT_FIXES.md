# VPS Deployment Critical Fixes

## Issues Found & Fixed

### 1. Database Connection Issue ✅
**Problem**: `bufferCommands: false` + immediate scheduler startup caused MongoDB errors
```
Cannot call `applications.find()` before initial connection is complete
```
**Fix**: 
- Changed `bufferCommands: true` in database.js
- Added DB connection check before schedulers run

### 2. Slow Job Listing API ✅
**Problem**: Regex queries taking 2790ms
```
GET /api/public/jobs?limit=50 - 2790ms
```
**Fixes**:
- Removed `.populate()` with match filter (slow)
- Batch load employer data instead
- Use parallel queries with `Promise.all()`
- Added text indexes for searchable fields

### 3. Missing Database Indexes ✅
**Fixes**:
- Added `title + location + category` indexes to jobs
- Added text index for title/description/skills search
- Added CandidateProfile & Candidate indexes
- Added Employer compound index

## Files Modified

1. **config/database.js**
   - `bufferCommands: false` → `bufferCommands: true`

2. **server.js**
   - Added `dbConnected` flag
   - Async DB connection with await
   - DB connection checks in schedulers

3. **controllers/publicController.js**
   - Removed slow `.populate()` with match
   - Batch load employer data instead
   - Use `Promise.all()` for parallel queries

4. **controllers/adminController.js**
   - Fixed N+1 queries in 3 endpoints
   - Added pagination to 3 endpoints

5. **scripts/createIndexes.js**
   - Added text indexes
   - Added Candidate indexes
   - Added compound indexes for common queries

## Deployment Steps

### Step 1: Pull Latest Code
```bash
cd /var/www/global/backend
git pull
```

### Step 2: Create Database Indexes
```bash
node scripts/createIndexes.js
```

You should see:
```
✓ Job indexes created
✓ Employer indexes created
✓ Candidate indexes created
✓ CandidateProfile index created
✓ Application indexes created
```

### Step 3: Restart Backend
```bash
# Kill old process
pm2 stop all
pm2 delete all

# Start new process
npm start
# OR with PM2
pm2 start server.js --name "tale-backend"
```

### Step 4: Verify
Check logs for:
```
MongoDB Connected: ...
Database connection established successfully
Tale Job Portal API running on port 5000
```

No more errors like:
```
Cannot call `applications.find()` before initial connection is complete
```

## Performance Expectations

| Endpoint | Before | After | Improvement |
|----------|--------|-------|-------------|
| `/api/public/jobs` | 2790ms | <300ms | **90% faster** |
| `/admin/registered-candidates` | 5-10s | <1s | **80-90% faster** |
| `/admin/employers` | 5-10s | <1s | **80-90% faster** |
| Admin pages (general) | Frequent timeouts | No crashes | **Stable** |

## Scheduler Health

**Before**: Errors immediately on startup
**After**: Waits for DB connection, then runs properly

### Assessment Notification Scheduler
- Checks every 5 minutes
- Sends reminders for upcoming assessments
- ✅ Will not crash if DB not ready

### Job Deactivation Scheduler  
- Runs every 30 minutes
- Auto-closes expired jobs
- ✅ Will not crash if DB not ready

## Monitoring

Watch server logs for performance:
```bash
pm2 logs tale-backend
```

Should see patterns like:
```
✓ 🐌 Slow API call: GET /api/public/jobs?limit=50 - 200ms (if at all)
✓ [Job Scheduler] Auto-deactivated X jobs due to passed application deadline
✓ No error messages about DB connection
```

## Rollback Plan

If issues occur:
1. Revert database.js: `bufferCommands: false` (original)
2. Revert server.js to original scheduler code
3. Restart backend

But with these changes, rollback shouldn't be necessary.
