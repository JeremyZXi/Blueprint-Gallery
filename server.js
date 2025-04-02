import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Debug log to check if password is loaded
console.log('Email password loaded:', process.env.EMAIL_PASSWORD ? 'Yes' : 'No');

const app = express();
app.use(cors());
app.use(express.json());

// Create SMTP transporter
const transporter = nodemailer.createTransport({
  host: 'smtp.exmail.qq.com',  // Your school's SMTP server
  port: 465,              // Common SMTP port, might need to adjust
  secure: true,          // true for 465, false for other ports
  auth: {
    user: 'blueprint.gallery@keycas.cn',
    pass: process.env.EMAIL_PASSWORD  // We'll set this in .env
  }
});

// Test the SMTP connection
transporter.verify(function(error, success) {
  if (error) {
    console.log('SMTP connection error:', error);
  } else {
    console.log('SMTP server is ready to send emails');
  }
});

app.post('/api/email', async (req, res) => {
  console.log('Received email request:', {
    to: req.body.to,
    subject: req.body.subject
  });

  try {
    const { to, subject, text, html } = req.body;

    const mailOptions = {
      from: '"IA Gallery" <blueprint.gallery@keycas.cn>',
      to,
      subject,
      text,
      html
    };

    console.log('Attempting to send email...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info);
    
    res.json({ 
      success: true, 
      messageId: info.messageId,
      response: info.response 
    });
  } catch (error) {
    console.error('Error sending email:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ 
      success: false, 
      error: 'Failed to send email',
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 