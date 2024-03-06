import { Request, Response } from "express";
import XLSXService, {
  XLSXFileInterface,
  XLSXFileMetaDataInterface,
} from "../services/XLSXService";
import RegistrationService from "../services/RegistrationService";
import { RegistrationEntity } from "../entities/RegistrationEntity";

enum StatusEnum {
  Success = "success",
  Danger = "danger",
}

export default class SkatsPositivlisteController {
  private filePath: string = "./public/xlsx/skats-positivliste.xlsx";

  public async index(req: Request, res: Response): Promise<void> {
    try {
      const fileModified: XLSXFileMetaDataInterface =
        await XLSXService.getLastModifiedTime(this.filePath);

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
      const { isin, email } = req.body;
      const registration = new RegistrationEntity();
      registration.isin = isin;
      registration.email = email;

      await RegistrationService.resetIsNotified(registration);

      res.redirect(`/?status=${StatusEnum.Success}`);
    } catch (error) {
      res.redirect(`/?status=${StatusEnum.Danger}`);
    }
  }

  public async investmentCompanies(req: Request, res: Response): Promise<void> {
    try {
      const data: XLSXFileInterface = await XLSXService.fetchXLSXFileData(
        this.filePath
      );
      res.json(data);
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  }
}
