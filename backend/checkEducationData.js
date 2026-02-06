const mongoose = require('mongoose');
require('dotenv').config();

const CandidateProfile = require('./models/CandidateProfile');

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Find a profile with education data
    const profile = await CandidateProfile.findOne({ 'education.0': { $exists: true } });
    
    if (profile) {
      console.log('\n=== Education Data Structure ===');
      console.log(JSON.stringify(profile.education, null, 2));
    } else {
      console.log('No education data found');
    }
    
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
