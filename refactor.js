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
      let changed = false;
      
      const newContent = content.replace(/import\s+\{\s*([a-zA-Z0-9_]+Service)\s*\}\s+from\s+["']@\/services\/[^"']+["'];?/g, (match, p1) => {
        changed = true;
        return `import { ${p1.trim()} } from "@/lib/container";`;
      });

      if (changed) {
        fs.writeFileSync(fullPath, newContent, 'utf-8');
        console.log('Updated: ' + fullPath);
      }
    }
  }
}

processDir('./src/app/api');
