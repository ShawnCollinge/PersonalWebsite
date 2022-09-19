const express = require("express");
const router = express.Router();
const project_controller = require("../controllers/projectController.js")

router.get("/", project_controller.get_projects);

router.get("/:projectID", project_controller.get_single_project);

module.exports = router;