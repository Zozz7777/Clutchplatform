const fs = require('fs');

// Read the server.js file
let content = fs.readFileSync('server.js', 'utf8');

// Split into lines
const lines = content.split('\n');

// Track seen declarations
const seen = new Set();
const cleanedLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Check if this is a route declaration
  const match = line.match(/const\s+(\w+Routes)\s*=\s*require\(/);
  
  if (match) {
    const routeName = match[1];
    
    if (seen.has(routeName)) {
      console.log(`Removing duplicate: ${routeName} at line ${i + 1}`);
      // Skip this line (don't add it to cleanedLines)
      continue;
    } else {
      seen.add(routeName);
    }
  }
  
  cleanedLines.push(line);
}

// Write the cleaned content back
fs.writeFileSync('server.js', cleanedLines.join('\n'));

console.log('Fixed all duplicate route declarations');
