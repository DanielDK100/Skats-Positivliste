import { RegistrationEntity } from "../entities/RegistrationEntity";
import MailInterface from "./MailInterface";
import pug from "pug";
import MailSetup from "../MailSetup";

export default class RegistrationMail implements MailInterface {
  private mailSetup: MailSetup;
  private registration: RegistrationEntity;

  constructor(mailSetup: MailSetup, registration: RegistrationEntity) {
    this.mailSetup = mailSetup;
    this.registration = registration;
  }

  public send(): void {
    this.mailSetup.getTransporter().sendMail(
      {
        from: process.env.MAIL_FROM,
        to: this.registration.email,
        subject: `${this.registration.isin} - tilføjet til SKATS positivliste`,
        html: pug.renderFile("views/mails/registration.pug", {
          registration: this.registration,
        }),
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
