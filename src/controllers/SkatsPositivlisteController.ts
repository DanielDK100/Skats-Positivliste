import { Request, Response } from "express";
import XLSXService, {
  XLSXFileMetaDataInterface,
} from "../services/XLSXService";
import { AppDataSource } from "../data-source";
import { RegistrationEntity } from "../entities/RegistrationEntity";
import { Repository } from "typeorm";

enum StatusEnum {
  Success = "success",
  Danger = "danger",
}

export default class SkatsPositivlisteController {
  private filePath: string = "./public/xlsx/skats-positivliste.xlsx";
  private registrationRepository: Repository<RegistrationEntity> =
    AppDataSource.getRepository(RegistrationEntity);

  public async index(req: Request, res: Response): Promise<void> {
    try {
      const fileModified = await XLSXService.getLastModifiedTime(this.filePath);

      res.render("index", {
        fileModified: fileModified,
        status: req.query.status,
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

      res.redirect(`/?status=${StatusEnum.Success}`);
    } catch (error) {
      res.redirect(`/?status=${StatusEnum.Danger}`);
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
