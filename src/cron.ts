import cron from "node-cron";
import handleSkatsPositivliste from "./jobs/handleSkatsPositivliste";

export const startCronJobs = () => {
  // Cron job to handle the skatsPositivliste
  cron.schedule("0 2 * * *", handleSkatsPositivliste);
};

if (process.env.NODE_ENV === "development") {
  // Use below function to debug cron job
  // handleSkatsPositivliste();
}
