const adminNotification = (
  firstName: string,
  lastName: string,
  email: string,
  mobileNumber: string,
  query: string,
): string => {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>New Contact - Developer Choudhary</title>
    <style>
      body {
        background: #f6f8fa;
        margin: 0;
        padding: 0;
        font-family: 'Segoe UI', Arial, sans-serif;
        color: #222;
      }
      .email-container {
        max-width: 540px;
        margin: 32px auto;
        background: #fff;
        border-radius: 14px;
        box-shadow: 0 6px 32px rgba(0,0,0,0.07);
        overflow: hidden;
        border: 1px solid #e3e8ee;
      }
      .header {
        background: linear-gradient(90deg, #2563eb 0%, #1e40af 100%);
        padding: 32px 0 20px 0;
        text-align: center;
      }
      .header-title {
        color: #fff;
        font-size: 2.1rem;
        font-weight: 800;
        letter-spacing: 1px;
        margin: 0;
      }
      .header-sub {
        color: #dbeafe;
        font-size: 1.1rem;
        margin-top: 8px;
        margin-bottom: 0;
        font-weight: 500;
      }
      .divider {
        border: none;
        border-top: 1.5px solid #e0e7ef;
        margin: 0 32px 24px 32px;
      }
      .content {
        padding: 0 32px 24px 32px;
      }
      .greeting {
        font-size: 1.1rem;
        margin-bottom: 12px;
        color: #222;
      }
      .info-block {
        background: #f1f5f9;
        border-radius: 8px;
        padding: 18px 20px;
        margin-bottom: 18px;
        font-size: 1rem;
        color: #1e293b;
      }
      .info-label {
        font-weight: 600;
        color: #2563eb;
        min-width: 80px;
        display: inline-block;
      }
      .query-block {
        background: #e0e7ef;
        border-left: 4px solid #2563eb;
        border-radius: 6px;
        padding: 14px 18px;
        margin-bottom: 18px;
        font-size: 1rem;
        color: #334155;
      }
      .footer {
        text-align: center;
        padding: 18px 0 14px 0;
        font-size: 0.95rem;
        color: #64748b;
        background: #f8fafc;
        border-top: 1px solid #e0e7ef;
      }
      @media (max-width: 600px) {
        .email-container, .content, .divider {
          margin: 0 !important;
          padding: 0 10px !important;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <div class="header-title">Developer Choudhary</div>
        <div class="header-sub">Portfolio Contact Notification</div>
      </div>
      <hr class="divider" />
      <div class="content">
        <div class="greeting">Hi Aman,</div>
        <div style="margin-bottom: 18px;">You have received a new contact request from your portfolio website. Here are the details:</div>
        <div class="info-block">
          <div><span class="info-label">Name:</span> ${firstName} ${lastName}</div>
          <div><span class="info-label">Email:</span> ${email}</div>
          <div><span class="info-label">Phone:</span> ${mobileNumber}</div>
        </div>
        <div class="query-block">
          <div style="font-weight:600; margin-bottom: 6px;">Query:</div>
          <div>${query}</div>
        </div>
        <div style="margin-top: 18px; color: #475569;">Please respond promptly to make a great impression! 🚀</div>
      </div>
      <div class="footer">&copy; 2025 Developer Choudhary. All rights reserved.</div>
    </div>
  </body>
</html>
`;
};

export default adminNotification;
