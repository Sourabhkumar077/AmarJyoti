import nodemailer from "nodemailer";

const sendEmail = async (options: {
  email: string;
  subject: string;
  message: string;
}) => {
  // 1. Transporter Create karein (Explicit Settings for Railway)
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com", // Explicit Host
    port: 465,              // Secure SSL Port (Best for Cloud)
    secure: true,           // True for port 465
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD, // App Password
    },
    // Timeout settings to prevent hanging
    connectionTimeout: 10000, // 10 seconds
  });

  // 2. Email Options Define karein
  const mailOptions = {
    from: `"Amar Jyoti Support" <${process.env.SMTP_EMAIL}>`, 
    to: options.email, 
    subject: options.subject,
    text: options.message, 
    html: `
      <div style="font-family: serif; padding: 20px; background-color: #f9f9f9;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border: 1px solid #ddd;">
          <h2 style="color: #D4AF37; text-align: center;">Amar Jyoti - Exclusive Ethenic Clothes</h2>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 16px; color: #333;">${options.message.replace(
            /\n/g,
            "<br>"
          )}</p>
          <br />
          <p style="font-size: 12px; color: #999; text-align: center;">Thank you for Connecting with us!</p>
        </div>
      </div>
    `,
  };

  // 3. Send Email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;