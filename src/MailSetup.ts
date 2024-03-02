import * as nodemailer from "nodemailer";

export default class MailSetup {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "Gmail",
      pool: true,
      host: "smtp.gmail.com",
      port: 587,
      secure: true,
      auth: {
        user: process.env.MAIL_FROM,
        pass: process.env.MAIL_AUTH_PASS,
      },
    });
  }
  public getTransporter(): nodemailer.Transporter {
    return this.transporter;
  }
}
