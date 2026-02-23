// checkCommonJS.js (CommonJS version)
const fs = require('fs');
const path = require('path');

// Root directory to scan (change if needed)
const rootDir = './'; 

// Array to collect files using CommonJS
const commonJSFiles = [];

// Function to recursively scan directories
function scanDir(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      scanDir(fullPath);
    } else if (file.isFile() && file.name.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (/require\(|module\.exports/.test(content)) {
        commonJSFiles.push(fullPath);
      }
    }
  }
}

// Start scanning
scanDir(rootDir);

// Output results
if (commonJSFiles.length > 0) {
  console.log('Files using CommonJS syntax:\n');
  commonJSFiles.forEach(file => console.log(file));
} else {
  console.log('No CommonJS files found. All files are using ES Modules!');
}
