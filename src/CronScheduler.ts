import cron from "node-cron";
import SkatsPositivlisteJob from "./jobs/SkatsPositivlisteJob";
import SentRegistrationNotificationJob from "./jobs/SentRegistrationNotificationJob";

export default class CronScheduler {
  public startCronJobs(): void {
    // Scheduled cron jobs
    cron.schedule("0 21 * * *", async () => {
      await SkatsPositivlisteJob.main();
    });

    cron.schedule("0 18 * * *", async () => {
      await SentRegistrationNotificationJob.main();
    });

    // Use below function to debug cron jobs
    //this.debugCronJobs();
  }

  private async debugCronJobs(): Promise<void> {
    await SkatsPositivlisteJob.main();
    await SentRegistrationNotificationJob.main();
  }
}
