import nodemailer from "nodemailer";

/**
 * Sends an email using Nodemailer.
 *
 * @param {string} email - Recipient email address.
 * @param {string} title - Subject of the email.
 * @param {string} body - HTML body content of the email.
 * @throws {Error} - Throws an error if email sending fails.
 */
export const sendEmail = async (email: string, title: string, body: string) => {
  try {
    // Configure Nodemailer transport with SMTP settings
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email options
    const mailOptions = {
      from: '"Developer Choudhary"<aman@developerchoudhary.com>', // Sender name
      to: email, // Recipient email
      subject: title, // Email subject
      html: body, // Email content in HTML format
    };

    // Send email and return response
    const mailResponse = await transporter.sendMail(mailOptions);
    return mailResponse;
  } catch (error) {
    // Handle errors and throw a descriptive message
    console.log(error);
    throw new Error(`Error while sending email - ${error}`);
  }
};
