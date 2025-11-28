// 这个脚本确保Netlify能正确找到index.html文件并修复200.html
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.join(__dirname, 'build', 'client');
const assetsDir = path.join(buildDir, 'assets');

// 检查build/client目录是否存在
if (!fs.existsSync(buildDir)) {
  console.error('Build目录不存在!');
  process.exit(1);
}

// 读取manifest文件来获取正确的入口点和CSS文件
let entryModule = '/assets/entry.client-BEnHcCW0.js';
let cssFile = '/assets/root-D1u4QnWi.css';

try {
  const manifestFiles = fs.readdirSync(assetsDir).filter(f => f.startsWith('manifest-') && f.endsWith('.js'));
  if (manifestFiles.length > 0) {
    const manifestPath = path.join(assetsDir, manifestFiles[0]);
    const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
    
    // 提取entry module和CSS文件
    const entryMatch = manifestContent.match(/"entry":\s*\{[^}]*"module":\s*"([^"]+)"/);
    if (entryMatch) {
      entryModule = entryMatch[1];
    }
    
    const cssMatch = manifestContent.match(/"css":\s*\["([^"]+)"/);
    if (cssMatch) {
      cssFile = cssMatch[1];
    }
    
    console.log(`找到manifest: ${manifestFiles[0]}`);
    console.log(`入口模块: ${entryModule}`);
    console.log(`CSS文件: ${cssFile}`);
  }
} catch (error) {
  console.warn('无法读取manifest文件，使用默认值:', error.message);
}

// 修复200.html文件
const html200Path = path.join(buildDir, '200.html');
if (fs.existsSync(html200Path)) {
  console.log('修复200.html文件...');
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Blueprint Gallery</title>
    <link rel="stylesheet" href="${cssFile}" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="${entryModule}"></script>
  </body>
</html>`;
  fs.writeFileSync(html200Path, htmlContent);
  console.log('✅ 200.html已修复');
}

// 检查是否有index.html文件
if (!fs.existsSync(path.join(buildDir, 'index.html'))) {
  // 如果没有index.html但有200.html，复制它
  if (fs.existsSync(html200Path)) {
    console.log('正在将200.html复制为index.html...');
    fs.copyFileSync(html200Path, path.join(buildDir, 'index.html'));
  } else {
    // 如果没有现成的HTML文件，创建一个简单的index.html
    console.log('创建基本的index.html文件...');
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blueprint Gallery</title>
  <link rel="stylesheet" href="${cssFile}">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="${entryModule}"></script>
</body>
</html>`;
    
    fs.writeFileSync(path.join(buildDir, 'index.html'), htmlContent);
  }
}

// 创建_redirects文件
console.log('创建Netlify _redirects文件...');
fs.writeFileSync(
  path.join(buildDir, '_redirects'),
  `/assets/* /assets/:splat 200
/* /index.html 200`
);

console.log('Netlify构建准备完成!'); 