import React, { useState } from 'react';
import { testEmailJS, sendRejectionEmail, sendApprovalEmail } from '../utils/emailjs';
import EmailDebugger from '../components/EmailDebugger';
import { EmailJSConfig } from '../utils/config';
import Layout from "../components/Layout";

export function meta() {
  return [
    { title: "EmailJS Test Page" },
    { name: "description", content: "Testing EmailJS functionality" },
  ];
}

export default function EmailTestPage() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 测试发送拒绝邮件
  const handleTestEmail = async () => {
    if (!email) {
      setResult('请先输入收件人邮箱地址！');
      return;
    }

    setLoading(true);
    setResult('发送拒绝邮件中...');

    try {
      const success = await sendRejectionEmail(email, "测试项目标题");
      setResult(success ? '✅ 拒绝邮件发送成功!' : '❌ 发送失败，请查看控制台获取详细信息');
    } catch (error) {
      console.error('发送拒绝邮件失败:', error);
      setResult(`❌ 错误: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  // 测试发送批准邮件
  const handleTestApprovalEmail = async () => {
    if (!email) {
      setResult('请先输入收件人邮箱地址！');
      return;
    }

    setLoading(true);
    setResult('发送批准邮件中...');

    try {
      const success = await sendApprovalEmail(email, "测试项目标题");
      setResult(success ? '✅ 批准邮件发送成功!' : '❌ 发送失败，请查看控制台获取详细信息');
    } catch (error) {
      console.error('发送批准邮件失败:', error);
      setResult(`❌ 错误: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  // 直接运行内置测试
  const runBuiltInTest = async () => {
    if (!email) {
      setResult('请先输入收件人邮箱地址！');
      return;
    }

    setLoading(true);
    setResult('发送测试邮件中...');

    try {
      const success = await testEmailJS(email);
      setResult(success ? '✅ 测试邮件发送成功!' : '❌ 发送失败，请查看控制台获取详细信息');
    } catch (error) {
      console.error('发送测试邮件失败:', error);
      setResult(`❌ 错误: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">EmailJS 功能测试页面</h1>
        
        <div className="bg-gray-100 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-2">当前 EmailJS 配置</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="font-medium">Public Key:</div>
            <div className="font-mono">
              {EmailJSConfig.publicKey ? '已设置' : '未设置'}
            </div>
            <div className="font-medium">Service ID:</div>
            <div className="font-mono">{EmailJSConfig.serviceId ? '已设置' : '未设置'}</div>
            <div className="font-medium">Template ID:</div>
            <div className="font-mono">{EmailJSConfig.templateId ? '已设置' : '未设置'}</div>
          </div>
        </div>
        
        <div className="mb-6 bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">测试发送邮件</h2>
          
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
          
          <div className="flex space-x-2 mb-4">
            <button
              onClick={handleTestEmail}
              disabled={loading}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
            >
              发送拒绝邮件
            </button>
            <button
              onClick={handleTestApprovalEmail}
              disabled={loading}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
            >
              发送批准邮件
            </button>
            <button
              onClick={runBuiltInTest}
              disabled={loading}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
            >
              发送测试邮件
            </button>
          </div>
          
          {result && (
            <div className={`mt-4 p-3 rounded-md ${result.includes('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {result}
            </div>
          )}
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">独立调试组件</h2>
          <EmailDebugger />
        </div>
      </div>
    </Layout>
  );
} 