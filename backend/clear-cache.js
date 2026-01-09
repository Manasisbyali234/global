require('dotenv').config();
const { cache } = require('./utils/cache');

console.log('Clearing cache...');
cache.clear();
console.log('Cache cleared successfully!');
process.exit(0);