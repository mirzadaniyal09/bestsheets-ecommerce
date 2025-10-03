const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

// Create nodemailer transporter for SMTP
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Send email using SendGrid
const sendEmailWithSendGrid = async (to, subject, html, text = null) => {
  try {
    const msg = {
      to,
      from: process.env.FROM_EMAIL,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
    };

    await sgMail.send(msg);
    return { success: true };
  } catch (error) {
    throw new Error(`SendGrid email failed: ${error.message}`);
  }
};

// Send email using SMTP
const sendEmailWithSMTP = async (to, subject, html, text = null) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    throw new Error(`SMTP email failed: ${error.message}`);
  }
};

// Main send email function (uses SendGrid if available, otherwise SMTP)
const sendEmail = async (to, subject, html, text = null) => {
  try {
    if (process.env.SENDGRID_API_KEY) {
      return await sendEmailWithSendGrid(to, subject, html, text);
    } else {
      return await sendEmailWithSMTP(to, subject, html, text);
    }
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

// Email templates
const emailTemplates = {
  // Welcome email template
  welcome: (userName) => ({
    subject: 'Welcome to Bedsheet Store!',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1 style="color: #333;">Welcome to Bedsheet Store!</h1>
        <p>Hello ${userName},</p>
        <p>Thank you for joining Bedsheet Store! We're excited to help you find the perfect bedding for your home.</p>
        <p>Browse our collection of premium bedsheets, pillowcases, and more.</p>
        <a href="${process.env.FRONTEND_URL}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 16px 0;">Shop Now</a>
        <p>Best regards,<br>The Bedsheet Store Team</p>
      </div>
    `,
  }),

  // Order confirmation template
  orderConfirmation: (order) => ({
    subject: `Order Confirmation #${order._id}`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1 style="color: #333;">Order Confirmation</h1>
        <p>Thank you for your order! Here are the details:</p>
        
        <div style="background: #f8f9fa; padding: 16px; margin: 16px 0; border-radius: 4px;">
          <h3>Order #${order._id}</h3>
          <p><strong>Total: $${order.totalPrice}</strong></p>
          <p>Status: ${order.orderStatus}</p>
        </div>

        <h3>Items Ordered:</h3>
        <ul>
          ${order.orderItems.map(item => `
            <li>${item.name} - Qty: ${item.qty} - $${item.price}</li>
          `).join('')}
        </ul>

        <h3>Shipping Address:</h3>
        <p>
          ${order.shippingAddress.address}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.postalCode}<br>
          ${order.shippingAddress.country}
        </p>

        <p>We'll send you another email when your order ships!</p>
        <p>Best regards,<br>The Bedsheet Store Team</p>
      </div>
    `,
  }),

  // Shipping notification template
  orderShipped: (order) => ({
    subject: `Your Order #${order._id} Has Shipped!`,
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1 style="color: #333;">Your Order Has Shipped!</h1>
        <p>Great news! Your order is on its way.</p>
        
        <div style="background: #f8f9fa; padding: 16px; margin: 16px 0; border-radius: 4px;">
          <h3>Order #${order._id}</h3>
          ${order.trackingNumber ? `<p><strong>Tracking Number: ${order.trackingNumber}</strong></p>` : ''}
          <p>Estimated delivery: 3-5 business days</p>
        </div>

        <a href="${process.env.FRONTEND_URL}/orders/${order._id}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 16px 0;">Track Order</a>
        
        <p>Best regards,<br>The Bedsheet Store Team</p>
      </div>
    `,
  }),

  // Password reset template
  passwordReset: (resetUrl) => ({
    subject: 'Password Reset Request',
    html: `
      <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
        <h1 style="color: #333;">Password Reset Request</h1>
        <p>You requested a password reset for your Bedsheet Store account.</p>
        
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 16px 0;">Reset Password</a>
        
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this reset, please ignore this email.</p>
        
        <p>Best regards,<br>The Bedsheet Store Team</p>
      </div>
    `,
  }),
};

// Helper functions for sending specific emails
const sendWelcomeEmail = async (userEmail, userName) => {
  const template = emailTemplates.welcome(userName);
  return await sendEmail(userEmail, template.subject, template.html);
};

const sendOrderConfirmationEmail = async (userEmail, order) => {
  const template = emailTemplates.orderConfirmation(order);
  return await sendEmail(userEmail, template.subject, template.html);
};

const sendOrderShippedEmail = async (userEmail, order) => {
  const template = emailTemplates.orderShipped(order);
  return await sendEmail(userEmail, template.subject, template.html);
};

const sendPasswordResetEmail = async (userEmail, resetUrl) => {
  const template = emailTemplates.passwordReset(resetUrl);
  return await sendEmail(userEmail, template.subject, template.html);
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendPasswordResetEmail,
  emailTemplates,
};