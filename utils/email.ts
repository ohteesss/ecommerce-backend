import { UserType } from "../model/user";
import nodemailer from "nodemailer";

export default class Email {
  public readonly to: string;
  public readonly firstName: string;
  public readonly url: string;
  constructor(user: UserType, url: string) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.url = url;
  }

  createTransport() {
    if (process.env.NODE_ENV === "production") {
      // send email using mailgun
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST as string,
      port: parseInt(process.env.EMAIL_PORT as string, 10),
      auth: {
        user: process.env.EMAIL_USERNAME as string,
        pass: process.env.EMAIL_PASSWORD as string,
      },
    });
  }

  async sendMail(message: string, subject: string) {
    const mailOptions = {
      from: `Admin < ${process.env.EMAIL_FROM} `,
      to: this.to,
      subject,
      text: message,
      html: `<h1>${message}</h1>`,
    };

    await this.createTransport().sendMail(mailOptions);
  }

  async emailOTPNotification(OTP: string) {
    // send email with OTP
    await this.sendMail(
      `Your OTP is ${OTP}. Please verify your email`,
      "Email Verification"
    );
  }
  async emailPasswordResetToken() {
    // send email with reset token
    await this.sendMail(
      `Click on the link to reset your password ${this.url}`,
      "Password Reset Token"
    );
  }
}
