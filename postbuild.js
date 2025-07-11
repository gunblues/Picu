const fs = require('fs');
const path = require('path');

const manifestPath = path.resolve(__dirname, 'dist/.vite/manifest.json');
const indexPath = path.resolve(__dirname, 'index.php');

if (!fs.existsSync(manifestPath)) {
  console.error('Error: manifest.json not found. Please run `npm run build` first.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
let indexContent = fs.readFileSync(indexPath, 'utf8');

// 替換 CSS 引用
const oldCssPath = 'style.css';
if (manifest[oldCssPath]) {
  const newCssPath = `/dist/${manifest[oldCssPath]['file']}`;
  indexContent = indexContent.replace(
    `<link rel="stylesheet" href="${oldCssPath}">`,
    `<link rel="stylesheet" href="${newCssPath}">`
  );
  console.log(`Replaced CSS: ${oldCssPath} -> ${newCssPath}`);
} else {
  console.warn(`Warning: ${oldCssPath} not found in manifest.`);
}

// 替換 JavaScript 引用
const oldJsPath = 'main.js';
if (manifest[oldJsPath]) {
  const newJsPath = `/dist/${manifest[oldJsPath]['file']}`;
  indexContent = indexContent.replace(
    `<script type="module" src="./${oldJsPath}"></script>`,
    `<script type="module" src="${newJsPath}"></script>`
  );
  console.log(`Replaced JS: ${oldJsPath} -> ${newJsPath}`);
} else {
  console.warn(`Warning: ${oldJsPath} not found in manifest.`);
}

fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('index.php updated with hashed asset paths.');