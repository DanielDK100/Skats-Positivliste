import XLSXService from "../services/XLSXService";
import RegistrationMail from "../mails/RegistrationMail";
import JobInterface from "./JobInterface";
import MailSetup from "../MailSetup";
import RegistrationService from "../services/RegistrationService";

enum StatusCode {
  OK = 250,
}

class SendRegistrationNotificationJob implements JobInterface {
  private filePath: string = "./public/xlsx/skats-positivliste.xlsx";

  private async processRegistrations(row: any): Promise<void> {
    const mailSetup = new MailSetup();
    const registrationsNotSent =
      await RegistrationService.fetchUnnotifiedRegistrations(row.ISIN);

    for (const registration of registrationsNotSent) {
      const mail = await new RegistrationMail(mailSetup, registration).send();

      if (parseInt(mail.slice(0, 3)) === StatusCode.OK) {
        await RegistrationService.markRegistrationAsNotified(registration);
        console.info("Registration updated");
      }
    }
  }

  public async run(): Promise<void> {
    const xlsxData = await XLSXService.fetchXLSXFileData(this.filePath);

    for (const row of xlsxData.values) {
      await this.processRegistrations(row);
    }
  }
}
export default new SendRegistrationNotificationJob();
