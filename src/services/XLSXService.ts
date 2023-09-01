import * as fs from "fs/promises";
import * as XLSX from "xlsx";

class XLSXService {
  async readXLSXFile(filePath: string) {
    const workbookBuffer = await fs.readFile(filePath);
    return XLSX.read(workbookBuffer);
  }

  getSheetData(workbook: XLSX.WorkBook) {
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet);
  }

  async getFileModifiedTime(filePath: string) {
    const fileStats = await fs.stat(filePath);
    return fileStats.mtime;
  }

  async getIndexData(filePath: string) {
    const workbook = await this.readXLSXFile(filePath);
    const json = this.getSheetData(workbook);
    const fileModified = await this.getFileModifiedTime(filePath);

    return {
      fileModified,
      columns: Object.keys(json[0] || {}),
      values: json,
    };
  }
}

export default XLSXService;
