// 这个脚本确保Netlify能正确找到index.html文件
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.join(__dirname, 'build', 'client');

// 检查build/client目录是否存在
if (!fs.existsSync(buildDir)) {
  console.error('Build目录不存在!');
  process.exit(1);
}

// 检查是否有index.html文件
if (!fs.existsSync(path.join(buildDir, 'index.html'))) {
  // 如果没有index.html但有200.html，复制它
  if (fs.existsSync(path.join(buildDir, '200.html'))) {
    console.log('正在将200.html复制为index.html...');
    fs.copyFileSync(
      path.join(buildDir, '200.html'),
      path.join(buildDir, 'index.html')
    );
  } else {
    // 如果没有现成的HTML文件，创建一个简单的index.html
    console.log('创建基本的index.html文件...');
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blueprint Gallery</title>
  <link rel="stylesheet" href="./assets/root-C96rswfo.css">
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./assets/entry.client-DESwLXQO.js"></script>
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