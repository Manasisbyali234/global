const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tale_jobportal');

async function optimizeGridPerformance() {
  try {
    console.log('🚀 Starting grid performance optimization...');
    
    const db = mongoose.connection.db;
    
    // Optimize Jobs collection indexes
    console.log('📊 Optimizing Jobs collection indexes...');
    const jobsCollection = db.collection('jobs');
    
    // Create compound indexes for common queries
    await jobsCollection.createIndex({ 
      status: 1, 
      createdAt: -1 
    }, { 
      name: 'status_createdAt_idx',
      background: true 
    });
    
    await jobsCollection.createIndex({ 
      status: 1, 
      employerId: 1, 
      createdAt: -1 
    }, { 
      name: 'status_employer_createdAt_idx',
      background: true 
    });
    
    await jobsCollection.createIndex({ 
      status: 1, 
      location: 1, 
      createdAt: -1 
    }, { 
      name: 'status_location_createdAt_idx',
      background: true 
    });
    
    await jobsCollection.createIndex({ 
      status: 1, 
      jobType: 1, 
      createdAt: -1 
    }, { 
      name: 'status_jobType_createdAt_idx',
      background: true 
    });
    
    await jobsCollection.createIndex({ 
      status: 1, 
      category: 1, 
      createdAt: -1 
    }, { 
      name: 'status_category_createdAt_idx',
      background: true 
    });
    
    // Optimize Employers collection indexes
    console.log('🏢 Optimizing Employers collection indexes...');
    const employersCollection = db.collection('employers');
    
    await employersCollection.createIndex({ 
      status: 1, 
      isApproved: 1, 
      createdAt: -1 
    }, { 
      name: 'status_approved_createdAt_idx',
      background: true 
    });
    
    await employersCollection.createIndex({ 
      companyName: 1 
    }, { 
      name: 'companyName_idx',
      background: true 
    });
    
    // Optimize EmployerProfiles collection indexes
    console.log('📋 Optimizing EmployerProfiles collection indexes...');
    const employerProfilesCollection = db.collection('employerprofiles');
    
    await employerProfilesCollection.createIndex({ 
      employerId: 1 
    }, { 
      name: 'employerId_idx',
      background: true 
    });
    
    // Check and report index usage
    console.log('📈 Checking index statistics...');
    
    const jobIndexStats = await jobsCollection.indexStats();
    console.log('Jobs collection indexes:', jobIndexStats.length);
    
    const employerIndexStats = await employersCollection.indexStats();
    console.log('Employers collection indexes:', employerIndexStats.length);
    
    const profileIndexStats = await employerProfilesCollection.indexStats();
    console.log('EmployerProfiles collection indexes:', profileIndexStats.length);
    
    // Analyze query performance
    console.log('🔍 Analyzing query performance...');
    
    // Test job query performance
    const jobQueryStart = Date.now();
    await jobsCollection.find({ 
      status: { $in: ['active', 'pending'] } 
    }).limit(10).toArray();
    const jobQueryTime = Date.now() - jobQueryStart;
    console.log(`Job query time: ${jobQueryTime}ms`);
    
    // Test employer query performance
    const employerQueryStart = Date.now();
    await employersCollection.find({ 
      status: 'active', 
      isApproved: true 
    }).limit(10).toArray();
    const employerQueryTime = Date.now() - employerQueryStart;
    console.log(`Employer query time: ${employerQueryTime}ms`);
    
    console.log('✅ Grid performance optimization completed successfully!');
    
    // Performance recommendations
    console.log('\n📋 Performance Recommendations:');
    console.log('1. Job queries should complete in <50ms');
    console.log('2. Employer queries should complete in <30ms');
    console.log('3. Consider adding more specific indexes if queries are slow');
    console.log('4. Monitor query performance regularly');
    
    if (jobQueryTime > 50) {
      console.log('⚠️  Job queries are slower than recommended');
    }
    
    if (employerQueryTime > 30) {
      console.log('⚠️  Employer queries are slower than recommended');
    }
    
  } catch (error) {
    console.error('❌ Error optimizing grid performance:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run optimization
optimizeGridPerformance();