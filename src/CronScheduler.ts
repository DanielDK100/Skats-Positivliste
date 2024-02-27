import cron from "node-cron";
import DownloadSkatsPositivlisteJob from "./jobs/DownloadSkatsPositivlisteJob";
import SendRegistrationNotificationJob from "./jobs/SendRegistrationNotificationJob";

export default class CronScheduler {
  public startCronJobs(): void {
    // Scheduled cron jobs
    cron.schedule("0 21 * * *", async () => {
      await DownloadSkatsPositivlisteJob.main();
    });

    cron.schedule("0 18 * * *", async () => {
      await SendRegistrationNotificationJob.main();
    });

    // Use below function to debug cron jobs
    if (process.env.NODE_ENV === "development") {
      //this.debugCronJobs();
    }
  }

  private async debugCronJobs(): Promise<void> {
    await DownloadSkatsPositivlisteJob.main();
    await SendRegistrationNotificationJob.main();
  }
}
