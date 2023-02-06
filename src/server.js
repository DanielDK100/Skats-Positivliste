"use strict";
require("dotenv").config();
const express = require("express");

const skatsPositivlisteRoute = require("./routes/skatsPositivlisteRoute.js");

// Constants
const PORT = process.env.PORT;
const HOST = process.env.HOST;

// App
const app = express();
app.use(express.static("public"));
app.use(function (req, res, next) {
  res.locals._ = require("lodash");
  next();
});
app.set("view engine", "pug");

app.use("/", skatsPositivlisteRoute);

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
