// Direct API call to update candidate credits
async function updateCandidateCredits(email, credits) {
  try {
    const response = await fetch('http://localhost:5000/api/admin/candidates/update-credits', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
      },
      body: JSON.stringify({
        email: email,
        credits: credits
      })
    });

    const result = await response.json();
    console.log('Update result:', result);
    return result;
  } catch (error) {
    console.error('Error updating credits:', error);
  }
}

// Usage: updateCandidateCredits('candidate@email.com', 50);