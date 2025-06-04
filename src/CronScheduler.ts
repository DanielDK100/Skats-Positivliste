import cron from "node-cron";
import DownloadSkatsPositivlisteJob from "./jobs/DownloadSkatsPositivlisteJob";
import SendRegistrationNotificationJob from "./jobs/SendRegistrationNotificationJob";

export default class CronScheduler {
  public startCronJobs(): void {
    // Scheduled cron jobs
    cron.schedule("0 17 * * *", async () => {
      const delay = this.getRandomDelay(2, 10);
      setTimeout(async () => {
        await DownloadSkatsPositivlisteJob.run();
      }, delay);
    });

    cron.schedule("0 18 * * *", async () => {
      await SendRegistrationNotificationJob.run();
    });

    // Use below function to debug cron jobs
    if (process.env.NODE_ENV === "development") {
      this.debugCronJobs();
    }
  }

  private getRandomDelay(minMinutes: number, maxMinutes: number): number {
    const minMilliseconds = minMinutes * 60 * 1000;
    const maxMilliseconds = maxMinutes * 60 * 1000;

    // Generate a random delay within the specified range
    return Math.floor(
      Math.random() * (maxMilliseconds - minMilliseconds) + minMilliseconds
    );
  }

  private async debugCronJobs(): Promise<void> {
    await DownloadSkatsPositivlisteJob.run();
    await SendRegistrationNotificationJob.run();
  }
}
