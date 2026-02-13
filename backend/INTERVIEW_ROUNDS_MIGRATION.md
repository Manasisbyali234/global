# Interview Rounds Data Structure Migration

## Overview
This migration changes the interview rounds data structure from a nested object format to a simplified array format.

## Changes Made

### 1. Job Model (models/Job.js)
**Old Structure:**
```javascript
interviewRoundDetails: {
  type: mongoose.Schema.Types.Mixed,
  default: {}
}
```

**New Structure:**
```javascript
interviewRounds: [{
  id: { type: String, required: true },
  name: { type: String, required: true },
  date: { type: Date },
  startTime: { type: String },
  endTime: { type: String }
}]
```

### 2. Controller Updates (controllers/employerController.js)
- **createJob**: Automatically converts old `interviewRoundDetails` to new `interviewRounds` format
- **updateJob**: Automatically converts old `interviewRoundDetails` to new `interviewRounds` format
- **scheduleInterviewRound**: Updated to use new array-based structure

### 3. Migration Script (scripts/migrateInterviewRounds.js)
Run this script to migrate existing data:
```bash
node scripts/migrateInterviewRounds.js
```

## Data Format Comparison

### Old Format (interviewRoundDetails)
```json
{
  "assessment_1766060692812": {
    "description": "",
    "fromDate": "2025-12-18T00:00:00.000+00:00",
    "toDate": "2025-12-31T00:00:00.000+00:00",
    "startTime": "17:55",
    "endTime": "01:59"
  },
  "technical_1766060694894": {
    "description": "ytvthvh",
    "fromDate": "2025-12-25T00:00:00.000+00:00",
    "toDate": "2025-12-29T00:00:00.000+00:00",
    "time": "17:56"
  }
}
```

### New Format (interviewRounds)
```json
[
  {
    "id": "assessment_1766060692812",
    "name": "assessment",
    "date": "2025-12-18T00:00:00.000+00:00",
    "startTime": "17:55",
    "endTime": "01:59"
  },
  {
    "id": "technical_1766060694894",
    "name": "technical",
    "date": "2025-12-25T00:00:00.000+00:00",
    "startTime": "17:56",
    "endTime": ""
  }
]
```

## Benefits
1. **Simpler Structure**: Array format is easier to iterate and manipulate
2. **Consistent Format**: All rounds follow the same structure
3. **Better Performance**: Easier to query and filter
4. **Frontend Friendly**: Simpler to map and display in UI

## Backward Compatibility
The controllers automatically convert old format to new format, ensuring backward compatibility during the transition period.

## Migration Steps
1. Update the Job model
2. Run the migration script to convert existing data
3. Update frontend to use new format
4. Test thoroughly before deploying to production
