const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    // Fix backtick followed by forward slash
    content = content.replace(/`\$\{process\.env\.REACT_APP_API_URL \|\| 'http:\/\/localhost:5000\/api'\}`\//g, "`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/");
    
    // Fix double backticks
    content = content.replace(/``\$\{process\.env\.REACT_APP_API_URL/g, "`${process.env.REACT_APP_API_URL");
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Fixed: ${filePath}`);
      return true;
    }
  } catch (err) {
    console.error(`Error: ${filePath}:`, err.message);
  }
  return false;
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  let count = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules')) {
      count += walkDir(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      if (fixFile(filePath)) count++;
    }
  });
  
  return count;
}

const srcDir = path.join(__dirname, 'src');
const fixed = walkDir(srcDir);
console.log(`\nTotal files fixed: ${fixed}`);
