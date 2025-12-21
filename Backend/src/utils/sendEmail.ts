import nodemailer from 'nodemailer';

const sendEmail = async (options: { email: string; subject: string; message: string }) => {
  // 1. Transporter Create karein (Postman)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL, 
      pass: process.env.SMTP_PASSWORD, 
    },
  });

  // 2. Email Options Define karein
  const mailOptions = {
    from: `"Amar Jyoti Support" <${process.env.SMTP_EMAIL}>`, // Sender Name
    to: options.email, // Receiver
    subject: options.subject,
    text: options.message, // Plain Text Version
    // HTML Version 
    html: `
      <div style="font-family: serif; padding: 20px; background-color: #f9f9f9;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border: 1px solid #ddd;">
          <h2 style="color: #D4AF37; text-align: center;">Amar Jyoti</h2>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 16px; color: #333;">${options.message.replace(/\n/g, '<br>')}</p>
          <br />
          <p style="font-size: 12px; color: #999; text-align: center;">Thank you for shopping with us!</p>
        </div>
      </div>
    `
  };

  // 3. Send Email
  await transporter.sendMail(mailOptions);
};

export default sendEmail;