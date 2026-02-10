# Database Performance Optimization

## Changes Made:

1. **Increased MongoDB Timeouts** (database.js)
   - serverSelectionTimeoutMS: 30 seconds
   - socketTimeoutMS: 60 seconds
   - connectTimeoutMS: 30 seconds

2. **Optimized getTopRecruiters** (publicController.js)
   - Changed from N+1 queries to aggregation pipeline
   - Reduced query time from 90+ seconds to <1 second

3. **Increased Cache Durations** (publicController.js)
   - Jobs: 30s → 2 minutes
   - Job details: 1 min → 5 minutes
   - Employers: 30s → 2 minutes
   - Filter counts: 1 min → 5 minutes
   - Top recruiters: 5 minutes

4. **Created Database Indexes** (createIndexes.js)
   - Job indexes on status, employerId, location, jobType, category
   - Employer indexes on status, isApproved
   - EmployerProfile index on employerId
   - Application indexes on candidateId, jobId, status

## To Apply Changes:

### Step 1: Create Database Indexes
```bash
cd /var/www/global/backend
node scripts/createIndexes.js
```

### Step 2: Restart Backend Server
```bash
pm2 restart all
```

### Step 3: Clear Cache (Optional)
If you have Redis or any cache, clear it to ensure fresh data.

## Expected Results:
- API response times: 2-8 seconds → <500ms
- Reduced MongoDB timeouts
- Better handling of concurrent requests
- Improved user experience

## Monitoring:
Check logs after restart:
```bash
pm2 logs Tale --lines 50
```

Look for:
- ✅ Fast API calls (<500ms)
- No more MongoDB timeout errors
- Reduced "Slow API call" warnings
