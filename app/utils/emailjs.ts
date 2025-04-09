import emailjs from '@emailjs/browser';
import { EmailJSConfig } from './config';

// 初始化 EmailJS
export const initEmailJS = () => {
  try {
    console.log('🚀 初始化 EmailJS...');
    emailjs.init({
      publicKey: EmailJSConfig.publicKey,
    });
    console.log('✅ EmailJS 初始化完成');
    return true;
  } catch (error) {
    console.error('❌ EmailJS 初始化失败:', error);
    return false;
  }
};

// Template strings for different email types
const getRejectionContent = (projectTitle: string, rejectionReason: string) => {
  return `
Thank you for submitting your IB Design Technology project titled "${projectTitle}" to Blueprint Gallery.

After careful review, we regret to inform you that your project has not been selected for display in our gallery at this time. The review team has provided the following feedback:

${rejectionReason}

We appreciate your interest in Blueprint Gallery and encourage you to consider our feedback for future submissions.

Best regards,
Blueprint Gallery Team
  `;
};

const getApprovalContent = (projectTitle: string) => {
  return `
Great news! Your IB Design Technology project titled "${projectTitle}" has been approved for display in the Blueprint Gallery.

Your project will now be visible in our public gallery, where it can inspire and educate others. Thank you for your excellent work and for contributing to our community of design technology students.

Best regards,
Blueprint Gallery Team
  `;
};

// Function to send a rejection email using the template
export const sendRejectionEmail = async (recipientEmail: string, projectTitle: string, rejectionReason: string) => {
  try {
    console.log(`发送拒绝邮件到 ${recipientEmail}...`);
    const response = await emailjs.send(
      EmailJSConfig.serviceId,
      EmailJSConfig.templateId,
      {
        to_email: recipientEmail,
        to_name: recipientEmail.split('@')[0], // 使用邮箱用户名作为收件人名称
        subject: '作品审核结果通知',
        content: getRejectionContent(projectTitle, rejectionReason),
      }
    );
    console.log('✅ 拒绝邮件发送成功:', response.status);
    return true;
  } catch (error) {
    console.error('❌ 拒绝邮件发送失败:', error);
    return false;
  }
};

// Function to send approval email for the project
export const sendApprovalEmail = async (recipientEmail: string, projectTitle: string) => {
  try {
    console.log(`发送批准邮件到 ${recipientEmail}...`);
    const response = await emailjs.send(
      EmailJSConfig.serviceId,
      EmailJSConfig.templateId,
      {
        to_email: recipientEmail,
        to_name: recipientEmail.split('@')[0], // 使用邮箱用户名作为收件人名称
        subject: '恭喜！您的作品已获批准',
        content: getApprovalContent(projectTitle),
      }
    );
    console.log('✅ 批准邮件发送成功:', response.status);
    return true;
  } catch (error) {
    console.error('❌ 批准邮件发送失败:', error);
    return false;
  }
};

// Add a test function for diagnostic purposes
export const testEmailJS = async (recipientEmail: string) => {
  try {
    console.log(`测试 EmailJS 发送邮件到 ${recipientEmail}...`);
    
    // 仅记录配置是否已设置，避免泄露关键值
    console.log('配置状态:', {
      serviceId: EmailJSConfig.serviceId ? '已设置' : '未设置',
      templateId: EmailJSConfig.templateId ? '已设置' : '未设置',
      publicKey: EmailJSConfig.publicKey ? '已设置' : '未设置'
    });
    
    const response = await emailjs.send(
      EmailJSConfig.serviceId,
      EmailJSConfig.templateId,
      {
        to_email: recipientEmail,
        subject: '测试邮件',
        message: '这是一封测试邮件，用于验证 EmailJS 功能是否正常。',
      }
    );
    console.log('✅ 测试邮件发送成功:', response.status);
    return true;
  } catch (error) {
    console.error('❌ 测试邮件发送失败:', error);
    console.error('配置状态:', {
      serviceId: EmailJSConfig.serviceId ? '已设置' : '未设置',
      templateId: EmailJSConfig.templateId ? '已设置' : '未设置',
      publicKey: EmailJSConfig.publicKey ? '已设置' : '未设置'
    });
    return false;
  }
};

// 在浏览器控制台中可以运行: 
// import { testEmailJS } from './utils/emailjs'; 
// testEmailJS().then(console.log); 