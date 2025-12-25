const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const privateDir = path.join(root, 'private_docs');

if (!fs.existsSync(privateDir)) fs.mkdirSync(privateDir);

const files = fs.readdirSync(root);
const mdFiles = files.filter(f => f.endsWith('.md') || f.toLowerCase() === 'readme');

const skip = new Set(['LICENSE', 'CHANGELOG.md']);

mdFiles.forEach((f) => {
  if (skip.has(f)) return;
  const src = path.join(root, f);
  const dest = path.join(privateDir, f);
  try {
    fs.renameSync(src, dest);
    console.log(`Moved ${f} -> private_docs/${f}`);
  } catch (err) {
    console.error(`Failed to move ${f}:`, err.message);
  }
});

console.log('Move complete.');
