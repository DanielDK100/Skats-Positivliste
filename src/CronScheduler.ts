import cron from "node-cron";
import DownloadSkatsPositivlisteJob from "./jobs/DownloadSkatsPositivlisteJob";
import SendRegistrationNotificationJob from "./jobs/SendRegistrationNotificationJob";

export default class CronScheduler {
  public startCronJobs(): void {
    // Scheduled cron jobs
    cron.schedule("0 17 * * *", async () => {
      await DownloadSkatsPositivlisteJob.run();
    });

    cron.schedule("0 18 * * *", async () => {
      await SendRegistrationNotificationJob.run();
    });

    // Use below function to debug cron jobs
    if (process.env.NODE_ENV === "development") {
      this.debugCronJobs();
    }
  }

  private async debugCronJobs(): Promise<void> {
    await DownloadSkatsPositivlisteJob.run();
    //await SendRegistrationNotificationJob.run();
  }
}
