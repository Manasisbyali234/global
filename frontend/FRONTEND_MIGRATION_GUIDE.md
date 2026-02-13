# Frontend Migration Guide - Interview Rounds

## Overview
Update frontend to use new `interviewRounds` array format instead of `interviewRoundDetails` object.

## Files to Update

### 1. **emp-post-job.jsx** (Main file)
Location: `src/app/pannels/employer/components/jobs/emp-post-job.jsx`

**Changes needed:**
- Replace `interviewRoundDetails` object with `interviewRounds` array
- Update form state initialization
- Update form submission logic
- Update validation logic

### 2. **application-status.jsx**
Location: `src/app/pannels/candidate/components/application-status.jsx`

**Changes needed:**
- Update to read from `interviewRounds` array instead of `interviewRoundDetails` object
- Update round lookup logic

### 3. **emp-candidate-review.jsx**
Location: `src/app/pannels/employer/components/emp-candidate-review.jsx`

**Changes needed:**
- Update round details access

### 4. **emp-job-review.jsx**
Location: `src/app/pannels/employer/components/emp-job-review.jsx`

**Changes needed:**
- Update round details display

### 5. **InterviewProcessManager.jsx**
Location: `src/app/pannels/employer/components/InterviewProcessManager.jsx`

**Changes needed:**
- Update job round details access

## Helper Utility Functions

Create a new file: `src/utils/interviewRoundsHelper.js`

```javascript
/**
 * Convert old interviewRoundDetails format to new interviewRounds array
 */
export const convertToInterviewRounds = (interviewRoundDetails) => {
  if (!interviewRoundDetails || typeof interviewRoundDetails !== 'object') {
    return [];
  }

  return Object.entries(interviewRoundDetails).map(([key, value]) => ({
    id: key,
    name: key.replace(/_\d+$/, ''),
    date: value.fromDate || value.date || null,
    startTime: value.startTime || value.time || '',
    endTime: value.endTime || ''
  }));
};

/**
 * Convert new interviewRounds array to old interviewRoundDetails format (for backward compatibility)
 */
export const convertToInterviewRoundDetails = (interviewRounds) => {
  if (!Array.isArray(interviewRounds)) {
    return {};
  }

  const details = {};
  interviewRounds.forEach(round => {
    details[round.id] = {
      description: round.description || '',
      fromDate: round.date,
      toDate: round.date,
      startTime: round.startTime,
      endTime: round.endTime,
      time: round.startTime
    };
  });
  return details;
};

/**
 * Find a specific round by ID
 */
export const findRoundById = (interviewRounds, roundId) => {
  if (!Array.isArray(interviewRounds)) {
    return null;
  }
  return interviewRounds.find(round => round.id === roundId);
};

/**
 * Find a specific round by name
 */
export const findRoundByName = (interviewRounds, roundName) => {
  if (!Array.isArray(interviewRounds)) {
    return null;
  }
  return interviewRounds.find(round => round.name === roundName);
};

/**
 * Get all rounds sorted by date
 */
export const getSortedRounds = (interviewRounds) => {
  if (!Array.isArray(interviewRounds)) {
    return [];
  }
  return [...interviewRounds].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date) - new Date(b.date);
  });
};
```

## Migration Steps

### Step 1: Create Helper Utility
1. Create `src/utils/interviewRoundsHelper.js` with the functions above

### Step 2: Update Backend API Calls
The backend already handles conversion automatically, so no changes needed to API calls.

### Step 3: Update Form State (emp-post-job.jsx)

**Old:**
```javascript
interviewRoundDetails: {
  assessment_123: {
    fromDate: '2025-12-18',
    toDate: '2025-12-31',
    startTime: '17:55',
    endTime: '01:59'
  }
}
```

**New:**
```javascript
interviewRounds: [
  {
    id: 'assessment_123',
    name: 'assessment',
    date: '2025-12-18',
    startTime: '17:55',
    endTime: '01:59'
  }
]
```

### Step 4: Update Display Components

**Old way to access:**
```javascript
const roundDetails = job.interviewRoundDetails[roundKey];
```

**New way to access:**
```javascript
import { findRoundById } from '../utils/interviewRoundsHelper';
const roundDetails = findRoundById(job.interviewRounds, roundKey);
```

### Step 5: Update Form Submission

When submitting the form, the backend will automatically convert the old format if sent, but it's better to send the new format:

```javascript
const submitData = {
  ...formData,
  interviewRounds: formData.interviewRounds || []
};
```

## Testing Checklist

- [ ] Create new job with interview rounds
- [ ] Edit existing job with interview rounds
- [ ] View job details with interview rounds
- [ ] Candidate can view interview schedule
- [ ] Interview round details popup works
- [ ] Date validation works correctly
- [ ] Time validation works correctly

## Backward Compatibility

The backend automatically converts old format to new format, so:
- Old data will work with new frontend
- New data will work with old frontend (temporarily)
- Gradual migration is possible

## Notes

- The backend migration script should be run first
- Frontend can be updated gradually
- Use helper functions for consistent conversion
- Test thoroughly before deploying
