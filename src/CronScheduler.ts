import cron from "node-cron";
import DownloadSkatsPositivlisteJob from "./jobs/DownloadSkatsPositivlisteJob";
import SendRegistrationNotificationJob from "./jobs/SendRegistrationNotificationJob";

export default class CronScheduler {
  public startCronJobs(): void {
    // Scheduled cron jobs
    cron.schedule("0 17 * * *", async () => {
      const delay = this.getRandomDelay();
      setTimeout(async () => {
        await DownloadSkatsPositivlisteJob.run();
      }, delay);
    });

    cron.schedule("0 18 * * *", async () => {
      await SendRegistrationNotificationJob.run();
    });

    // Use below function to debug cron jobs
    if (process.env.NODE_ENV === "development") {
      //this.debugCronJobs();
    }
  }

  private getRandomDelay(): number {
    // Random delay between 0 and 5 minutes (in milliseconds)
    return Math.floor(Math.random() * 5 * 60 * 1000);
  }

  private async debugCronJobs(): Promise<void> {
    await DownloadSkatsPositivlisteJob.run();
    await SendRegistrationNotificationJob.run();
  }
}
