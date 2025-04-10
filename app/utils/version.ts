/**
 * 版本号配置
 * 每次发布新版本时手动更新此文件
 */
export const VERSION = {
    major: 0,
    minor: 6,
    patch: 8,
    build: 0  // 每次构建自动递增
};

export const getVersionString = () => {
    return `Version Beta ${VERSION.major}.${VERSION.minor}.${VERSION.build})`;
}; 