require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    console.log('MONGODB_URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI);
    
    console.log('✓ Connected successfully');
    console.log('Database:', mongoose.connection.name);
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections found:', collections.length);
    collections.forEach(col => console.log('  -', col.name));
    
    for (const col of collections) {
      const count = await mongoose.connection.db.collection(col.name).countDocuments();
      console.log(`\n${col.name}: ${count} documents`);
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('✗ Connection failed:', error.message);
  }
}

testConnection();
