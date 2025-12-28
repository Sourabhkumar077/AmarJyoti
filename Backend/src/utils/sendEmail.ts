// Backend/src/utils/sendEmail.ts

const sendEmail = async (options: {
  email: string;
  subject: string;
  message: string;
}) => {
  const brevoApiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.SMTP_FROM_EMAIL || "support@amarjyoti.com";
  const senderName = "Amar Jyoti Support";

  if (!brevoApiKey) {
    console.error("BREVO_API_KEY is missing in environment variables");
    return;
  }

  const url = "https://api.brevo.com/v3/smtp/email";

  const data = {
    sender: {
      name: senderName,
      email: senderEmail,
    },
    to: [
      {
        email: options.email,
        name: options.email.split("@")[0], 
      },
    ],
    subject: options.subject,
    htmlContent: `
      <div style="font-family: serif; padding: 20px; background-color: #f9f9f9;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 20px; border: 1px solid #ddd;">
          <h2 style="color: #D4AF37; text-align: center;">Amar Jyoti</h2>
          <hr style="border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 16px; color: #333;">${options.message.replace(
            /\n/g,
            "<br>"
          )}</p>
          <br />
          <p style="font-size: 12px; color: #999; text-align: center;">Thank you for Shopping!</p>
        </div>
      </div>
    `,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "api-key": brevoApiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Brevo API Error:", JSON.stringify(errorData));
    } else {
      console.log(`Email sent successfully to ${options.email} via Brevo API`);
    }
  } catch (error) {
    console.error("Network Error sending email:", error);
  }
};

export default sendEmail;