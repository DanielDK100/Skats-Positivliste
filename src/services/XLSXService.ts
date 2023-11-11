import * as fs from "fs/promises";
import * as XLSX from "xlsx";

interface XLSXFileInterface {
  fileModified: Date;
  columns: string[];
  values: any[];
}

class XLSXService {
  async readXLSXFile(filePath: string): Promise<XLSX.WorkBook> {
    const workbookBuffer = await fs.readFile(filePath);
    return XLSX.read(workbookBuffer);
  }

  extractSheetData(workbook: XLSX.WorkBook): unknown[] {
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet);
  }

  async getLastModifiedTime(filePath: string): Promise<Date> {
    const fileStats = await fs.stat(filePath);
    return fileStats.mtime;
  }

  async fetchXLSXFileData(filePath: string): Promise<XLSXFileInterface> {
    const workbook = await this.readXLSXFile(filePath);
    const json = this.extractSheetData(workbook);
    const fileModified = await this.getLastModifiedTime(filePath);

    const XLSXObject: XLSXFileInterface = {
      fileModified,
      columns: Object.keys(json[0] || {}),
      values: json,
    };

    return XLSXObject;
  }
}

export default new XLSXService();
