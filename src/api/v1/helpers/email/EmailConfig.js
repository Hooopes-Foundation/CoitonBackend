const nodemailer = require("nodemailer");

exports.sendMail = async (receiver, text, html, subject) => {
  // send mail with defined transport object
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: process.env.COMMUNITY_EMAIL,
        pass: process.env.NODEMAILER_PASS,
      },
    });
    await transporter.sendMail({
      from: `"COiTON" <${process.env.COMMUNITY_EMAIL}>`, // sender address
      to: receiver, // list of receivers
      subject: subject ?? "Email Verification", // Subject line
      text, // plain text body
      html, // html body
    });
    // console.log("Message sent: %s", JSON.stringify(info));
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
};