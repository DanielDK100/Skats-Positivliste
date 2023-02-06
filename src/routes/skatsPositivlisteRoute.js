const { Router } = require("express");
const skatsPositivlisteController = require("../controllers/skatsPositivlisteController");

const router = Router();

router.get("/", skatsPositivlisteController.index);

module.exports = router;
