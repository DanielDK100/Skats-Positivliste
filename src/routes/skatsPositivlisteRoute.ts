import { Router } from "express";
import {
  index,
  investmentCompanies,
} from "../controllers/skatsPositivlisteController";

const router = Router();

router.get("/", index);
router.get("/investment-companies", investmentCompanies);

export default router;
