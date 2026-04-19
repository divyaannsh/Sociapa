import nodemailer from 'nodemailer';

// Create a transporter object using SMTP transport
export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send a weekly snapshot email to a client
 * @param {string} toEmail - Recipient email address
 * @param {object} clientData - Data to display in the email
 * @returns {Promise} - Resolves when sent
 */
export const sendWeeklySnapshot = async (toEmail, clientData) => {
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h1 style="color: #667eea; margin: 0;">Sociapa Docs</h1>
        <p style="color: #666;">Weekly Performance Snapshot</p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin-top: 0; color: #333;">Hello ${clientData.clientName || 'Valued Client'},</h2>
        <p style="color: #555;">Here is a brief overview of your campaign performance for the last 7 days.</p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #555;"><b>Total Spend</b></td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; color: #333; font-weight: bold;">₹${clientData.spend || '0.00'}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #555;"><b>Impressions</b></td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; color: #333; font-weight: bold;">${clientData.impressions || '0'}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #555;"><b>Clicks</b></td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; color: #333; font-weight: bold;">${clientData.clicks || '0'}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; color: #555;"><b>AVG CPM</b></td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; color: #333; font-weight: bold;">₹${clientData.cpm || '0.00'}</td>
        </tr>
      </table>

      <div style="text-align: center; margin-top: 30px;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" 
           style="background-color: #667eea; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
          View Full Dashboard
        </a>
      </div>
      
      <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #999;">
        <p>This is an automated report from the Sociapa Analytics System.</p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"Sociapa Analytics" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `Weekly Performance Snapshot - Sociapa`,
    html: htmlContent,
  };

  return transporter.sendMail(mailOptions);
};
