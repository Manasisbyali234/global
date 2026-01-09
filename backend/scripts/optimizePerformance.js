const mongoose = require('mongoose');
require('dotenv').config();

async function optimizePerformance() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobzz_2025');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    
    // Optimize Jobs collection
    const jobsCollection = db.collection('jobs');
    
    console.log('Creating optimized indexes for jobs...');
    
    // Essential indexes for job queries
    const jobIndexes = [
      // Primary query index
      { key: { status: 1, createdAt: -1 }, name: 'status_created_fast' },
      // Employer lookup
      { key: { employerId: 1, status: 1 }, name: 'employer_status_fast' },
      // Category filter
      { key: { status: 1, category: 1 }, name: 'status_category_fast' },
      // Location filter
      { key: { status: 1, location: 1 }, name: 'status_location_fast' },
      // Job type filter
      { key: { status: 1, jobType: 1 }, name: 'status_jobtype_fast' },
      // Salary sorting
      { key: { 'ctc.min': 1, 'ctc.max': 1 }, name: 'salary_sort_fast' },
      // Text search
      { 
        key: { title: 'text', description: 'text' }, 
        name: 'text_search_fast',
        weights: { title: 10, description: 5 }
      }
    ];

    for (const index of jobIndexes) {
      try {
        await jobsCollection.createIndex(index.key, { 
          name: index.name,
          background: true,
          ...(index.weights && { weights: index.weights })
        });
        console.log(`✓ Created job index: ${index.name}`);
      } catch (error) {
        if (error.code === 85) {
          console.log(`- Job index already exists: ${index.name}`);
        } else {
          console.error(`✗ Failed to create job index ${index.name}:`, error.message);
        }
      }
    }

    // Optimize EmployerProfiles collection
    const employerProfilesCollection = db.collection('employerprofiles');
    
    console.log('Creating optimized indexes for employer profiles...');
    
    const profileIndexes = [
      { key: { employerId: 1 }, name: 'employer_lookup_fast' }
    ];

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

    // Optimize Employers collection
    const employersCollection = db.collection('employers');
    
    console.log('Creating optimized indexes for employers...');
    
    const employerIndexes = [
      { key: { status: 1, isApproved: 1 }, name: 'status_approved_fast' }
    ];

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

    console.log('\n✅ Performance optimization completed!');
    console.log('📈 Your job posting updates should now reflect much faster!');
    
  } catch (error) {
    console.error('❌ Error optimizing performance:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  optimizePerformance();
}

module.exports = optimizePerformance;