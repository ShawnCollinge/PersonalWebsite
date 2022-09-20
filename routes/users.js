const express = require("express");
const router = express.Router();
const user_controller = require("../controllers/usersController.js");

//router.get("/register", user_controller.register_page);
//router.post("/register", user_controller.register_post);

router.get("/login", user_controller.login_page);
router.get("/logout", user_controller.logout);
router.post("/login", user_controller.login_post);

module.exports = router;