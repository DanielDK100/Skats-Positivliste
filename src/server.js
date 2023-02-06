"use strict";
require("dotenv").config();
const express = require("express");
const https = require("https");
const fs = require("fs");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const cron = require("node-cron");

const skatsPositivlisteRoute = require("./routes/skatsPositivlisteRoute.js");

// Constants
const PORT = process.env.PORT;
const HOST = process.env.HOST;

// App
const app = express();

cron.schedule("0 0 * * * *", function () {
  (async () => {
    const response = await fetch(
      process.env.SKAT_URL + "data.aspx?oid=2244641"
    );
    const body = await response.text();
    const dom = new JSDOM(body);
    const href = dom.window.document.querySelector(
      "#toggleHdr4u-3 a:first-child"
    ).href;

    https.get(process.env.SKAT_URL + href, (res) => {
      const fileStream = fs.createWriteStream(
        "./public/xlxs/skats-positivliste.xlxs"
      );
      res.pipe(fileStream);
      fileStream.on("finish", () => {
        console.log("Download finished");
        fileStream.close();
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
