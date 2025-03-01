import nodemailer from "nodemailer";

/**
 * Sends an email using Nodemailer.
 *
 * @param {string} email - Recipient email address.
 * @param {string} title - Subject of the email.
 * @param {string} body - HTML body content of the email.
 * @returns {Promise<object>} - Returns the response from the email transporter.
 * @throws {Error} - Throws an error if email sending fails.
 */
export const sendEmail = async (email: string, title: string, body: string) => {
  try {
    // Configure Nodemailer transport with SMTP settings
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST, // SMTP host
      auth: {
        user: process.env.MAIL_USER, // SMTP username
        pass: process.env.MAIL_PASS, // SMTP password
      },
    });

    // Email options
    const mailOptions = {
      from: "Developer Choudhary", // Sender name
      to: email, // Recipient email
      subject: title, // Email subject
      html: body, // Email content in HTML format
    };

    // Send email and return response
    const mailResponse = await transporter.sendMail(mailOptions);
    return mailResponse;
  } catch (error) {
    // Handle errors and throw a descriptive message
    throw new Error(`Error while sending email - ${error}`);
  }
};
