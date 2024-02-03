import { Request, Response } from "express";
import XLSXService from "../services/XLSXService";

const filePath = "./public/xlsx/skats-positivliste.xlsx";

async function index(req: Request, res: Response): Promise<void> {
  try {
    const fileModified = await XLSXService.getLastModifiedTime(filePath);
    res.render("index", fileModified);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
}

async function investmentCompanies(req: Request, res: Response): Promise<void> {
  try {
    const data = await XLSXService.fetchXLSXFileData(filePath);
    res.json(data);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
}

export { index, investmentCompanies };
