#!/usr/bin/env node

console.log('=== Deployment Debug Info ===');
console.log('Node version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('Current working directory:', process.cwd());
console.log('Environment:', process.env.NODE_ENV || 'development');

// Check if dist folder exists
const fs = require('fs');
const path = require('path');

const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  console.log('✅ dist folder exists');
  const files = fs.readdirSync(distPath);
  console.log('dist contents:', files);
  
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    console.log('✅ index.html exists in dist');
  } else {
    console.log('❌ index.html missing in dist');
  }
} else {
  console.log('❌ dist folder does not exist');
}

console.log('=== End Debug Info ==='); 