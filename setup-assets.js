const fs = require('fs');
const path = require('path');

const sourceAssets = path.join(__dirname, '..', 'assets');
const targetAssets = path.join(__dirname, 'public', 'assets');

console.log('Setting up assets...');
console.log('Source:', sourceAssets);
console.log('Target:', targetAssets);

if (!fs.existsSync(sourceAssets)) {
  console.error('ERROR: Source assets folder not found at:', sourceAssets);
  console.log('Please ensure the assets folder exists in the parent directory.');
  process.exit(1);
}

// Create target directory if it doesn't exist
if (!fs.existsSync(path.dirname(targetAssets))) {
  fs.mkdirSync(path.dirname(targetAssets), { recursive: true });
}

// Function to copy directory recursively
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

try {
  // Remove target if it exists
  if (fs.existsSync(targetAssets)) {
    console.log('Removing existing assets directory...');
    fs.rmSync(targetAssets, { recursive: true, force: true });
  }
  
  // Copy assets
  console.log('Copying assets folder...');
  copyRecursiveSync(sourceAssets, targetAssets);
  console.log('✓ Assets copied successfully!');
  console.log('Next steps:');
  console.log('  1. Run: npm install');
  console.log('  2. Run: npm run dev');
} catch (error) {
  console.error('ERROR copying assets:', error.message);
  process.exit(1);
}

