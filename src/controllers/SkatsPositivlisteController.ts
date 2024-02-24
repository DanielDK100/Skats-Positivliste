import { Request, Response } from "express";
import XLSXService from "../services/XLSXService";

export default class SkatsPositivlisteController {
  private filePath: string = "./public/xlsx/skats-positivliste.xlsx";

  public async index(req: Request, res: Response): Promise<void> {
    try {
      const fileModified = await XLSXService.getLastModifiedTime(this.filePath);
      res.render("index", fileModified);
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  }

  public async investmentCompanies(req: Request, res: Response): Promise<void> {
    try {
      const data = await XLSXService.fetchXLSXFileData(this.filePath);
      res.json(data);
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  }
}
