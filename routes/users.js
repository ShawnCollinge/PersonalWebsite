const express = require("express");
const router = express.Router();
const user_controller = require("../controllers/usersController.js");
const passport = require("passport");


router.get("/register", user_controller.register_page);
router.post("/register", user_controller.register_post);

router.get("/login", 
passport.authenticate('local', {
    failureRedirect: '/login',
    successRedirect: '/',
}),
    (req, res) => {
        console.log(req.user);
    }
);
router.get("/logout", user_controller.logout);
router.post("/login", user_controller.login_post);

module.exports = router;