const https = require("https");
const fs = require("fs");
const { JSDOM } = require("jsdom");

module.exports = async function () {
  // Scrapes the href and date of the list from Skats website
  const response = await fetch(process.env.SKAT_URL + "data.aspx?oid=2244641");
  const body = await response.text();
  const dom = new JSDOM(body);
  const element = dom.window.document.querySelector(
    "#toggleHdr4u-3 a:first-child"
  );

  // Saves the file on the server and sets the modified date accordingly
  https.get(process.env.SKAT_URL + element.href, (response) => {
    const fileStream = fs.createWriteStream(
      "./public/xlxs/skats-positivliste.xlxs"
    );
    response.pipe(fileStream);
    fileStream.on("finish", () => {
      const formatDate = element.title
        .split("listen ")[1]
        .split(".xlsx")[0]
        .match(/^(\d{2})(\d{2})(\d{4})/);
      const lastModified = new Date(
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
      console.info("Download finished: " + new Date().toLocaleString());
    });
  });
};
