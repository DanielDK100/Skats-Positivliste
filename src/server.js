"use strict";
require("dotenv").config();
const express = require("express");
const cron = require("node-cron");
const skatsPositivlisteRoute = require("./routes/skatsPositivlisteRoute.js");
const handleSkatsPositivliste = require("./cronjobs/handleSkatsPositivliste.js");

// Constants
const PORT = process.env.PORT;
const HOST = process.env.HOST;

// App
const app = express();

cron.schedule("0 0 * * * *", function () {
  handleSkatsPositivliste();
});

app.use(express.static("public"));
app.use(function (req, res, next) {
  next();
});
app.set("view engine", "pug");

app.use("/", skatsPositivlisteRoute);

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
