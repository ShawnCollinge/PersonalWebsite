const express = require("express");
const router = express.Router();
const User = require('../models/User');

const passport = require("passport");

router.get("/register", function (req, res) {
    res.render("register", { isAdmin: req.isAuthenticated() });
});

router.get("/login", function (req, res) {
    res.render("login", {
        isAdmin: req.isAuthenticated()
    });
});

router.get("/logout", function (req, res) {
    req.logout(function (err) {
        if (err) {
            console.log(err)
        }
    });
    res.redirect("/");
});

router.post("/register", function (req, res) {
    User.register({
        username: req.body.username
    }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/admin");
            });
        }
    });
});


router.post("/login", function (req, res) {
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, function (err) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/admin");
            });
        }
    });
});

module.exports = router;