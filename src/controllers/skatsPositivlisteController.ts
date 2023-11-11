import { Request, Response } from "express";
import XLSXService from "../services/XLSXService";

async function index(req: Request, res: Response): Promise<void> {
  try {
    const filePath = "./public/xlsx/skats-positivliste.xlsx";
    const data = await XLSXService.fetchXLSXFileData(filePath);

    res.render("index", data);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
}

export { index };
