const _ = require("lodash");
const https = require("https");
const fs = require("fs");
var XLSX = require("xlsx");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const index = (req, res) => {
  (async () => {
    const response = await fetch("https://skat.dk/data.aspx?oid=2244641");
    const body = await response.text();

    const dom = new JSDOM(body);
    const href = dom.window.document.querySelector(
      "#toggleHdr4u-3 a:first-child"
    ).href;
    url = "https://skat.dk/" + href;
    downloadFile(url);

    var workbook = XLSX.readFile("./public/xlxs/skats-positivliste.xlxs");
    const json = XLSX.utils.sheet_to_json(
      workbook.Sheets[workbook.SheetNames[0]],
      {
        defval: "Intet data",
      }
    );
    return res.render("index", {
      file: fs.statSync("./public/xlxs/skats-positivliste.xlxs"),
      columns: Object.keys(json[0]),
      values: json,
    });
  })();
};

const downloadFile = (req, res) => {
  https.get(url, (res) => {
    const fileStream = fs.createWriteStream(
      "./public/xlxs/skats-positivliste.xlxs"
    );
    res.pipe(fileStream);
    fileStream.on("finish", () => {
      fileStream.close();
    });
  });
};

module.exports = {
  index,
};
