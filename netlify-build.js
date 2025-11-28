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
let manifestFile = '/assets/manifest-1a7d84b6.js';

try {
  const manifestFiles = fs.readdirSync(assetsDir).filter(f => f.startsWith('manifest-') && f.endsWith('.js'));
  if (manifestFiles.length > 0) {
    const manifestFileName = manifestFiles[0];
    manifestFile = `/assets/${manifestFileName}`;
    const manifestPath = path.join(assetsDir, manifestFileName);
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
    
    console.log(`找到manifest: ${manifestFileName}`);
    console.log(`入口模块: ${entryModule}`);
    console.log(`CSS文件: ${cssFile}`);
    console.log(`Manifest文件: ${manifestFile}`);
  }
} catch (error) {
  console.warn('无法读取manifest文件，使用默认值:', error.message);
}

// 创建HTML内容模板 - React Router v7需要先加载manifest
const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Blueprint Gallery</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="alternate icon" href="/favicon.ico" />
    <link rel="stylesheet" href="${cssFile}" />
  </head>
  <body>
    <div id="root"></div>
    <script src="${manifestFile}"></script>
    <script type="module" src="${entryModule}"></script>
  </body>
</html>`;

// 修复或创建200.html文件
const html200Path = path.join(buildDir, '200.html');
console.log('修复/创建200.html文件...');
fs.writeFileSync(html200Path, htmlContent);
console.log('✅ 200.html已修复');

// 始终创建index.html文件（Netlify默认查找index.html）
const htmlIndexPath = path.join(buildDir, 'index.html');
console.log('创建index.html文件...');
fs.writeFileSync(htmlIndexPath, htmlContent);
console.log('✅ index.html已创建');

// 创建_redirects文件
console.log('创建Netlify _redirects文件...');
fs.writeFileSync(
  path.join(buildDir, '_redirects'),
  `/assets/* /assets/:splat 200
/* /index.html 200`
);

// 复制 favicon 文件到构建输出目录
const publicDir = path.join(__dirname, 'public');
const faviconSvg = path.join(publicDir, 'favicon.svg');
const faviconIco = path.join(publicDir, 'favicon.ico');

if (fs.existsSync(faviconSvg)) {
  fs.copyFileSync(faviconSvg, path.join(buildDir, 'favicon.svg'));
  console.log('✅ favicon.svg已复制');
}

if (fs.existsSync(faviconIco)) {
  fs.copyFileSync(faviconIco, path.join(buildDir, 'favicon.ico'));
  console.log('✅ favicon.ico已复制');
}

console.log('Netlify构建准备完成!'); 