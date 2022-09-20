const User = require('../models/User');
const passport = require("passport");

exports.register_page = function (req, res) {
    res.render("register", { isAdmin: req.isAuthenticated() });
};

exports.login_page = function (req, res) {
    res.render("login", {
        isAdmin: req.isAuthenticated()
    });
};

exports.logout = function (req, res) {
    req.logout(function (err) {
        if (err) {
            console.log(err)
        }
    });
    res.redirect("/");
};

exports.register_post = function (req, res) {
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
};

exports.login_post = function (req, res) {
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
};