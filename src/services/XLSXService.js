const fs = require("fs").promises;
const XLSX = require("xlsx");

class XLSXService {
  async readXLSXFile(filePath) {
    const workbookBuffer = await fs.readFile(filePath);
    return XLSX.read(workbookBuffer);
  }

  getSheetData(workbook) {
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet);
  }

  async getFileModifiedTime(filePath) {
    const fileStats = await fs.stat(filePath);
    return fileStats.mtime;
  }

  async getIndexData(filePath) {
    const workbook = await this.readXLSXFile(filePath);
    const json = this.getSheetData(workbook);
    const fileModified = await this.getFileModifiedTime(filePath);

    return {
      fileModified,
      columns: Object.keys(json[0]),
      values: json,
    };
  }
}

module.exports = XLSXService;
