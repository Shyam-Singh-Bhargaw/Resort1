/*
 Image optimization script
 - Scans src/assets for .jpg/.jpeg/.png files
 - Generates responsive sizes (400,800,1200) in WebP and AVIF formats
 - Writes outputs to public/optimized/<basename>-{w}.{ext}

 Run with: npm run images:build
*/

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SRC_DIR = path.resolve(__dirname, '../src/assets');
const OUT_DIR = path.resolve(__dirname, '../public/optimized');
const SIZES = [400, 800, 1200];
const FORMATS = ['webp', 'avif'];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

async function processFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) return;

  const name = path.basename(filePath, ext);
  const img = sharp(filePath);

  for (const size of SIZES) {
    for (const fmt of FORMATS) {
      const outName = `${name}-${size}.${fmt}`;
      const outPath = path.join(OUT_DIR, outName);
      try {
        await img
          .resize({ width: size })
          [fmt]()
          .toFile(outPath);
        console.log('Wrote', outPath);
      } catch (err) {
        console.error('Failed to write', outPath, err);
      }
    }
  }

  // Also emit a JPEG fallback at 800
  try {
    const outFallback = path.join(OUT_DIR, `${name}-800.jpg`);
    await img.resize({ width: 800 }).jpeg({ quality: 80 }).toFile(outFallback);
    console.log('Wrote', outFallback);
  } catch (err) {
    console.error('Failed to write fallback jpeg for', filePath, err);
  }
}

async function run() {
  ensureDir(OUT_DIR);
  const files = fs.readdirSync(SRC_DIR).map(f => path.join(SRC_DIR, f));
  for (const f of files) {
    try {
      await processFile(f);
    } catch (err) {
      console.error('Error processing', f, err);
    }
  }
  console.log('Image optimization complete. Outputs in public/optimized');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
