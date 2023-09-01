import { Request, Response } from "express";
import XLSXService from "../services/XLSXService";

async function index(req: Request, res: Response): Promise<void> {
  try {
    const xlsxService = new XLSXService();
    const filePath = "./public/xlxs/skats-positivliste.xlxs";
    const data = await xlsxService.getIndexData(filePath);

    res.render("index", data);
  } catch (error) {
    console.error("Error in controller");
    res.status(500).send("Internal Server Error");
  }
}

export { index };
