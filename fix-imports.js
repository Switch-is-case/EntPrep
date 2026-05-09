const fs = require('fs');
const path = require('path');

function processDirSafe(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirSafe(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      if (fullPath.includes('api')) {
        let content = fs.readFileSync(fullPath, 'utf-8');
        if (content.includes('instanceof AppError') && !content.includes('import { AppError }')) {
          const newContent = `import { AppError } from "@/lib/errors";\n` + content;
          fs.writeFileSync(fullPath, newContent, 'utf-8');
          console.log('Added import to ' + fullPath);
        }
      }
    }
  }
}

processDirSafe('./src/app/api');
