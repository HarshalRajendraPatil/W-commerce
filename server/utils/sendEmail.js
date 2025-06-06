const nodemailer = require('nodemailer');

/**
 * Send email
 * @param {Object} options - Email options
 * @returns {Promise} - Nodemailer response
 */
const sendEmail = async (options) => {
  // Create reusable transporter
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    port: process.env.EMAIL_PORT,
    host: process.env.EMAIL_HOST,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  // Define email options
  const mailOptions = {
    from: `${process.env.FROM_NAME || 'W-Commerce'} <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  // Add attachments if provided
  if (options.attachments) {
    mailOptions.attachments = options.attachments;
  }

  // Send email
  const info = await transporter.sendMail(mailOptions);

  return info;
};

module.exports = sendEmail; 