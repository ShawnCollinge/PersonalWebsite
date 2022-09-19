const express = require("express");
const router = express.Router();
const Project = require('../models/project');
const ShortURL = require('../models/shortURL');

const aboutContent = {
    title: "Welcome to my website",
    body: "This is my personal website that showcases my projects I've been working on."
}

router.get("/", function (req, res) {
    Project.find({
        isFeatured: true
    }, function (err, posts) {
        if (err) {
            console.log(err);
        } else {
            res.render("home", {
                featureProjects: posts,
                about: aboutContent,
                isAdmin: req.isAuthenticated()
            });
        }
    });
});

router.get("/contact", function (req, res) {
    res.render("contact", {
      isAdmin: req.isAuthenticated()
    });
  });

  router.get("/s/:id", function (req, res) {
    ShortURL.findOne({
        _id: req.params.id
    }, function (err, data) {
        if (err || data === null) {
            res.send(data);
        } else {
            res.redirect("//" + data.url);
        }
    });
});

module.exports = router;