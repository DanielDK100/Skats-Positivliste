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

  private extractSheetData(workbook: XLSX.WorkBook): Record<string, any>[] {
    const now = new Date();
    const currentYear = (now.getFullYear()).toString();
    const previousYear = (now.getFullYear() - 1).toString();

    let sheetName = currentYear;
    if (!workbook.SheetNames.includes(sheetName)) {
      if (workbook.SheetNames.includes(previousYear)) {
        sheetName = previousYear;
        console.warn(`Sheet "${currentYear}" not found, falling back to "${previousYear}"`);
      } 
      else {
        console.error(`Sheet "${currentYear}" and "${previousYear}" not found`);

        return;
      }
    }
    
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: "" });
        
    return Array.from(this.processRowsInChunks(json));
  }

  private filterRowData(row: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
      Object.entries(row).filter(
        ([key]) =>
          key !== "__EMPTY" &&
          key !== "__EMPTY_1" &&
          key !== "ws" &&
          key !== "LEI kode" &&
          key !== "TIN" &&
          key !== "Afregistrerede år"
      )
    );
  }

  private *processRowsInChunks(rows: Record<string, any>[]): Generator<Record<string, any>> {
    const chunkSize = 500;
    for (let i = 0; i < rows.length; i += chunkSize) {    
      const chunk = rows.slice(i, i + chunkSize);
      for (const row of chunk) {
        yield this.filterRowData(row);
      }
    }
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
