import express, { Express } from "express";
import dotenv from "dotenv";
import SkatsPositivlisteRoutes from "./routes/SkatsPositivlisteRoutes";
import CronScheduler from "./CronScheduler";
import { AppDataSource } from "./data-source";
import bodyParser from "body-parser";

class Server {
  private app: Express;

  constructor() {
    dotenv.config();
    this.app = express();

    this.app.use(bodyParser.urlencoded({ extended: true }));

    // Serve static files from the "public" directory
    this.app.use(express.static("public"));

    // Set up view engine
    this.app.set("view engine", "pug");

    // Routes
    this.app.use("/", SkatsPositivlisteRoutes);
  }

  private startServer(): void {
    const PORT = process.env.PORT || 3000;
    const HOST = process.env.HOST || "localhost";
    this.app.locals.env = process.env;

    this.app.listen(PORT as number, HOST, () => {
      console.log(`Running on http://${HOST}:${PORT}`);
    });
  }

  public async init(): Promise<void> {
    await AppDataSource.initialize();
    new CronScheduler().startCronJobs();
    this.startServer();
  }
}

const server = new Server();
server.init().catch((error: Error) => {
  console.error("Error during server initialization: ", error);
});
