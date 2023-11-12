import express, { Express } from "express";
import dotenv from "dotenv";
dotenv.config();
import skatsPositivlisteRoute from "./routes/skatsPositivlisteRoute";
import { startCronJobs } from "./cron";

const startServer = () => {
  const app: Express = express();

  // Serve static files from the "public" directory
  app.use(express.static("public"));

  // Set up view engine
  app.set("view engine", "pug");

  // Routes
  app.use("/", skatsPositivlisteRoute);

  // Start the server
  const PORT = process.env.PORT || 3000;
  const HOST = process.env.HOST || "localhost";
  app.locals.env = process.env;
  app.listen(PORT as number, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
  });
};

const init = async () => {
  startCronJobs();
  startServer();
};

init().catch((error: Error) => {
  console.error("Error during server initialization:", error);
});
