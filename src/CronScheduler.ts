import cron from "node-cron";
import SkatsPositivlisteJob from "./jobs/SkatsPositivlisteJob";

export default class CronScheduler {
  public startCronJobs(): void {
    // Cron job to handle the skatsPositivliste
    cron.schedule("0 21 * * *", async () => {
      await SkatsPositivlisteJob.main();
    });

    // Use below function to debug cron jobs
    //this.debugCronJobs();
  }

  private debugCronJobs(): void {
    SkatsPositivlisteJob.main();
  }
}
