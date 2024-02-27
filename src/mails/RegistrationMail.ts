import * as nodemailer from "nodemailer";
import { RegistrationEntity } from "../entities/RegistrationEntity";
import MailInterface from "./MailInterface";

export default class RegistrationMail implements MailInterface {
  private transporter: nodemailer.Transporter;
  private registration: RegistrationEntity;

  constructor(registration: RegistrationEntity) {
    this.transporter = nodemailer.createTransport({
      service: "Gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: true,
      auth: {
        user: process.env.MAIL_FROM,
        pass: process.env.MAIL_AUTH_PASS,
      },
    });
    this.registration = registration;
  }

  public send(): void {
    this.transporter.sendMail(
      {
        from: process.env.MAIL_FROM,
        to: this.registration.email,
        subject: `${this.registration.isin} - tilføjet til SKATS positivliste`,
        text: `
Hej,

${this.registration.isin} er nu blevet tilføjet til SKATS positivliste.
Dobbelttjek at dette stemmer ved, at søge i positivlisten på ${process.env.SKATS_POSITIVLISTE_URL}.
Du vil ikke blive om notificeret yderligere ændringer ang. ${this.registration.isin}.

Mvh. ${process.env.SKATS_POSITIVLISTE_URL}
`,
      },
      (error, info) => {
        if (error) {
          console.error("Error sending email: ", error);
        } else {
          console.info("Email sent: ", info.response);
        }
      }
    );
  }
}
