import { Router, Request, Response, NextFunction } from "express";
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
      this.skatsPositivlisteController.indexView.bind(
        this.skatsPositivlisteController
      )
    );
    router.get(
      "/top-registreringer",
      this.skatsPositivlisteController.topRegistrationsView.bind(
        this.skatsPositivlisteController
      )
    );
    router.post("/register", (req: Request, res: Response) => {
      this.skatsPositivlisteController.register(req, res);
    });
    router.get(
      "/investment-companies",
      this.skatsPositivlisteController.investmentCompanies.bind(
        this.skatsPositivlisteController
      )
    );
    router.get(
      "/top-registrations",
      this.skatsPositivlisteController.topRegistrations.bind(
        this.skatsPositivlisteController
      )
    );

    return router;
  }
}

export default new SkatsPositivlisteRoutes().getRoutes();
