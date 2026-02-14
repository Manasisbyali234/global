# Interview Rounds - New Structure

## Overview
Interview rounds are now stored in a separate `InterviewRound` collection instead of being embedded in the Job document. This provides better scalability and allows for more flexible management of interview rounds.

## New Structure

### InterviewRound Model
```javascript
{
  "_id": "R3698dc28f18ca03cefeffgff",
  "job_id": "698dc28f18ca03ce8eddf825",
  "name": "Round 1",
  "date": "2026-11-11",
  "startTime": "10:00",
  "endTime": "11:00",
  "applicationLimit": 50,
  "createdAt": "2026-02-13T10:00:00Z",
  "updatedAt": "2026-02-13T10:00:00Z"
}
```

### Fields
- **_id**: Unique identifier for the interview round
- **job_id**: Reference to the Job document
- **name**: Name of the interview round (e.g., "Round 1", "Technical Round", "HR Round")
- **date**: Date of the interview round (ISO 8601 format)
- **startTime**: Start time in HH:MM format (24-hour)
- **endTime**: End time in HH:MM format (24-hour)
- **applicationLimit**: Maximum number of applications for this round
- **createdAt**: Timestamp when the round was created
- **updatedAt**: Timestamp when the round was last updated

## API Endpoints

### 1. Create Interview Rounds
**POST** `/api/employer/jobs/:jobId/interview-rounds`

Create multiple interview rounds for a job.

**Request Body:**
```json
{
  "rounds": [
    {
      "name": "Round 1",
      "date": "2026-11-11",
      "startTime": "10:00",
      "endTime": "11:00",
      "applicationLimit": 50
    },
    {
      "name": "Round 2",
      "date": "2026-11-12",
      "startTime": "14:00",
      "endTime": "15:00",
      "applicationLimit": 30
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Interview rounds created successfully",
  "rounds": [
    {
      "_id": "R3698dc28f18ca03cefeffgff",
      "job_id": "698dc28f18ca03ce8eddf825",
      "name": "Round 1",
      "date": "2026-11-11T00:00:00.000Z",
      "startTime": "10:00",
      "endTime": "11:00",
      "applicationLimit": 50,
      "createdAt": "2026-02-13T10:00:00.000Z",
      "updatedAt": "2026-02-13T10:00:00.000Z"
    }
  ]
}
```

### 2. Get Interview Rounds
**GET** `/api/employer/jobs/:jobId/interview-rounds`

Get all interview rounds for a specific job.

**Response:**
```json
{
  "success": true,
  "rounds": [
    {
      "_id": "R3698dc28f18ca03cefeffgff",
      "job_id": "698dc28f18ca03ce8eddf825",
      "name": "Round 1",
      "date": "2026-11-11T00:00:00.000Z",
      "startTime": "10:00",
      "endTime": "11:00",
      "applicationLimit": 50,
      "createdAt": "2026-02-13T10:00:00.000Z",
      "updatedAt": "2026-02-13T10:00:00.000Z"
    }
  ]
}
```

### 3. Update Interview Round
**PUT** `/api/employer/interview-rounds/:roundId`

Update a specific interview round.

**Request Body:**
```json
{
  "name": "Technical Round",
  "date": "2026-11-15",
  "startTime": "11:00",
  "endTime": "12:00",
  "applicationLimit": 40
}
```

**Response:**
```json
{
  "success": true,
  "message": "Interview round updated successfully",
  "round": {
    "_id": "R3698dc28f18ca03cefeffgff",
    "job_id": "698dc28f18ca03ce8eddf825",
    "name": "Technical Round",
    "date": "2026-11-15T00:00:00.000Z",
    "startTime": "11:00",
    "endTime": "12:00",
    "applicationLimit": 40,
    "createdAt": "2026-02-13T10:00:00.000Z",
    "updatedAt": "2026-02-13T12:00:00.000Z"
  }
}
```

### 4. Delete Interview Round
**DELETE** `/api/employer/interview-rounds/:roundId`

Delete a specific interview round.

**Response:**
```json
{
  "success": true,
  "message": "Interview round deleted successfully"
}
```

## Migration

To migrate existing interview rounds from the old embedded structure to the new separate collection:

```bash
cd backend
node scripts/migrateInterviewRoundsToNewStructure.js
```

This script will:
1. Find all jobs with embedded interview rounds
2. Create new InterviewRound documents for each round
3. Skip jobs that have already been migrated
4. Provide a summary of the migration

## Frontend Integration

### Example: Creating Interview Rounds

```javascript
const createInterviewRounds = async (jobId, rounds) => {
  const token = localStorage.getItem('employerToken');
  
  const response = await fetch(`http://localhost:5000/api/employer/jobs/${jobId}/interview-rounds`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ rounds })
  });
  
  const data = await response.json();
  return data;
};

// Usage
const rounds = [
  {
    name: "Round 1",
    date: "2026-11-11",
    startTime: "10:00",
    endTime: "11:00",
    applicationLimit: 50
  }
];

createInterviewRounds(jobId, rounds);
```

### Example: Fetching Interview Rounds

```javascript
const getInterviewRounds = async (jobId) => {
  const token = localStorage.getItem('employerToken');
  
  const response = await fetch(`http://localhost:5000/api/employer/jobs/${jobId}/interview-rounds`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  const data = await response.json();
  return data.rounds;
};
```

## Benefits of New Structure

1. **Scalability**: Separate collection allows for better performance with large numbers of rounds
2. **Flexibility**: Each round can be managed independently
3. **Indexing**: Better query performance with dedicated indexes
4. **Application Limits**: Each round can have its own application limit
5. **Easier Updates**: Update individual rounds without modifying the entire job document

## Backward Compatibility

The old `interviewRounds` field in the Job model is kept for backward compatibility but should not be used for new data. All new interview rounds should be created using the new API endpoints.
