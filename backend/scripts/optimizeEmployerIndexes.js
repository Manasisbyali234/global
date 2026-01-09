const mongoose = require('mongoose');
require('dotenv').config();

async function optimizeEmployerIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobzz_2025');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const employersCollection = db.collection('employers');
    const employerProfilesCollection = db.collection('employerprofiles');

    // Employer indexes
    const employerIndexes = [
      { key: { status: 1, isApproved: 1, createdAt: -1 }, name: 'status_approved_created' },
      { key: { email: 1 }, name: 'email_unique' },
      { key: { companyName: 1 }, name: 'company_name' },
      { key: { employerType: 1 }, name: 'employer_type' },
      { key: { companyName: 'text' }, name: 'company_text_search' }
    ];

    console.log('Creating employer indexes...');
    for (const index of employerIndexes) {
      try {
        await employersCollection.createIndex(index.key, { 
          name: index.name,
          background: true
        });
        console.log(`✓ Created employer index: ${index.name}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`- Employer index already exists: ${index.name}`);
        } else {
          console.error(`✗ Failed to create employer index ${index.name}:`, error.message);
        }
      }
    }

    // Employer profile indexes
    const profileIndexes = [
      { key: { employerId: 1 }, name: 'employer_id_lookup' },
      { key: { companyName: 1 }, name: 'profile_company_name' },
      { key: { industry: 1 }, name: 'industry_filter' },
      { key: { location: 1 }, name: 'location_filter' }
    ];

    console.log('\nCreating employer profile indexes...');
    for (const index of profileIndexes) {
      try {
        await employerProfilesCollection.createIndex(index.key, { 
          name: index.name,
          background: true
        });
        console.log(`✓ Created profile index: ${index.name}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`- Profile index already exists: ${index.name}`);
        } else {
          console.error(`✗ Failed to create profile index ${index.name}:`, error.message);
        }
      }
    }

    console.log('\nEmployer index optimization completed!');
    
  } catch (error) {
    console.error('Error optimizing employer indexes:', error);
  } finally {
    await mongoose.disconnect();
  }
}

if (require.main === module) {
  optimizeEmployerIndexes();
}

module.exports = optimizeEmployerIndexes;