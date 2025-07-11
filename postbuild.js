const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('javascript-obfuscator');

const manifestPath = path.resolve(__dirname, 'dist/.vite/manifest.json');
const indexPath = path.resolve(__dirname, 'index.php');
const distPath = path.resolve(__dirname, 'dist');

if (!fs.existsSync(manifestPath)) {
  console.error('Error: manifest.json not found. Please run `npm run build` first.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
let indexContent = fs.readFileSync(indexPath, 'utf8');

// 取得 hashed 檔案路徑
const cssPath = `/dist/${manifest['style.css']['file']}`;
const jsFileName = manifest['main.js']['file'];
const jsPath = `/dist/${jsFileName}`;
const jsFullPath = path.resolve(distPath, jsFileName);

// 替換 CSS 引用
const cssRegex = /<link rel="stylesheet" href="(?:\.\/|\/dist\/assets\/)?style(?:\.[a-zA-Z0-9]+)?\.css(?:\?[a-zA-Z0-9=.]+)?">/g;
indexContent = indexContent.replace(cssRegex, `<link rel="stylesheet" href="${cssPath}">`);
console.log(`✅ CSS replaced: ${cssPath}`);

// 替換 JS 引用
const jsRegex = /<script type="module" src="(?:\.\/|\/dist\/assets\/)?main(?:\.[a-zA-Z0-9]+)?\.js(?:\?[a-zA-Z0-9=.]+)?"><\/script>/g;
indexContent = indexContent.replace(jsRegex, `<script type="module" src="${jsPath}"></script>`);
console.log(`✅ JS replaced: ${jsPath}`);

// 混淆 JS
if (fs.existsSync(jsFullPath)) {
  const originalJsCode = fs.readFileSync(jsFullPath, 'utf8');
  const obfuscatedCode = JavaScriptObfuscator.obfuscate(originalJsCode, {
    compact: true,
    controlFlowFlattening: true,
    deadCodeInjection: true,
    stringArray: true,
    stringArrayEncoding: ['base64'],
    stringArrayThreshold: 0.75
  }).getObfuscatedCode();

  fs.writeFileSync(jsFullPath, obfuscatedCode, 'utf8');
  console.log('🎯 JS obfuscated successfully.');
} else {
  console.warn(`⚠️ JS file not found for obfuscation: ${jsFullPath}`);
}

// 寫入 index.php
fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('✅ index.php updated.');
