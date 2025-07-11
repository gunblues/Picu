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

// 取得新的 CSS 和 JS 雜湊檔路徑
const newCssPath = `/dist/${manifest['style.css']['file']}`;
const newJsPath = `/dist/${manifest['main.js']['file']}`;

// 取代 CSS
const cssRegex = /<link rel="stylesheet" href="(?:\.\/|\/dist\/assets\/)?style(?:\.[a-zA-Z0-9]+)?\.css(?:\?[a-zA-Z0-9=.]+)?">/g;
indexContent = indexContent.replace(cssRegex, `<link rel="stylesheet" href="${newCssPath}">`);
console.log(`Replaced CSS: style.css -> ${newCssPath}`);

// 取代 JS：這次包含整個 <script> 標籤
const jsRegex = /<script type="module" src="(?:\.\/|\/dist\/assets\/)?main(?:\.[a-zA-Z0-9]+)?\.js(?:\?[a-zA-Z0-9=.]+)?"><\/script>/g;
indexContent = indexContent.replace(jsRegex, `<script type="module" src="${newJsPath}"></script>`);
console.log(`Replaced JS: main.js -> ${newJsPath}`);

// 寫回 index.php
fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('index.php updated with hashed asset paths.');
