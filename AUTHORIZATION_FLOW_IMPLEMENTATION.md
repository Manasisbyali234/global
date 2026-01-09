# Authorization Letter Approval Flow Implementation

## Overview
This implementation enables approved authorization company names to appear as dropdown options in the job posting form for consultant employers.

## Flow Description

### 1. Admin Approval Process (http://localhost:3000/admin/employer-details/)
- Admin reviews employer profiles with uploaded authorization letters
- Each authorization letter has a `status` field: 'pending', 'approved', 'rejected'
- Admin can approve/reject individual authorization letters
- Each letter includes a `companyName` field

### 2. Job Posting Process (http://localhost:3000/employer/post-job)
- When consultant employers create jobs, they see approved company names in dropdown
- Only companies from approved authorization letters are shown
- If no approved companies exist, fallback to manual input

## Technical Implementation

### Backend Changes

#### 1. Route Addition
**File:** `backend/routes/employer.js`
```javascript
// Added new route for getting approved authorization companies
router.get('/approved-authorization-companies', employerController.getApprovedAuthorizationCompanies);
```

#### 2. Controller Method (Already Exists)
**File:** `backend/controllers/employerController.js`
```javascript
exports.getApprovedAuthorizationCompanies = async (req, res) => {
  try {
    const profile = await EmployerProfile.findOne({ employerId: req.user._id });
    
    if (!profile || !profile.authorizationLetters) {
      return res.json({ success: true, companies: [] });
    }
    
    // Filter approved authorization letters and extract company names
    const approvedCompanies = profile.authorizationLetters
      .filter(letter => letter.status === 'approved')
      .map(letter => letter.companyName)
      .filter(name => name && name.trim() !== '');
    
    res.json({ success: true, companies: approvedCompanies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

#### 3. Database Schema (Already Exists)
**File:** `backend/models/EmployerProfile.js`
```javascript
authorizationLetters: [{
  fileName: { type: String },
  fileData: { type: String }, // Base64 encoded document
  uploadedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedAt: { type: Date },
  rejectedAt: { type: Date },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },
  companyName: { type: String } // Company name for each authorization letter
}]
```

### Frontend Changes

#### 1. State Management
**File:** `frontend/src/app/pannels/employer/components/jobs/emp-post-job.jsx`
```javascript
// Added state for approved companies
const [approvedCompanies, setApprovedCompanies] = useState([]);
```

#### 2. API Call Function
```javascript
const fetchApprovedCompanies = async () => {
  try {
    const token = localStorage.getItem('employerToken');
    const data = await safeApiCall('http://localhost:5000/api/employer/approved-authorization-companies', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (data.success) {
      setApprovedCompanies(data.companies || []);
    }
  } catch (error) {
    if (error.name === 'AuthError') {
      showWarning('Session expired. Please login again.');
      localStorage.removeItem('employerToken');
      window.location.href = '/login';
      return;
    }
    console.error('Failed to fetch approved companies:', error);
  }
};
```

#### 3. UI Component Update
```javascript
// Company name field now shows dropdown for approved companies
{approvedCompanies.length > 0 ? (
  <select
    style={{...input, borderColor: formData.companyName ? '#10b981' : '#dc2626', cursor: 'pointer'}}
    value={formData.companyName}
    onChange={(e) => update({ companyName: e.target.value })}
    required
  >
    <option value="" disabled>Select Approved Company</option>
    {approvedCompanies.map((company, index) => (
      <option key={index} value={company}>
        {company}
      </option>
    ))}
  </select>
) : (
  // Fallback to manual input if no approved companies
  <input
    style={{...input, borderColor: formData.companyName ? '#10b981' : '#dc2626'}}
    placeholder="e.g., Tech Solutions Inc."
    value={formData.companyName}
    onChange={(e) => update({ companyName: e.target.value })}
    required
  />
)}
```

## User Experience Flow

### For Consultants:
1. **Upload Authorization Letters**: Consultants upload authorization letters with company names
2. **Wait for Approval**: Admin reviews and approves the letters
3. **Post Jobs**: When posting jobs, approved company names appear in dropdown
4. **Select Company**: Choose from pre-approved companies instead of manual entry

### For Admins:
1. **Review Profiles**: Access employer details page
2. **Approve Letters**: Review and approve authorization letters
3. **Company Names Available**: Approved company names become available for job posting

## Benefits

1. **Streamlined Process**: No need to manually type company names
2. **Consistency**: Ensures consistent company naming across job posts
3. **Compliance**: Only approved companies can be used for job posting
4. **User Experience**: Dropdown is faster and reduces errors
5. **Fallback Support**: Manual input still available if no approved companies

## Testing

Run the test script to verify the implementation:
```bash
node test-authorization-flow.js
```

This will show:
- Existing authorization letters and their status
- List of approved companies
- Expected API response format

## API Endpoints

### Get Approved Authorization Companies
- **URL**: `GET /api/employer/approved-authorization-companies`
- **Auth**: Required (Employer token)
- **Response**: 
  ```json
  {
    "success": true,
    "companies": ["Company A", "Company B", "Company C"]
  }
  ```

## Files Modified

1. `backend/routes/employer.js` - Added new route
2. `frontend/src/app/pannels/employer/components/jobs/emp-post-job.jsx` - Updated UI and logic
3. `test-authorization-flow.js` - Created test script (new file)

## Notes

- The `getApprovedAuthorizationCompanies` controller method already existed
- The database schema already supported authorization letters with approval status
- The implementation is backward compatible - manual input is still available
- Only consultant employers will see this feature (when `employerType === 'consultant'`)