// Date Format Update Helper Script
// This script helps identify all instances of toLocaleDateString in the project

const fs = require('fs');
const path = require('path');

const searchPattern = /new Date\([^)]*\)\.toLocaleDateString\([^)]*\)/g;
const frontendDir = path.join(__dirname, 'frontend', 'src', 'app');

function searchFiles(dir, results = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      searchFiles(filePath, results);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      const content = fs.readFileSync(filePath, 'utf8');
      const matches = content.match(searchPattern);
      
      if (matches && matches.length > 0) {
        results.push({
          file: filePath.replace(__dirname, ''),
          count: matches.length,
          matches: matches
        });
      }
    }
  });
  
  return results;
}

console.log('Searching for date formatting instances...\n');
const results = searchFiles(frontendDir);

console.log(`Found ${results.length} files with date formatting:\n`);
results.forEach(result => {
  console.log(`${result.file} (${result.count} instances)`);
});

console.log('\n\nTo fix these files:');
console.log('1. Add import: import { formatDate } from "../../utils/dateFormatter";');
console.log('2. Replace: new Date(variable).toLocaleDateString(...) with formatDate(variable)');
