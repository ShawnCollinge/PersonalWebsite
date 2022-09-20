const express = require("express");
const router = express.Router();
const practiscore_controller = require("../controllers/practiscoreController.js")

router.get("/", practiscore_controller.index);
router.post("/", practiscore_controller.pull_data);

module.exports = router;