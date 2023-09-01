import { Router } from "express";
import { index } from "../controllers/skatsPositivlisteController";

const router = Router();

router.get("/", index);

export default router;
