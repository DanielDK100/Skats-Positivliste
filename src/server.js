"use strict";
require("dotenv").config();
const express = require("express");
const https = require("https");
const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const cron = require("node-cron");

const skatsPositivlisteRoute = require("./routes/skatsPositivlisteRoute.js");
const { last } = require("lodash");

// Constants
const PORT = process.env.PORT;
const HOST = process.env.HOST;

// App
const app = express();

cron.schedule("0 0 * * * *", function () {
  (async () => {
    // Scrapes the href and date of the list from Skats website
    const response = await fetch(
      process.env.SKAT_URL + "data.aspx?oid=2244641"
    );
    const body = await response.text();
    const dom = new JSDOM(body);
    const href = dom.window.document.querySelector(
      "#toggleHdr4u-3 a:first-child"
    ).href;
    let lastModified = dom.window.document.querySelector(
      "#toggleHdr4u-3 a:first-child"
    ).title;

    // Saves the file on the server and sets the modified date accordingly
    https.get(process.env.SKAT_URL + href, (res) => {
      const fileStream = fs.createWriteStream(
        "./public/xlxs/skats-positivliste.xlxs"
      );
      res.pipe(fileStream);
      fileStream.on("finish", () => {
        const formatDate = lastModified
          .split("listen ")[1]
          .split(".xlsx")[0]
          .match(/^(\d{2})(\d{2})(\d{4})/);
        lastModified = new Date(
          formatDate[3],
          formatDate[2] - 1,
          formatDate[1]
        );
        fs.utimesSync(
          "./public/xlxs/skats-positivliste.xlxs",
          lastModified,
          lastModified
        );
        fileStream.close();
        console.log("Download finished");
      });
    });
  })();
});

app.use(express.static("public"));
app.use(function (req, res, next) {
  res.locals._ = require("lodash");
  next();
});
app.set("view engine", "pug");

app.use("/", skatsPositivlisteRoute);

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
