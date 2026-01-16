# Quick Guide: Ensuring Credits Display Correctly

## For Placement Officers

### Problem
You uploaded a student Excel file, but the credits are showing as 0 in the dashboard.

### Solution
Follow these steps to ensure credits display correctly:

## Step 1: Check Your Excel File Format

Your Excel file should have a column for credits. Use one of these column names:

✅ **Recommended Column Names:**
- `Credits Assigned`
- `Available Credits`
- `Credits`
- `Credit`

### Example Excel Format:
```
| ID  | Candidate Name | Email           | Phone      | Course | Credits Assigned |
|-----|---------------|-----------------|------------|--------|------------------|
| 101 | John Doe      | john@email.com  | 9876543210 | CSE    | 100              |
| 102 | Jane Smith    | jane@email.com  | 9876543211 | IT     | 150              |
| 103 | Bob Johnson   | bob@email.com   | 9876543212 | ECE    | 120              |
```

## Step 2: What If My Excel Doesn't Have Credits Column?

**Don't worry!** The system will automatically use:
1. File-level credits (set by admin when approving your file)
2. Your default placement credits
3. If neither exists, it will show 0

**Action:** Contact your admin to set file-level credits for your uploaded files.

## Step 3: Verify Credits Are Displaying

1. Log in to your Placement Dashboard
2. Go to **"Student Directory"** tab
3. Look at the **"Credits"** column
4. Hover over the credits badge to see the tooltip

### What You Should See:
- ✅ Credits showing as numbers (e.g., 100, 150, 200)
- ✅ Tooltip on hover: "Available Credits: 100"
- ❌ NOT all zeros

## Step 4: Troubleshooting

### If Credits Still Show as 0:

**Check 1: Excel Column Name**
- Open your Excel file
- Verify you have a column named "Credits Assigned" or "Credits"
- Make sure the column has numeric values (not text)

**Check 2: File Status**
- Go to **"Batch Upload"** tab
- Check if your file status is "Processed"
- If status is "Pending", wait for admin approval

**Check 3: Browser Console**
- Press F12 to open browser console
- Look for any error messages
- Share these with your admin if you see errors

**Check 4: Contact Admin**
- Ask admin to set file-level credits for your uploaded file
- Provide your file name and upload date

## Step 5: Best Practices

### When Creating Excel Files:

1. ✅ **Always include a Credits column**
   - Column name: "Credits Assigned"
   - Values: Numeric only (e.g., 100, 150, 200)

2. ✅ **Use consistent formatting**
   - Don't mix text and numbers in credits column
   - Don't use special characters (e.g., "100 credits" ❌, "100" ✅)

3. ✅ **Verify before uploading**
   - Open Excel file and check credits column
   - Ensure all students have credits assigned
   - Remove any empty rows

4. ✅ **Fill all required fields**
   - Course Name
   - University
   - Batch
   - All student details

### Sample Excel Template:

Download the sample template from your dashboard:
- Go to **"Batch Upload"** tab
- Click **"Download Sample Data"** button
- Use this template for your student data

## Common Issues & Solutions

### Issue 1: Credits showing as 0 for all students
**Solution:** 
- Check if Excel has credits column
- Ask admin to set file-level credits
- Re-upload file with credits column

### Issue 2: Some students have credits, others don't
**Solution:**
- Check Excel file for empty cells in credits column
- Fill in missing credits
- Re-upload the file

### Issue 3: Credits not updating after re-upload
**Solution:**
- Clear browser cache (Ctrl + Shift + Delete)
- Refresh the page (F5)
- Log out and log back in

### Issue 4: Different credits than what's in Excel
**Solution:**
- Admin may have updated file-level credits
- Contact admin to verify
- Check if you're viewing the correct file

## Need Help?

### Contact Your Admin If:
- Credits still show as 0 after following all steps
- You see error messages in browser console
- File status is stuck on "Pending" for more than 24 hours
- You need to update credits for existing students

### Information to Provide:
1. Your placement officer email
2. File name that was uploaded
3. Upload date and time
4. Screenshot of the issue
5. Browser console errors (if any)

## Quick Checklist

Before uploading a new file:
- [ ] Excel has "Credits Assigned" column
- [ ] All credits are numeric values
- [ ] No empty rows in the file
- [ ] All required fields are filled
- [ ] File size is under 10MB
- [ ] Course Name is selected
- [ ] University is selected
- [ ] Batch information is provided

After uploading:
- [ ] File appears in Upload History
- [ ] Status shows as "Pending"
- [ ] Wait for admin approval
- [ ] Check Student Directory after approval
- [ ] Verify credits are displaying correctly

## Summary

**Key Points to Remember:**
1. Always include a "Credits Assigned" column in your Excel file
2. Use numeric values only (no text)
3. If no credits column, admin can set file-level credits
4. Check Student Directory tab to verify credits display
5. Contact admin if issues persist

**The system now automatically:**
- Checks multiple column name variations
- Falls back to file-level credits if needed
- Falls back to placement-level credits if needed
- Handles both numeric and text values
- Shows 0 if no credits found anywhere

---

**Last Updated:** [Current Date]
**Version:** 1.0
**Support:** Contact your system administrator
