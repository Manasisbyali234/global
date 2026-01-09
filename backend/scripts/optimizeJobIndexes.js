const mongoose = require('mongoose');
require('dotenv').config();

async function optimizeJobIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/jobzz_2025');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const jobsCollection = db.collection('jobs');

    // Drop existing indexes (except _id)
    const existingIndexes = await jobsCollection.indexes();
    console.log('Existing indexes:', existingIndexes.map(idx => idx.name));

    // Create optimized compound indexes
    const indexes = [
      { key: { status: 1, createdAt: -1 }, name: 'status_createdAt' },
      { key: { status: 1, employerId: 1, createdAt: -1 }, name: 'status_employerId_createdAt' },
      { key: { status: 1, category: 1, createdAt: -1 }, name: 'status_category_createdAt' },
      { key: { status: 1, location: 1, createdAt: -1 }, name: 'status_location_createdAt' },
      { key: { status: 1, jobType: 1, createdAt: -1 }, name: 'status_jobType_createdAt' },
      { key: { status: 1, category: 1, location: 1, createdAt: -1 }, name: 'status_category_location_createdAt' },
      { key: { 'ctc.min': 1, 'ctc.max': 1 }, name: 'ctc_salary_sort' },
      { key: { employerId: 1 }, name: 'employerId_lookup' },
      { 
        key: { 
          title: 'text', 
          description: 'text', 
          requiredSkills: 'text' 
        }, 
        name: 'text_search_optimized',
        weights: {
          title: 10,
          description: 5,
          requiredSkills: 3
        }
      }
    ];

    console.log('Creating optimized indexes...');
    
    for (const index of indexes) {
      try {
        await jobsCollection.createIndex(index.key, { 
          name: index.name,
          background: true,
          ...(index.weights && { weights: index.weights })
        });
        console.log(`✓ Created index: ${index.name}`);
      } catch (error) {
        if (error.code === 85) { // Index already exists
          console.log(`- Index already exists: ${index.name}`);
        } else {
          console.error(`✗ Failed to create index ${index.name}:`, error.message);
        }
      }
    }

    // Verify indexes
    const newIndexes = await jobsCollection.indexes();
    console.log('\nFinal indexes:');
    newIndexes.forEach(idx => {
      console.log(`- ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    console.log('\nIndex optimization completed!');
    
  } catch (error) {
    console.error('Error optimizing indexes:', error);
  } finally {
    await mongoose.disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  optimizeJobIndexes();
}

module.exports = optimizeJobIndexes;