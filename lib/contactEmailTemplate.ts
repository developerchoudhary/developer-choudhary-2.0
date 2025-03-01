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
    <title>New User Contact - Developer Choudhary</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        font-size: 16px;
        line-height: 1.6;
        color: #333;
        margin: 0;
        padding: 0;
        background-color: #f4f4f4;
      }
      .container {
        max-width: 600px;
        margin: 20px auto;
        padding: 25px;
        background-color: #ffffff;
        border-radius: 10px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        text-align: center;
      }
      .logo {
        font-size: 1.8rem;
        font-weight: 800;
        color: #007bff;
        margin-bottom: 15px;
      }
      .message {
        font-size: 26px;
        font-weight: bold;
        color: #333;
        margin-bottom: 20px;
      }
      .body {
        font-size: 18px;
        color: #555;
        margin-bottom: 20px;
      }
      .user-details {
        background-color: #f9f9f9;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0px 3px 6px rgba(0, 0, 0, 0.1);
        text-align: left;
      }
      .info {
        font-size: 16px;
        margin-bottom: 15px;
      }
      .highlight {
        font-weight: bold;
        color: #007bff;
      }
      .footer {
        margin-top: 20px;
        font-size: 14px;
        color: #777;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo">Developer Choudhary</div>
      <div class="message">✨ New User Contact!</div>
      <div class="body">
        <p>Hello Aman,</p>
        <p>You've received a new message from a user on your website! Here are the details:</p>
        <div class="user-details">
          <div class="info">
            <p><strong>Name:</strong> <span class="highlight">${firstName} ${lastName}</span></p>
            <p><strong>Email:</strong> <span class="highlight">${email}</span></p>
            <p><strong>Phone:</strong> <span class="highlight">${mobileNumber}</span></p>
          </div>
          <p><strong>Query:</strong></p>
          <p>${query}</p>
        </div>
        <p>Make sure to respond promptly and leave a great impression. 🚀</p>
      </div>
      <div class="footer">&copy; 2025 Developer Choudhary. All rights reserved.</div>
    </div>
  </body>
</html>
`;
};

export default adminNotification;
