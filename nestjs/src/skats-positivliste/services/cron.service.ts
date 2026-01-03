import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { XlsxService } from './xlsx.service';
import { RegistrationService } from './registration.service';
import { MailService } from './mail.service';
import { LoggerService } from '../../common/logger/logger.service';
import { SkatsPositivlisteService } from './skats-positivliste.service';

enum StatusCode {
  OK = 250,
}

interface XlsxDataRow {
  isin: string;
}

@Injectable()
export class CronService {
  private readonly logger: LoggerService;

  constructor(
    private configService: ConfigService,
    private xlsxService: XlsxService,
    private registrationService: RegistrationService,
    private mailService: MailService,
    private skatsPositivlisteService: SkatsPositivlisteService,
    loggerService: LoggerService,
  ) {
    this.logger = loggerService;
    this.logger.setContext(CronService.name);

    // Run jobs immediately in development mode
    if (this.configService.get('NODE_ENV') === 'development') {
      this.debugCronJobs();
    }
  }

  @Cron('0 17 * * *')
  async downloadSkatsPositivliste() {
    const delay = this.getRandomDelay(2, 10);
    setTimeout(async () => {
      await this.runDownloadJob();
    }, delay);
  }

  @Cron('0 18 * * *')
  async sendRegistrationNotifications() {
    await this.runNotificationJob();
  }

  private async debugCronJobs() {
    await this.runDownloadJob();
    await this.runNotificationJob();
  }

  private getRandomDelay(minMinutes: number, maxMinutes: number): number {
    const minMilliseconds = minMinutes * 60 * 1000;
    const maxMilliseconds = maxMinutes * 60 * 1000;

    // Generate a random delay within the specified range
    return Math.floor(
      Math.random() * (maxMilliseconds - minMilliseconds) + minMilliseconds,
    );
  }

  // Download Skats Positivliste job
  private async runDownloadJob(): Promise<void> {
    try {
      const success =
        await this.skatsPositivlisteService.downloadPositivliste();
      if (success) {
        this.logger.log('Successfully downloaded Skats Positivliste');
      } else {
        this.logger.warn('Failed to download Skats Positivliste');
      }
    } catch (error) {
      this.logger.error(
        `Error downloading Skats Positivliste: ${error.message}`,
        error.stack,
      );
    }
  }

  // Send Registration Notification job
  private async runNotificationJob(): Promise<void> {
    try {
      const filePath = this.skatsPositivlisteService.getFilePath();
      const xlsxData = await this.xlsxService.fetchXlsxFileData(filePath);

      if (!xlsxData.values.length) {
        this.logger.warn(
          'No data found in XLSX file. Skipping notification job.',
        );
        return;
      }

      for (const row of xlsxData.values) {
        const mappedRow: XlsxDataRow = {
          isin: row['ISIN-kode/-Code'],
        };

        if (!mappedRow.isin || typeof mappedRow.isin !== 'string') {
          this.logger.error(
            "Missing or invalid 'ISIN code' in row. Skipping this row.",
          );
          continue;
        }

        await this.processRegistrations(mappedRow);
      }
    } catch (error) {
      this.logger.error(
        `Error in notification job: ${error.message}`,
        error.stack,
      );
    }
  }

  private async processRegistrations(row: XlsxDataRow): Promise<void> {
    const registrationsNotSent =
      await this.registrationService.fetchUnnotifiedRegistrations(row.isin);

    // Only log if we found registrations to notify
    if (registrationsNotSent.length > 0) {
      this.logger.debug(
        `Found ${registrationsNotSent.length} unnotified registrations for ISIN ${row.isin}`,
      );
    }

    for (const registration of registrationsNotSent) {
      try {
        const mail =
          await this.mailService.sendRegistrationNotification(registration);
        if (parseInt(mail.slice(0, 3)) === StatusCode.OK) {
          await this.registrationService.markRegistrationAsNotified(
            registration,
          );
          this.logger.log(
            `Successfully sent notification for ISIN ${registration.isin} to ${registration.email}`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Failed to send notification for ISIN ${registration.isin}: ${error.message}`,
          error.stack,
        );
        // We don't mark as notified if sending fails, so it can be retried later
      }
    }
  }
}
