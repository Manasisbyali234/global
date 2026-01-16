const mongoose = require('mongoose');
const Candidate = require('./models/Candidate');
const Placement = require('./models/Placement');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tale_jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function updatePlacementCredits() {
  try {
    // Update all placement candidates to have 3 credits (default)
    const result = await Candidate.updateMany(
      { 
        registrationMethod: 'placement',
        credits: 0 // Only update those with 0 credits
      },
      { 
        $set: { credits: 3 } 
      }
    );
    
    console.log(`Updated ${result.modifiedCount} placement candidates with 3 credits`);
    
    // Verify the update
    const updatedCandidates = await Candidate.find({ 
      registrationMethod: 'placement' 
    }).select('name email credits');
    
    console.log('\n=== UPDATED PLACEMENT CANDIDATES ===');
    updatedCandidates.forEach(candidate => {
      console.log({
        name: candidate.name,
        email: candidate.email,
        credits: candidate.credits
      });
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

updatePlacementCredits();