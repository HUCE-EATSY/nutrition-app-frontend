/**
 * Script để chuyển đổi giữa Mock API và Real API
 * 
 * Usage:
 *   node switch-api.js mock    // Chuyển sang Mock API
 *   node switch-api.js real    // Chuyển sang Real API
 */

const fs = require('fs');
const path = require('path');

const mode = process.argv[2];

if (!mode || !['mock', 'real'].includes(mode)) {
  console.error('❌ Usage: node switch-api.js [mock|real]');
  process.exit(1);
}

const files = [
  'app/(admin)/login.tsx',
  'app/(admin)/users/index.tsx',
  'app/(admin)/foods/index.tsx',
  'app/(admin)/exercises/index.tsx',
];

const isMock = mode === 'mock';
const fromImport = isMock ? 'adminApi' : 'adminApiMock';
const toImport = isMock ? 'adminApiMock' : 'adminApi';

console.log(`\n🔄 Switching to ${mode.toUpperCase()} API...\n`);

let changedCount = 0;

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Replace imports
  content = content.replace(
    new RegExp(`from ['"](.*)/${fromImport}['"]`, 'g'),
    `from '$1/${toImport}'`
  );
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${file}`);
    changedCount++;
  } else {
    console.log(`⏭️  Skipped: ${file} (already using ${toImport})`);
  }
});

console.log(`\n✨ Done! Changed ${changedCount} file(s).`);

if (isMock) {
  console.log(`
📝 Mock API is now active:
   - No backend needed
   - Data stored in memory
   - Login: admin@example.com / admin123
`);
} else {
  console.log(`
📝 Real API is now active:
   - Backend must be running at http://localhost:5184
   - Data stored in database
   - Make sure backend is configured correctly
`);
}
