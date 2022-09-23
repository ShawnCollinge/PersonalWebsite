const User = require('../models/User');
const passport = require("passport");

exports.register_page = function (req, res) {
    res.render("register", { user: req.user });
};

exports.login_page = function (req, res) {
    res.render("login", {
        user: req.user
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

exports.register_post = async function (req, res) {
    let data = {
        username: req.body.username
    }
    password = req.body.password
    if (await User.exists({'username': data.username})) {
        res.render("register", { user: req.user, message: "Email already in use!" });
    } else if (req.body.verifypassword != password) {
        res.render("register", { user: req.user, message: "Passwords don't match." });
    } else {
    User.register(data, password, function (err, user) {
        if (err) {
            console.log(err);
            res.redirect("/users/register");
        } else {
            passport.authenticate("local")(req, res, function (err) {
                console.log(err);
                res.redirect("/");
            });
        }
    });
}
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
                res.redirect("/");
            });
        }
    });
};

exports.forgot_password = function (req, res) {

}


function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
};