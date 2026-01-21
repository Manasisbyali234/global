# Placement Officer Document Rejection and Resubmission Feature

## Overview
This feature allows placement officers to resubmit rejected Excel/CSV files with corrected data after receiving feedback from administrators.

## Features Implemented

### Backend Implementation

#### 1. Rejection with Reason (Admin Side)
- **Endpoint**: `PUT /api/admin/placements/:id/files/:fileId/reject`
- **New Field**: `rejectionReason` - Stores the reason for rejection in the file history
- **Notification**: Sends notification to placement officer with rejection reason
- **Model Update**: Added `rejectionReason` field to `fileHistory` schema in Placement model

#### 2. File Resubmission (Placement Officer Side)
- **Endpoint**: `POST /api/placement/files/:fileId/resubmit`
- **Functionality**:
  - Validates the new file (format, duplicates, existing emails)
  - Replaces the rejected file data with new data
  - Resets status to 'pending' for admin review
  - Clears rejection reason
  - Sends notification to admin about resubmission
- **Validation**:
  - File format validation (Excel/CSV)
  - Duplicate email detection within file
  - Duplicate ID detection within file
  - Existing email check across platform

### Frontend Implementation

#### 1. Admin Panel Updates
**File**: `frontend/src/app/pannels/admin/components/placement-details.jsx`
- Added rejection reason prompt when rejecting files
- Display rejection reason in file list for rejected files
- Visual indicator with yellow background for rejection reason

#### 2. Placement Officer Panel Updates
**File**: `frontend/src/app/pannels/placement/batch-upload.jsx`
- Added resubmission modal for rejected files
- Display rejection reason in file history
- "Resubmit" button for rejected files
- Form fields for file upload, custom name, university, and batch
- Visual feedback with rejection reason display

**File**: `frontend/src/app/pannels/placement/batch-upload.css`
- Styled rejection reason display with red theme
- Styled resubmit button with orange theme
- Responsive modal design for resubmission
- Mobile-friendly layout

## User Flow

### Admin Workflow
1. Admin reviews uploaded Excel file
2. If issues found, clicks "Reject" button
3. Enters rejection reason in prompt
4. System saves rejection reason and notifies placement officer

### Placement Officer Workflow
1. Receives notification about file rejection
2. Views rejection reason in batch upload history
3. Clicks "Resubmit" button on rejected file
4. Uploads corrected Excel file
5. Fills in custom name, university, and batch information
6. Submits for admin review
7. File status changes to "pending"

## API Endpoints

### Reject File
```
PUT /api/admin/placements/:id/files/:fileId/reject
Body: { rejectionReason: string }
```

### Resubmit File
```
POST /api/placement/files/:fileId/resubmit
Body: FormData {
  studentData: File,
  customFileName: string,
  university: string,
  batch: string
}
```

## Database Schema Updates

### Placement Model - fileHistory
```javascript
{
  fileName: String,
  customName: String,
  university: String,
  batch: String,
  uploadedAt: Date,
  status: String, // 'pending', 'approved', 'rejected', 'processed'
  rejectionReason: String, // NEW FIELD
  fileData: String,
  fileType: String,
  processedAt: Date,
  candidatesCreated: Number,
  credits: Number
}
```

## Notifications

### Rejection Notification (to Placement Officer)
- **Title**: "File Rejected"
- **Message**: "Your uploaded file '[filename]' has been rejected. Reason: [reason]. You can resubmit a corrected version."
- **Type**: `file_rejected`
- **Role**: `placement`

### Resubmission Notification (to Admin)
- **Title**: "File Resubmitted"
- **Message**: "[Placement Officer Name] has resubmitted the file '[filename]' after corrections. Please review."
- **Type**: `file_resubmitted`
- **Role**: `admin`

## Validation Rules

### File Upload Validation
- File types: `.xlsx`, `.xls`, `.csv`
- Maximum size: 5MB
- Must contain actual data (not just headers)

### Data Validation
- No duplicate emails within file
- No duplicate IDs within file
- No emails already registered on platform
- All required fields must be present

## UI Components

### Rejection Reason Display
- Red-themed alert box with exclamation icon
- Shows rejection reason text
- Appears below file status in history

### Resubmit Button
- Orange-themed button with refresh icon
- Only visible for rejected files
- Opens resubmission modal

### Resubmission Modal
- File upload area
- Custom name input
- University input
- Batch input
- Cancel and Resubmit buttons
- Responsive design

## Error Handling

### Backend Errors
- Invalid file format
- Duplicate emails/IDs
- Existing emails on platform
- Missing required fields
- File too large

### Frontend Errors
- No file selected
- Missing required fields
- Upload failure
- Network errors

## Testing Checklist

- [ ] Admin can reject file with reason
- [ ] Placement officer receives rejection notification
- [ ] Rejection reason displays in file history
- [ ] Resubmit button appears for rejected files
- [ ] Resubmission modal opens correctly
- [ ] File validation works on resubmission
- [ ] Duplicate detection works
- [ ] File status changes to pending after resubmission
- [ ] Admin receives resubmission notification
- [ ] Rejection reason clears after resubmission

## Future Enhancements

1. Rich text editor for rejection reason
2. File comparison view (old vs new)
3. Rejection history tracking
4. Email notifications for rejection/resubmission
5. Bulk file rejection with reasons
6. Template rejection reasons
7. Attachment support for rejection feedback
