const fs = require('fs');
const path = require('path');

// 读取版本文件
const versionPath = path.join(__dirname, '../app/utils/version.ts');
const versionContent = fs.readFileSync(versionPath, 'utf8');

// 增加 build 号
const updatedContent = versionContent.replace(
    /build: (\d+)/,
    (match, build) => `build: ${parseInt(build) + 1}`
);

// 写入更新后的文件
fs.writeFileSync(versionPath, updatedContent);

console.log('✅ Build number updated'); 