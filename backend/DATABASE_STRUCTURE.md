# Database Structure - Interview Rounds

## Current Database Structure (After Migration)

### Job Document Example

```json
{
  "_id": "6943f30248121c2825c5c07c",
  "title": "HR Executive",
  "description": "<p>We are looking for a talented professional...</p>",
  "employerId": "6902437490d37516e931951d",
  "location": ["Mumbai"],
  "category": "Content",
  "typeOfEmployment": "permanent",
  "jobType": "internship-(unpaid)",
  "vacancies": 6,
  "applicationLimit": 5,
  "education": ["BCA"],
  "backlogsAllowed": true,
  "requiredSkills": ["Communication"],
  "experienceLevel": "freshers",
  "minExperience": 0,
  "maxExperience": 0,
  "responsibilities": ["Task 1", "Task 2"],
  "benefits": [],
  "interviewRoundsCount": 2,
  
  "interviewRoundTypes": {
    "technical": true,
    "oneOnOne": false,
    "panel": false,
    "group": false,
    "situational": false,
    "others": false,
    "assessment": true
  },
  
  "interviewRounds": [
    {
      "id": "assessment_1766060692812",
      "name": "assessment",
      "date": "2025-12-18T00:00:00.000Z",
      "startTime": "17:55",
      "endTime": "01:59"
    },
    {
      "id": "technical_1766060694894",
      "name": "technical",
      "date": "2025-12-25T00:00:00.000Z",
      "startTime": "17:56",
      "endTime": ""
    }
  ],
  
  "interviewRoundOrder": [
    "assessment_1766060692812",
    "technical_1766060694894"
  ],
  
  "dynamicInterviewRounds": [],
  
  "assessmentId": "507f1f77bcf86cd799439011",
  "assessmentStartDate": "2025-12-18T00:00:00.000Z",
  "assessmentEndDate": "2025-12-31T00:00:00.000Z",
  "assessmentStartTime": "17:55",
  "assessmentEndTime": "01:59",
  "assessmentPassingPercentage": 60,
  
  "offerLetterDate": "2025-12-24T00:00:00.000Z",
  "lastDateOfApplication": "2025-12-26T00:00:00.000Z",
  
  "transportation": {
    "oneWay": false,
    "twoWay": false,
    "noCab": false
  },
  
  "status": "closed",
  "applicationCount": 1,
  "interviewScheduled": true,
  
  "createdAt": "2025-12-18T12:26:42.698Z",
  "updatedAt": "2026-02-03T12:10:18.965Z",
  "__v": 0
}
```

## Key Changes

### ❌ REMOVED Field
```json
"interviewRoundDetails": {
  "assessment_1766060692812": {
    "description": "",
    "fromDate": "2025-12-18T00:00:00.000Z",
    "toDate": "2025-12-31T00:00:00.000Z",
    "startTime": "17:55",
    "endTime": "01:59"
  },
  "technical_1766060694894": {
    "description": "ytvthvh",
    "fromDate": "2025-12-25T00:00:00.000Z",
    "toDate": "2025-12-29T00:00:00.000Z",
    "time": "17:56"
  }
}
```

### ✅ NEW Field
```json
"interviewRounds": [
  {
    "id": "assessment_1766060692812",
    "name": "assessment",
    "date": "2025-12-18T00:00:00.000Z",
    "startTime": "17:55",
    "endTime": "01:59"
  },
  {
    "id": "technical_1766060694894",
    "name": "technical",
    "date": "2025-12-25T00:00:00.000Z",
    "startTime": "17:56",
    "endTime": ""
  }
]
```

## Schema Definition

### New interviewRounds Schema
```javascript
interviewRounds: [{
  id: { type: String, required: true },      // Unique identifier (e.g., "assessment_1766060692812")
  name: { type: String, required: true },    // Round type (e.g., "assessment", "technical")
  date: { type: Date },                      // Interview date
  startTime: { type: String },               // Start time in HH:MM format
  endTime: { type: String }                  // End time in HH:MM format
}]
```

## Benefits of New Structure

### 1. **Simpler Queries**
```javascript
// Find jobs with interviews on a specific date
Job.find({ 'interviewRounds.date': specificDate })

// Find jobs with specific round type
Job.find({ 'interviewRounds.name': 'technical' })
```

### 2. **Easier Iteration**
```javascript
// Old way
Object.entries(job.interviewRoundDetails).forEach(([key, value]) => {
  // Process each round
});

// New way
job.interviewRounds.forEach(round => {
  // Process each round
});
```

### 3. **Better Sorting**
```javascript
// Sort rounds by date
const sortedRounds = job.interviewRounds.sort((a, b) => 
  new Date(a.date) - new Date(b.date)
);
```

### 4. **Consistent Structure**
All rounds follow the same schema, making validation and processing uniform.

## Migration Status

After running the migration script:
- ✅ All existing `interviewRoundDetails` converted to `interviewRounds`
- ✅ Old field removed from database
- ✅ New field populated with converted data
- ✅ Backend automatically handles both formats during transition
- ✅ No data loss during migration

## API Response Example

When fetching a job via API:
```json
GET /api/employer/jobs/:jobId

Response:
{
  "success": true,
  "job": {
    "_id": "6943f30248121c2825c5c07c",
    "title": "HR Executive",
    "interviewRounds": [
      {
        "id": "001",
        "name": "round1",
        "date": "2026-11-11T00:00:00.000Z",
        "startTime": "10:00",
        "endTime": "11:00"
      }
    ],
    "interviewScheduled": true,
    ...
  }
}
```
