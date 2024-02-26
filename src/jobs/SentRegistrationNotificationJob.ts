import { AppDataSource } from "../data-source";
import { RegistrationEntity } from "../entity/RegistrationEntity";
import XLSXService from "../services/XLSXService";
import RegistrationMail from "../mails/RegistrationMail";

class SentRegistrationNotificationJob {
  private filePath: string = "./public/xlsx/skats-positivliste.xlsx";
  private registrationRepository =
    AppDataSource.getRepository(RegistrationEntity);

  private async sentRegistrationNotification(): Promise<void> {
    const XLSXData = await XLSXService.fetchXLSXFileData(this.filePath);

    for (const row of XLSXData.values) {
      const registrationsNotSent = await this.registrationRepository.find({
        where: {
          isin: row.ISIN,
          isNotified: false,
        },
      });

      for (const registration of registrationsNotSent) {
        new RegistrationMail().sendMail(registration);

        await this.registrationRepository.save({
          ...registration,
          isNotified: true,
        });
        console.log("Registration updated");
      }
    }
  }

  public async main(): Promise<void> {
    await this.sentRegistrationNotification();
  }
}
export default new SentRegistrationNotificationJob();
