// checkCommonJSWithGuide.js
const fs = require('fs');
const path = require('path');

const rootDir = './'; 
const commonJSFiles = [];

function scanDir(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });

  for (const file of files) {
    const fullPath = path.join(dir, file.name);

    if (file.isDirectory()) {
      scanDir(fullPath);
    } else if (file.isFile() && file.name.endsWith('.js')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (/require\(|module\.exports/.test(content)) {
        commonJSFiles.push({ path: fullPath, content });
      }
    }
  }
}

function suggestESModule(file) {
  let suggestions = file.content;

  // Convert require() to import
  suggestions = suggestions.replace(/const\s+(\w+)\s*=\s*require\(['"](.+)['"]\);?/g, (match, varName, modulePath) => {
    // Add .js extension for local files
    if (modulePath.startsWith('.') && !modulePath.endsWith('.js')) modulePath += '.js';
    return `import ${varName} from '${modulePath}';`;
  });

  // Convert module.exports to export default
  suggestions = suggestions.replace(/module\.exports\s*=\s*(\w+);?/g, 'export default $1;');

  return suggestions;
}

// Scan project
scanDir(rootDir);

// Output results
if (commonJSFiles.length > 0) {
  console.log('Files using CommonJS syntax and suggested ES Module replacements:\n');
  commonJSFiles.forEach(file => {
    console.log('--------------------------------------------');
    console.log(`File: ${file.path}`);
    console.log('--- Suggested ES Module version ---');
    console.log(suggestESModule(file));
    console.log('--------------------------------------------\n');
  });
} else {
  console.log('No CommonJS files found. All files are using ES Modules!');
}
