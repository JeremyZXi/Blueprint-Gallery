interface EmailData {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export const sendEmail = async (emailData: EmailData) => {
  try {
    console.log('Sending email request to server:', {
      to: emailData.to,
      subject: emailData.subject
    });

    const response = await fetch('http://localhost:3000/api/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Server returned error:', result);
      throw new Error(result.details || result.error || 'Failed to send email');
    }

    console.log('Email sent successfully:', result);
    return { success: true, result };
  } catch (error: any) {
    console.error('Error sending email:', {
      message: error?.message || 'Unknown error',
      stack: error?.stack
    });
    return { success: false, error };
  }
};

// Test function to verify email configuration
export const testEmailConfig = async () => {
  console.log('Starting test email configuration...');

  const testEmail = {
    to: 'xinyu.gao@student.keystoneacademy.cn',
    subject: 'Test Email from IA Gallery',
    text: 'This is a test email to verify the email configuration.',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Test Email</h2>
        <p>This is a test email to verify the email configuration.</p>
        <p>If you receive this email, the configuration is working correctly!</p>
      </div>
    `
  };

  try {
    console.log('Attempting to send test email...');
    const result = await sendEmail(testEmail);
    console.log('Test email result:', result);
    return result;
  } catch (error: any) {
    console.error('Error sending test email:', error);
    throw error;
  }
};

// Function to send approval email
export const sendApprovalEmail = async (submission: {
  firstName: string;
  lastName: string;
  email: string;
  title: string;
}) => {
  console.log('Sending approval email to:', submission.email);

  const approvalEmail = {
    to: submission.email,
    subject: 'Your IA Submission Has Been Approved!',
    text: `Dear ${submission.firstName} ${submission.lastName},

Congratulations! Your IA submission "${submission.title}" has been approved and will be featured in the Blueprint Gallery.

You can view your submission and others in the gallery at: http://localhost:5173/gallery

Best regards,
The Blueprint Gallery Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Congratulations!</h2>
        <p>Dear ${submission.firstName} ${submission.lastName},</p>
        <p>Your IA submission "<strong>${submission.title}</strong>" has been approved and will be featured in the Blueprint Gallery.</p>
        <p>You can view your submission and others in the gallery at: <a href="http://localhost:5173/gallery">Blueprint Gallery</a></p>
        <p>Best regards,<br>The Blueprint Gallery Team</p>
      </div>
    `
  };

  try {
    console.log('Attempting to send approval email...');
    const result = await sendEmail(approvalEmail);
    console.log('Approval email result:', result);
    return result;
  } catch (error: any) {
    console.error('Error sending approval email:', error);
    throw error;
  }
};

// Function to send rejection email
export const sendRejectionEmail = async (submission: {
  firstName: string;
  lastName: string;
  email: string;
  title: string;
}) => {
  console.log('Sending rejection email to:', submission.email);

  const rejectionEmail = {
    to: submission.email,
    subject: 'Update on Your IA Submission',
    text: `Dear ${submission.firstName} ${submission.lastName},

We regret to inform you that your IA submission "${submission.title}" has not been approved for the Blueprint Gallery at this time.

If you have any questions about this decision, please don't hesitate to contact us.

Best regards,
The Blueprint Gallery Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Update on Your IA Submission</h2>
        <p>Dear ${submission.firstName} ${submission.lastName},</p>
        <p>We regret to inform you that your IA submission "<strong>${submission.title}</strong>" has not been approved for the Blueprint Gallery at this time.</p>
        <p>If you have any questions about this decision, please don't hesitate to contact us.</p>
        <p>Best regards,<br>The Blueprint Gallery Team</p>
      </div>
    `
  };

  try {
    console.log('Attempting to send rejection email...');
    const result = await sendEmail(rejectionEmail);
    console.log('Rejection email result:', result);
    return result;
  } catch (error: any) {
    console.error('Error sending rejection email:', error);
    throw error;
  }
}; 