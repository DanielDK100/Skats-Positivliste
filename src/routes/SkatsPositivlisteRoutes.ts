import { Router, Request, Response } from "express";
import SkatsPositivlisteController from "../controllers/SkatsPositivlisteController";

class SkatsPositivlisteRoutes {
  private skatsPositivlisteController: SkatsPositivlisteController;

  constructor() {
    this.skatsPositivlisteController = new SkatsPositivlisteController();
  }

  public getRoutes(): Router {
    const router = Router();

    router.get(
      "/",
      this.skatsPositivlisteController.index.bind(
        this.skatsPositivlisteController
      )
    );
    router.get(
      "/investment-companies",
      this.skatsPositivlisteController.investmentCompanies.bind(
        this.skatsPositivlisteController
      )
    );

    return router;
  }
}

export default new SkatsPositivlisteRoutes().getRoutes();
