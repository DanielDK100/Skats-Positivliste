"use strict";

const express = require("express");
const cron = require("node-cron");
const dotenv = require("dotenv");
const skatsPositivlisteRoute = require("./routes/skatsPositivlisteRoute.js");
const handleSkatsPositivliste = require("./jobs/handleSkatsPositivliste.js");

// Load environment variables from .env file
dotenv.config();

const startCronJobs = () => {
  // Cron job to handle the skatsPositivliste
  cron.schedule("0 0 * * * ", handleSkatsPositivliste);
};

const startServer = () => {
  const app = express();

  // Serve static files from the "public" directory
  app.use(express.static("public"));

  // Set up view engine
  app.set("view engine", "pug");

  // Routes
  app.use("/", skatsPositivlisteRoute);

  // Start the server
  const PORT = process.env.PORT || 3000;
  const HOST = process.env.HOST || "localhost";
  app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
  });
};

const init = async () => {
  startCronJobs();
  startServer();
};

init().catch((error) => {
  console.error("Error during server initialization:", error);
});
