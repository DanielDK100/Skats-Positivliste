import { AppDataSource } from "../data-source";
import { RegistrationEntity } from "../entities/RegistrationEntity";
import XLSXService from "../services/XLSXService";
import RegistrationMail from "../mails/RegistrationMail";
import JobInterface from "./JobInterface";
import { Repository } from "typeorm";
import MailSetup from "../MailSetup";
import RegistrationService from "../services/RegistrationService";

class SendRegistrationNotificationJob implements JobInterface {
  private filePath: string = "./public/xlsx/skats-positivliste.xlsx";

  private async send(): Promise<void> {
    const xlsxData = await XLSXService.fetchXLSXFileData(this.filePath);

    for (const row of xlsxData.values) {
      await this.processRegistrations(row);
    }
  }

  private async processRegistrations(row: any): Promise<void> {
    const mailSetup = new MailSetup();
    const registrationsNotSent =
      await RegistrationService.fetchUnnotifiedRegistrations(row.ISIN);

    for (const registration of registrationsNotSent) {
      new RegistrationMail(mailSetup, registration).send();

      await RegistrationService.markRegistrationAsNotified(registration);
      console.info("Registration updated");
    }
  }

  public async main(): Promise<void> {
    await this.send();
  }
}
export default new SendRegistrationNotificationJob();
