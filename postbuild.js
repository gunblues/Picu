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

// 获取新的 CSS 和 JS 路径
const newCssPath = `/dist/${manifest['style.css']['file']}`;
const newJsPath = `/dist/${manifest['main.js']['file']}`;

// 替换 CSS 引用
// Regex to match:
// <link rel="stylesheet" href="style.css">
// <link rel="stylesheet" href="/dist/assets/style.HASH.css">
// The `(?:...)` creates a non-capturing group.
// `\.` matches a literal dot.
// `[a-zA-Z0-9]+` matches the hash.
// `\?` matches a literal question mark.
const cssRegex = /<link rel="stylesheet" href="(?:\.\/|\/dist\/assets\/)?style(?:\.[a-zA-Z0-9]+)?\.css(?:\?[a-zA-Z0-9=.]+)?">/g;
indexContent = indexContent.replace(cssRegex, `<link rel="stylesheet" href="${newCssPath}">`);
console.log(`Replaced CSS: style.css -> ${newCssPath}`);

// 替换 JavaScript 引用
// Regex to match:
// <script type="module" src="./main.js"></script>
// <script type="module" src="/dist/assets/main.HASH.js"></script>
const jsRegex = /<script type="module" src="(?:\.\/|\/dist\/assets\/)?main(?:\.[a-zA-Z0-9]+)?\.js(?:\?[a-zA-Z0-9=.]+)?"><\/script>/g;
indexContent = indexContent.replace(jsRegex, `<script type="module" src="${newJsPath}">`);
console.log(`Replaced JS: main.js -> ${newJsPath}`);

fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('index.php updated with hashed asset paths.');