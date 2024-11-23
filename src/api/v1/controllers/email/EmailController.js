const { CheckBadRequest } = require("../../validations");
const { MessageResponse } = require("../../helpers");
const { sendMail } = require("../../helpers/email/EmailConfig");

exports.sendEmail = async (req, res, next) => {
  //check for errors
  const errors = CheckBadRequest(req, res, next);
  if (errors) return next(errors);
  const { message, receiver } = req.body;

  try {
    const result = await sendMail(receiver, "", constructMail(message));
    if (result.success) {
      MessageResponse.successResponse(res, "Email sent", 201, {});
    } else {
      MessageResponse.errorResponse(res, "Email not sent", 422, {});
    }
  } catch (error) {
    console.log(error);
    MessageResponse.errorResponse(
      res,
      "internal server error",
      500,
      error.message
    );
  }
};

function constructMail(message) {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
        color: #333;
      }
      .otp {
        background-color: #f1f1f1;
        padding: 10px 20px;
        font-size: 24px;
        letter-spacing: 4px;
        border-radius: 5px;
        display: inline-block;
        margin: 20px 0;
      }
      .container {
        max-width: 600px;
        margin: 50px auto;
        background-color: #ffffff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        text-align: center;
      }
      h1 {
        color: #4CAF50;
      }
      p {
        font-size: 16px;
        line-height: 1.5;
        margin: 20px 0;
      }
      .btn {
        background-color: #4CAF50;
        color: white;
        padding: 15px 25px;
        text-decoration: none;
        border-radius: 5px;
        font-size: 18px;
        display: inline-block;
      }
      .btn:hover {
        background-color: #45a049;
      }
      footer {
        margin-top: 20px;
        font-size: 12px;
        color: #999;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Email Verification</h1>
      <p>${message}</p>
      <footer>
        <p>&copy; ${new Date().getFullYear()} COiTON. All rights reserved.</p>
      </footer>
    </div>
  </body>
  </html>
  `;
}
