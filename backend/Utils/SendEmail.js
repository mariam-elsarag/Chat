import nodemailer from "nodemailer";
import fs from "fs";

class Email {
  constructor(user, url, otpCode) {
    this.to = user.email;
    this.firstName = user.full_name;
    this.otpCode = otpCode;
    this.from = `Chat <${process.env.EMAIL_FROM}>`;
    this.url = url;
  }
  createNewTransport() {
    return nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendResetEmail() {
    let template = fs.readFileSync(
      "../BACKEND/Views/Email_Templates/resetEmail.html",
      "utf-8"
    );
    const replacements = {
      name: this.firstName,
      resetLink: this.url,
      otpCode: this.otpCode,
    };
    Object.keys(replacements).forEach((key) => {
      const value = replacements[key];
      template = template.replace(new RegExp(`{{${key}}}`, "g"), value);
    });
    await this.send(template, "OTP code (valid for 10 minutes)");
  }

  async send(html, subject) {
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
    };

    // Send the email
    await this.createNewTransport().sendMail(mailOptions);
  }
}
export default Email;