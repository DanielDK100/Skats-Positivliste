const https = require("https");
const fs = require("fs");
const { JSDOM } = require("jsdom");

async function fetchData(url) {
  const response = await fetch(url);
  return await response.text();
}

function parseDOM(body) {
  const dom = new JSDOM(body);
  return dom.window.document.querySelector("#toggleHdr4u-3 a:first-child");
}
function formatDate(element) {
  const regex = /listen (\d{2})(\d{2})(\d{4})/;
  const match = element.match(regex);

  const [, day, month, year] = match;
  return new Date(`${year}-${month}-${day}`);
}

function downloadFile(element) {
  https.get(process.env.SKAT_URL + element.href, (response) => {
    const fileStream = fs.createWriteStream(
      "./public/xlxs/skats-positivliste.xlxs"
    );
    response.pipe(fileStream);
    fileStream.on("finish", () => {
      const lastModified = formatDate(element.title);
      fs.utimesSync(
        "./public/xlxs/skats-positivliste.xlxs",
        lastModified,
        lastModified
      );
      fileStream.close();
      console.info("Download finished: " + new Date().toLocaleString("da-DK"));
    });
  });
}

module.exports = async function () {
  const data = await fetchData(process.env.SKAT_URL + "data.aspx?oid=2244641");
  const element = parseDOM(data);
  downloadFile(element);
};
