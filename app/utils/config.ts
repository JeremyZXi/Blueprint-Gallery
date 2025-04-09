/**
 * 配置管理
 * 从环境变量获取配置，提供合理的默认值
 */

// 清理环境变量值（去除引号和空格）
const cleanEnvValue = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  // 移除首尾的引号和空格
  return value.replace(/^['"]|['"]$/g, '').trim();
};

// 获取环境变量并记录来源
const getConfigValue = (key: string, fallback?: string): string => {
  // 尝试从 import.meta.env 获取(Vite方式)
  const viteValue = typeof import.meta.env !== 'undefined' 
    ? import.meta.env[key] || import.meta.env[`VITE_${key}`]
    : undefined;
  
  // 尝试从 process.env 获取(Node.js方式)
  const nodeValue = typeof process !== 'undefined' && process.env 
    ? process.env[key] || process.env[`VITE_${key}`]
    : undefined;
  
  // 清理获取到的值
  const cleanedViteValue = cleanEnvValue(viteValue as string);
  const cleanedNodeValue = cleanEnvValue(nodeValue);
  
  // 决定使用哪个值
  let finalValue: string | undefined;
  let source = 'fallback';
  
  if (cleanedViteValue) {
    finalValue = cleanedViteValue;
    source = 'vite';
  } else if (cleanedNodeValue) {
    finalValue = cleanedNodeValue;
    source = 'node';
  } else {
    finalValue = fallback;
  }
  
  // 记录诊断信息（但不显示实际值）
  const displayValue = finalValue ? `[已设置]` : `[未设置]`;
  console.log(`配置 [${key}]: 来源=${source}, 值=${displayValue}`);
  
  return finalValue || '';
};

// EmailJS 配置
export const EmailJSConfig = {
  publicKey: getConfigValue('EMAILJS_PUBLIC_KEY', ''),
  serviceId: getConfigValue('EMAILJS_SERVICE_ID', ''),
  templateId: getConfigValue('EMAILJS_TEMPLATE_ID', ''),
};

// 其他配置项...
export const AppConfig = {
  apiUrl: getConfigValue('API_URL', 'https://api.example.com'),
  // 其他配置...
}; 