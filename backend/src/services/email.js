const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Send welcome email
const sendWelcomeEmail = async (user) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Check-in System" <noreply@checkin.com>',
      to: user.email,
      subject: 'Welcome to Check-in System',
      html: `
        <h1>Welcome to Check-in System</h1>
        <p>Dear ${user.name},</p>
        <p>Thank you for joining our check-in system. Your account has been successfully created.</p>
        <p>Your username is: ${user.username}</p>
        <p>Please keep your login credentials secure.</p>
        <p>Best regards,<br>Check-in System Team</p>
      `
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

// Send password reset email
const sendPasswordResetEmail = async (user, tempPassword) => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"Check-in System" <noreply@checkin.com>',
      to: user.email,
      subject: 'Password Reset - Check-in System',
      html: `
        <h1>Password Reset</h1>
        <p>Dear ${user.name},</p>
        <p>Your password has been reset by an administrator.</p>
        <p>Your temporary password is: <strong>${tempPassword}</strong></p>
        <p>Please change your password immediately after logging in.</p>
        <p>Best regards,<br>Check-in System Team</p>
      `
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail
}; 