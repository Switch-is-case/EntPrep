const fs = require('fs');
const path = require('path');

function processFile(fullPath) {
  let content = fs.readFileSync(fullPath, 'utf-8');
  let changed = false;
  
  const catchRegex = /catch\s*\(\s*([a-zA-Z0-9_]+)\s*:\s*unknown\s*\)\s*\{/g;
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
    
    let block = `
    if (${varName} instanceof AppError) {
      return NextResponse.json(
        { error: ${varName}.message, details: ${varName}.details },
        { status: ${varName}.statusCode }
      );
    }
    console.error("API Error:", ${varName});
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  `;
    
    newContent += content.substring(lastIndex, startIndex);
    newContent += `catch (${varName}: unknown) {` + block + '}';
    
    lastIndex = blockEnd + 1;
  }
  
  newContent += content.substring(lastIndex);
  
  if (changed) {
    if (!newContent.includes('AppError')) {
      newContent = `import { AppError } from "@/lib/errors";\n` + newContent;
    }
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
      if (fullPath.includes('api')) {
        processFile(fullPath);
      }
    }
  }
}

processDirSafe('./src/app/api');
