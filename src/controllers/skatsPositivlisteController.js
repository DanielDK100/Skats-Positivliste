const fs = require("fs");
const XLSX = require("xlsx");

/* 
Converts the XLSX file to JSON and displays the results
*/
const index = (req, res) => {
  const workbook = XLSX.readFile("./public/xlxs/skats-positivliste.xlxs");
  const json = XLSX.utils.sheet_to_json(
    workbook.Sheets[workbook.SheetNames[0]]
  );
  return res.render("index", {
    fileModified: new Date(
      fs.statSync("./public/xlxs/skats-positivliste.xlxs").mtime
    ),
    columns: Object.keys(json[0]),
    values: json,
  });
};

module.exports = {
  index,
};
