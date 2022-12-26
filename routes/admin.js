const express = require("express");
const router = express.Router();
const admin_controller = require("../controllers/adminController.js")
const multer = require('multer');


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
});
const upload = multer({
  storage: storage
});


router.get("/", admin_controller.admin_home);
router.get("/newproject", admin_controller.new_project);
router.get("/edit/:projectID", admin_controller.edit_project);
router.get("/practiscore", admin_controller.practiscore_search);
router.post("/newproject", upload.array("images", 12), admin_controller.new_project_post);
router.post("/edit/:projectID", upload.array("images", 12), admin_controller.edit_project_post);
  
router.post("/delete/:projectID", admin_controller.delete_project);
  
router.post("/delimage/:projectID/:imageIndex", admin_controller.delete_image);


module.exports = router;