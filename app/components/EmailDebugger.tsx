import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { EmailJSConfig } from '../utils/config';
import { testEmailJS } from '../utils/emailjs';

const EmailDebugger: React.FC = () => {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendTest = async () => {
    if (!email.trim()) {
      setResult({
        success: false,
        message: '请输入收件人邮箱'
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // 使用工具函数测试邮件发送
      const success = await testEmailJS(email);
      
      setResult({
        success,
        message: success 
          ? '✅ 测试邮件发送成功！' 
          : '❌ 测试邮件发送失败，请检查控制台获取详细信息'
      });
    } catch (error) {
      console.error('测试邮件发送出错:', error);
      setResult({
        success: false,
        message: `❌ 错误: ${error instanceof Error ? error.message : '未知错误'}`
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 隐藏密钥信息的辅助函数
  const maskValue = (value: string) => {
    if (!value) return '未设置';
    if (value.length <= 8) return '********';
    return `${value.substring(0, 2)}******${value.substring(value.length - 2)}`;
  };

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold mb-4">EmailJS 测试工具</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          当前配置来源: {EmailJSConfig.publicKey ? '环境变量' : '未设置'}
        </label>
        <div className="text-xs text-gray-500 mb-4">
          <div>服务ID: {EmailJSConfig.serviceId ? '已设置' : '未设置'}</div>
          <div>模板ID: {EmailJSConfig.templateId ? '已设置' : '未设置'}</div>
          <div>公钥: {EmailJSConfig.publicKey ? '已设置' : '未设置'}</div>
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          收件人邮箱
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="输入测试用邮箱地址"
        />
      </div>
      
      <button
        onClick={handleSendTest}
        disabled={isLoading}
        className={`w-full py-2 px-4 rounded-md text-white font-medium ${
          isLoading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
        }`}
      >
        {isLoading ? '发送中...' : '发送测试邮件'}
      </button>
      
      {result && (
        <div className={`mt-4 p-3 rounded-md ${result.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {result.message}
        </div>
      )}
    </div>
  );
};

export default EmailDebugger; 