const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf-8');
      
      const regex = /catch\s*\(\s*([a-zA-Z0-9_]+)\s*:\s*any\s*\)\s*\{([\s\S]*?)\}/g;
      const newContent = content.replace(regex, (match, varName, block) => {
        // Find if it has another closing brace inside...
        // For our simple codebase it should be fine.
        // Wait! The regex /catch\s*\(\s*([a-zA-Z0-9_]+)\s*:\s*any\s*\)\s*\{([\s\S]*?)\}/g will stop at the FIRST closing brace!
        // That means if there's an if-statement inside the catch block, it will truncate the block!
        // This is dangerous.
        return match; 
      });
    }
  }
}

// Let's do a smarter approach using a loop for braces
function processFile(fullPath) {
  let content = fs.readFileSync(fullPath, 'utf-8');
  let changed = false;
  
  const catchRegex = /catch\s*\(\s*([a-zA-Z0-9_]+)\s*:\s*any\s*\)\s*\{/g;
  let match;
  let newContent = '';
  let lastIndex = 0;
  
  while ((match = catchRegex.exec(content)) !== null) {
    changed = true;
    const startIndex = match.index;
    const blockStart = catchRegex.lastIndex;
    const varName = match[1];
    
    // Find matching brace
    let braces = 1;
    let i = blockStart;
    while (i < content.length && braces > 0) {
      if (content[i] === '{') braces++;
      if (content[i] === '}') braces--;
      i++;
    }
    const blockEnd = i - 1;
    
    let block = content.substring(blockStart, blockEnd);
    
    // Replace varName.message
    const msgRegex = new RegExp(`\\b${varName}\\.message\\b`, 'g');
    block = block.replace(msgRegex, `(${varName} instanceof Error ? ${varName}.message : "Unknown error")`);
    
    newContent += content.substring(lastIndex, startIndex);
    newContent += `catch (${varName}: unknown) {` + block + '}';
    
    lastIndex = blockEnd + 1;
  }
  
  newContent += content.substring(lastIndex);
  
  if (changed) {
    fs.writeFileSync(fullPath, newContent, 'utf-8');
    console.log('Updated: ' + fullPath);
  }
}

function processDirSafe(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirSafe(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      processFile(fullPath);
    }
  }
}

processDirSafe('./src');
