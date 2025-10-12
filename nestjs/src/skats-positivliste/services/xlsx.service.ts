import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as XLSX from 'xlsx';

export interface XlsxFileMetaData {
  fileModified: Date;
}

export interface XlsxFileData {
  columns: string[];
  values: any[];
}

@Injectable()
export class XlsxService {
  private async readXlsxFile(filePath: string): Promise<XLSX.WorkBook> {
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
        return [];
      }
    }
    
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as Record<string, any>[];
        
    return Array.from(this.processRowsInChunks(json));
  }

  private filterRowData(row: Record<string, any>): Record<string, any> {
    return Object.fromEntries(
      Object.entries(row).filter(
        ([key]) =>
          key !== "ws" &&
          key !== "LEI kode" &&
          key !== "TIN" &&
          key !== "Ikke registrerede år"
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
  ): Promise<XlsxFileMetaData> {
    try {
      const fileStats = await fs.stat(filePath);
      
      return {
        fileModified: fileStats.mtime,
      };
    } catch (error) {
      console.warn(`File not found: ${filePath}. Using current time.`);
      return {
        fileModified: new Date(),
      };
    }
  }

  public async fetchXlsxFileData(filePath: string): Promise<XlsxFileData> {
    try {
      const workbook = await this.readXlsxFile(filePath);
      const json = this.extractSheetData(workbook);
      
      return {
        columns: Object.keys(json[0] || {}),
        values: json,
      };
    } catch (error) {
      console.warn(`Error reading XLSX file: ${error.message}`);
      return {
        columns: [],
        values: [],
      };
    }
  }
}
