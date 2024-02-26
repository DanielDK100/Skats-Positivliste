import { Request, Response } from "express";
import XLSXService, {
  XLSXFileMetaDataInterface,
} from "../services/XLSXService";
import { AppDataSource } from "../data-source";
import { RegistrationEntity } from "../entity/RegistrationEntity";

export default class SkatsPositivlisteController {
  private filePath: string = "./public/xlsx/skats-positivliste.xlsx";
  private registrationRepository =
    AppDataSource.getRepository(RegistrationEntity);
  private fileModified: XLSXFileMetaDataInterface;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    this.fileModified = await XLSXService.getLastModifiedTime(this.filePath);
  }

  public async index(req: Request, res: Response): Promise<void> {
    try {
      res.render("index", {
        fileModified: this.fileModified,
      });
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  }

  public async register(req: Request, res: Response): Promise<void> {
    try {
      await this.registrationRepository.save({
        isin: req.body.isin.replace(/\s/g, ""),
        email: req.body.email,
      });

      res.render("index", {
        fileModified: this.fileModified,
        alertType: "success",
        message: "Din registrering blev gemt",
      });
    } catch (error) {
      res.render("index", {
        fileModified: this.fileModified,
        alertType: "danger",
        message: "Der skete en fejl",
      });
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
