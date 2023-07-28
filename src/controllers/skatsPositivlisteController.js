const XLSXService = require("../services/XLSXService");

async function index(req, res) {
  try {
    const xlsxService = new XLSXService();
    const filePath = "./public/xlxs/skats-positivliste.xlxs";
    const data = await xlsxService.getIndexData(filePath);
    return res.render("index", data);
  } catch (error) {
    console.error("Error in controller:", error.message);
    return res.status(500).send("Internal Server Error");
  }
}

module.exports = {
  index,
};
