import XLSXService from "../services/XLSXService";
import RegistrationMail from "../mails/RegistrationMail";
import JobInterface from "./JobInterface";
import MailSetup from "../MailSetup";
import RegistrationService from "../services/RegistrationService";

enum StatusCode {
  OK = 250,
}

interface XLSXDataRowInterface {
  isin: string;
}

class SendRegistrationNotificationJob implements JobInterface {
  private filePath: string = "./public/xlsx/skats-positivliste.xlsx";

  private async processRegistrations(row: XLSXDataRowInterface): Promise<void> {
    const mailSetup = new MailSetup();

    const registrationsNotSent =
      await RegistrationService.fetchUnnotifiedRegistrations(row.isin);

    for (const registration of registrationsNotSent) {
      //const mail = await new RegistrationMail(mailSetup, registration).send();

      /*if (parseInt(mail.slice(0, 3)) === StatusCode.OK) {
      }*/
      await RegistrationService.markRegistrationAsNotified(registration);
      console.info("Registration updated");
    }
  }

  public async run(): Promise<void> {
    const xlsxData = await XLSXService.fetchXLSXFileData(this.filePath);

    for (const row of xlsxData.values) {
      const mappedRow: XLSXDataRowInterface = {
        isin: row['ISIN-kode'],
      };

      if (!mappedRow.isin || typeof mappedRow.isin !== 'string') {
        console.error("Missing or invalid 'ISIN-kode'");

        break;
      }

      await this.processRegistrations(mappedRow);
    }
  }
}
export default new SendRegistrationNotificationJob();