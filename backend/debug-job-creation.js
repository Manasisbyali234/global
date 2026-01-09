// Add this to the createJob function in employerController.js to debug

console.log('=== DEBUG JOB CREATION ===');
console.log('Raw request body:', JSON.stringify(req.body, null, 2));
console.log('rolesAndResponsibilities field:', req.body.rolesAndResponsibilities);
console.log('rolesAndResponsibilities type:', typeof req.body.rolesAndResponsibilities);
console.log('rolesAndResponsibilities length:', req.body.rolesAndResponsibilities ? req.body.rolesAndResponsibilities.length : 0);

if (req.body.rolesAndResponsibilities) {
  const cleanText = req.body.rolesAndResponsibilities
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .trim();
  
  console.log('Clean text after processing:', cleanText);
  console.log('Clean text length:', cleanText.length);
  
  if (cleanText) {
    const responsibilities = cleanText
      .split(/\n|\r\n|\r/)
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^[\u2022\-\*]\s*/, '')); // Remove bullet points
    
    console.log('Final responsibilities array:', responsibilities);
  }
}
console.log('=== END DEBUG ===');