const adminNotification = (
  firstName: string,
  lastName: string,
  email: string,
  mobileNumber: string,
  query: string,
): string => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Contact - Developer Choudhary</title>
    <style>
      body {
        background: #f3f4f6;
        margin: 0;
        padding: 0;
        font-family: 'Segoe UI', Arial, sans-serif;
        color: #1e293b;
      }
      .email-card {
        max-width: 540px;
        margin: 40px auto;
        background: #fff;
        border-radius: 18px;
        box-shadow: 0 4px 24px rgba(37,99,235,0.10), 0 1.5px 8px rgba(30,64,175,0.06);
        overflow: hidden;
        border: 1px solid #e5e7eb;
      }
      .header-img {
        width: 100%;
        max-width: 80px;
        display: block;
        margin: 20px auto 0 auto;
        border-radius: 50%;
      }
      .header {
        background-color: #f1f5f9;
        padding: 20px;
        text-align: center;
      }
      .header-title {
        color: #007795;
        font-size: 2.1rem;
        font-weight: 800;
        letter-spacing: 1px;
        margin: 18px 0 0 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }
      .header-title .emoji {
        font-size: 2.2rem;
      }
      .header-sub {
        font-size: 1.1rem;
        margin-top: 8px;
        margin-bottom: 0;
        font-weight: 500;
      }
      .divider {
        border: none;
        border-top: 2px solid #e0e7ef;
        margin: 0 36px 24px 36px;
      }
      .content {
        padding: 0 36px 28px 36px;
      }
      .greeting {
        font-size: 1.15rem;
        margin: 20px 0;
        color: #1e293b;
        font-weight: 600;
      }
      .info-block {
        background: #f1f5f9;
        border-radius: 12px;
        padding: 20px 24px;
        margin-bottom: 22px;
        font-size: 1.07rem;
        color: #1e293b;
        box-shadow: 0 1px 4px rgba(37,99,235,0.04);
      }
      .info-label {
        font-weight: 700;
        color: #007795;
        min-width: 90px;
        display: inline-block;
      }
      .query-block {
        background: #e0e7ef;
        border-left: 5px solid #007795;
        border-radius: 10px;
        padding: 18px 22px;
        margin-bottom: 22px;
        font-size: 1.07rem;
        color: #334155;
        box-shadow: 0 1px 4px rgba(37,99,235,0.03);
      }
      .footer {
        text-align: center;
        padding: 20px 0 16px 0;
        font-size: 0.97rem;
        color: #64748b;
        background: #f8fafc;
        border-top: 1px solid #e0e7ef;
      }
         @media (max-width: 600px) {
        .email-card {
          margin: 0;
          border-radius: 0;
        }
        .content, .divider {
          margin: 0;
          padding: 0 8px;
        }
        .header-img {
          max-width: 60px;
          margin-top: 10px;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-card">
      <div class="header">
        <img src="https://developerchoudhary.com/icon.png" alt="Developer Choudhary Logo" class="header-img" />
        <div class="header-title">Developer Choudhary</div>
        <div class="header-sub">New Contact Request</div>
      </div>
      <hr class="divider" />
      <div class="content">
        <div class="greeting">Hi Aman,</div>
        <div style="margin-bottom: 18px; color:#334155;">You have received a new contact request from your portfolio website. Here are the details:</div>
        <div class="info-block">
          <div><span class="info-label">Name:</span> ${firstName} ${lastName}</div>
          <div><span class="info-label">Email:</span> ${email}</div>
          <div><span class="info-label">Phone:</span> ${mobileNumber}</div>
        </div>
        <div class="query-block">
          <div style="font-weight:700; margin-bottom: 8px;">💬 Query:</div>
          <div>${query}</div>
        </div>
        <div style="margin-top: 18px; color: #475569; font-size:1.01rem;">Please respond promptly to make a great impression! 🚀</div>
      </div>
      <div class="footer">&copy; 2025 Developer Choudhary. All rights reserved.</div>
    </div>
  </body>
</html>
`;
};

export const userNotification = (firstName: string): string => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Message Was Received - Developer Choudhary</title>
    <style>
      body {
        background: #f3f4f6;
        margin: 0;
        padding: 0;
        font-family: 'Segoe UI', Arial, sans-serif;
        color: #1e293b;
      }
      .email-card {
        max-width: 540px;
        margin: 40px auto;
        background: #fff;
        border-radius: 18px;
        box-shadow: 0 4px 24px rgba(37,99,235,0.10), 0 1.5px 8px rgba(30,64,175,0.06);
        overflow: hidden;
        border: 1px solid #e5e7eb;
      }
      .header-img {
        width: 100%;
        max-width: 80px;
        display: block;
        margin: 20px auto 0 auto;
        border-radius: 50%;
      }
      .header {
        background-color: #f1f5f9;
        padding: 20px;
        text-align: center;
      }
      .header-title {
        color: #007795;
        font-size: 2.1rem;
        font-weight: 800;
        letter-spacing: 1px;
        margin: 18px 0 0 0;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }
      .header-sub {
        font-size: 1.1rem;
        margin-top: 8px;
        margin-bottom: 0;
        font-weight: 500;
      }
      .divider {
        border: none;
        border-top: 2px solid #e0e7ef;
        margin: 0 36px 24px 36px;
      }
      .content {
        padding: 0 36px 28px 36px;
      }
      .greeting {
        font-size: 1.15rem;
        margin: 20px 0;
        color: #1e293b;
        font-weight: 600;
      }
      .message-block {
        background: #f1f5f9;
        border-radius: 12px;
        padding: 20px 24px;
        margin-bottom: 22px;
        font-size: 1.07rem;
        color: #1e293b;
        line-height: 1.7;
        text-align: center;
        box-shadow: 0 1px 4px rgba(37,99,235,0.04);
      }
      .info-label {
        font-weight: 700;
        color: #007795;
        min-width: 90px;
        display: inline-block;
      }
      .query-block {
        background: #e0e7ef;
        border-left: 5px solid #007795;
        border-radius: 10px;
        padding: 18px 22px;
        margin-bottom: 22px;
        font-size: 1.07rem;
        color: #334155;
        box-shadow: 0 1px 4px rgba(37,99,235,0.03);
      }
      .footer {
        text-align: center;
        padding: 20px 0 16px 0;
        font-size: 0.97rem;
        color: #64748b;
        background: #f8fafc;
        border-top: 1px solid #e0e7ef;
      }
          @media (max-width: 600px) {
        .email-card {
          margin: 0;
          border-radius: 0;
        }
        .content, .divider {
          margin: 0;
          padding: 0 8px;
        }
        .header-img {
          max-width: 60px;
          margin-top: 10px;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-card">
      <div class="header">
        <img src="https://developerchoudhary.com/icon.png" alt="Developer Choudhary Logo" class="header-img" />
        <div class="header-title">Developer Choudhary</div>
        <div class="header-sub">Thank You for Reaching Out!</div>
      </div>
      <hr class="divider" />
      <div class="content">
        <div class="greeting">Hello ${firstName},</div>
        <div class="message-block">
          Thank you for reaching out through my portfolio website.<br />
          I sincerely appreciate your interest and the time you took to connect with me.<br /><br />
          Your message is important, and I will personally review it and respond at the earliest opportunity.<br /><br />
          If your inquiry is urgent, please feel free to reach out via my contact information on the website.
        </div>
        <div class="query-block">
          Wishing you a great day ahead and looking forward to speaking with you soon! 🌟
        </div>
      </div>
      <div class="footer">&copy; 2025 Developer Choudhary. All rights reserved.</div>
    </div>
  </body>
</html>
`;
};

export default adminNotification;
