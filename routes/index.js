const express = require("express");
const router = express.Router();
const index_controller = require("../controllers/indexController.js")

router.get("/", index_controller.index_page);
router.get("/contact", index_controller.contact);
router.get("/s/:id", index_controller.short_url);

module.exports = router;