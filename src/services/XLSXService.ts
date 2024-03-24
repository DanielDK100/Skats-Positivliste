import * as fs from "fs/promises";
import * as XLSX from "xlsx";

export interface XLSXFileMetaDataInterface {
  fileModified: Date;
}

export interface XLSXFileInterface {
  columns: string[];
  values: any[];
}

class XLSXService {
  private async readXLSXFile(filePath: string): Promise<XLSX.WorkBook> {
    const workbookBuffer = await fs.readFile(filePath);
    return XLSX.read(workbookBuffer);
  }

  private extractSheetData(workbook: XLSX.WorkBook): unknown[] {
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet, {
      defval: "",
    });
  }

  public async getLastModifiedTime(
    filePath: string
  ): Promise<XLSXFileMetaDataInterface> {
    const fileStats = await fs.stat(filePath);

    const fileModified: XLSXFileMetaDataInterface = {
      fileModified: fileStats.mtime,
    };

    return fileModified;
  }

  public async fetchXLSXFileData(filePath: string): Promise<XLSXFileInterface> {
    const workbook = await this.readXLSXFile(filePath);
    const json = this.extractSheetData(workbook);

    const XLSXObject: XLSXFileInterface = {
      columns: Object.keys(json[0] || {}),
      values: json,
    };

    return XLSXObject;
  }
}

export default new XLSXService();
