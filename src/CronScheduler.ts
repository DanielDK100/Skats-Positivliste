import cron from "node-cron";
import DownloadSkatsPositivlisteJob from "./jobs/DownloadSkatsPositivlisteJob";
import SentRegistrationNotificationJob from "./jobs/SentRegistrationNotificationJob";

export default class CronScheduler {
  public startCronJobs(): void {
    // Scheduled cron jobs
    cron.schedule("0 21 * * *", async () => {
      await DownloadSkatsPositivlisteJob.main();
    });

    cron.schedule("* * * * *", async () => {
      await SentRegistrationNotificationJob.main();
    });

    // Use below function to debug cron jobs
    //this.debugCronJobs();
  }

  private async debugCronJobs(): Promise<void> {
    await DownloadSkatsPositivlisteJob.main();
    await SentRegistrationNotificationJob.main();
  }
}
