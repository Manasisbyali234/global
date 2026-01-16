const mongoose = require('mongoose');
const Candidate = require('./models/Candidate');
const Placement = require('./models/Placement');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tale_jobportal', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkCandidateCredits() {
  try {
    // Find all candidates and show their registration method and credits
    const candidates = await Candidate.find({})
      .select('name email registrationMethod credits placementId')
      .populate('placementId', 'name collegeName');
    
    console.log('=== ALL CANDIDATES ===');
    candidates.forEach(candidate => {
      console.log({
        name: candidate.name,
        email: candidate.email,
        registrationMethod: candidate.registrationMethod,
        credits: candidate.credits,
        placement: candidate.placementId ? {
          name: candidate.placementId.name,
          college: candidate.placementId.collegeName
        } : null
      });
    });
    
    // Find candidates with credits > 0
    const candidatesWithCredits = await Candidate.find({ credits: { $gt: 0 } })
      .select('name email registrationMethod credits placementId')
      .populate('placementId', 'name collegeName');
    
    console.log('\n=== CANDIDATES WITH CREDITS > 0 ===');
    candidatesWithCredits.forEach(candidate => {
      console.log({
        name: candidate.name,
        email: candidate.email,
        registrationMethod: candidate.registrationMethod,
        credits: candidate.credits,
        placement: candidate.placementId ? {
          name: candidate.placementId.name,
          college: candidate.placementId.collegeName
        } : null
      });
    });
    
    // Find placement candidates
    const placementCandidates = await Candidate.find({ registrationMethod: 'placement' })
      .select('name email registrationMethod credits placementId')
      .populate('placementId', 'name collegeName');
    
    console.log('\n=== PLACEMENT CANDIDATES ===');
    placementCandidates.forEach(candidate => {
      console.log({
        name: candidate.name,
        email: candidate.email,
        registrationMethod: candidate.registrationMethod,
        credits: candidate.credits,
        placement: candidate.placementId ? {
          name: candidate.placementId.name,
          college: candidate.placementId.collegeName
        } : null
      });
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkCandidateCredits();