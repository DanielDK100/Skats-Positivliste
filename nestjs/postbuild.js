// postbuild.js
// Copies the views directory to dist after build
const fs = require('fs');
const path = require('path');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy views directory
const viewsSrcDir = path.join(__dirname, 'views');
const viewsDestDir = path.join(__dirname, 'dist', 'src', 'views');

// Ensure the destination directory exists
if (!fs.existsSync(viewsDestDir)) {
  fs.mkdirSync(viewsDestDir, { recursive: true });
}

copyRecursiveSync(viewsSrcDir, viewsDestDir);
console.log('Views copied to dist/src/views');

// Also copy public directory to ensure static files work
const publicSrcDir = path.join(__dirname, 'public');
const publicDestDir = path.join(__dirname, 'dist', 'src', 'public');

// Ensure the destination directory exists
if (!fs.existsSync(publicDestDir)) {
  fs.mkdirSync(publicDestDir, { recursive: true });
}

copyRecursiveSync(publicSrcDir, publicDestDir);
console.log('Public files copied to dist/src/public');
