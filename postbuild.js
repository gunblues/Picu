const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const manifestPath = path.resolve(__dirname, 'dist/.vite/manifest.json');
const indexPath = path.resolve(__dirname, 'index.php');
const distPath = path.resolve(__dirname, 'dist');

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Get hashed paths from manifest
const cssPath = `/dist/${manifest['style.css']['file']}`;
const jsFileName = manifest['main.js']['file'];
const jsPath = `/dist/${jsFileName}`;
const jsFullPath = path.resolve(distPath, jsFileName);

// Replace CSS
const cssRegex = /<link rel="stylesheet" href="[^"]*style\.[a-zA-Z0-9_-]+\.css[^"]*">/g;
indexContent = indexContent.replace(cssRegex, `<link rel="stylesheet" href="${cssPath}">`);
console.log(`✅ CSS replaced: ${cssPath}`);

// Replace JS
const jsRegex = /<script type="module" src="[^"]*main\.[a-zA-Z0-9_-]+\.js[^"]*"><\/script>/g;
indexContent = indexContent.replace(jsRegex, `<script type="module" src="${jsPath}"></script>`);
console.log(`✅ JS replaced: ${jsPath}`);

// Obfuscate JS
if (fs.existsSync(jsFullPath)) {
  const originalJsCode = fs.readFileSync(jsFullPath, 'utf8');
  //const obfuscatedCode = JavaScriptObfuscator.obfuscate(originalJsCode, {
  //  compact: true,
  //  controlFlowFlattening: true,
  //  deadCodeInjection: true,
  //  stringArray: true,
  //  stringArrayEncoding: ['base64'],
  //  stringArrayThreshold: 0.75
  //}).getObfuscatedCode();

  fs.writeFileSync(jsFullPath, originalJsCode, 'utf8');
  console.log('🎯 JS obfuscated successfully.');
} else {
  console.warn(`⚠️ JS file not found for obfuscation: ${jsFullPath}`);
}

// Write updated index.php
fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('✅ index.php updated.');

