const express = require("express");
const router = express.Router();
const Project = require('../models/project');
const PractiscoreSearch = require('../models/practiscoreSearch');
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

router.get("/", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("admin", {
            isAdmin: req.isAuthenticated()
        });
    } else {
        res.redirect("/login");
    }
});

router.get("/newproject", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("newProject", {
            isAdmin: req.isAuthenticated()
        });
    } else {
        res.redirect("/login");
    }
});

router.get("/edit/:projectID", function (req, res) {
    if (req.isAuthenticated()) {
        Project.findOne({
            _id: req.params.projectID
        }, function (err, post) {
            res.render("editProject", {
                isAdmin: req.isAuthenticated(),
                project: post
            });
        });
    } else {
        res.redirect("/login");
    }
});

router.post("/newproject", upload.array("images", 12), function (req, res) {
    if (req.isAuthenticated()) {
        const project = new Project({
            title: req.body.title,
            githubLink: req.body.githubLink,
            techStacks: req.body.techStacks,
            demoLink: req.body.demoLink,
            description: req.body.description,
            images: req.files,
            isFeatured: req.body.isFeatured
        });
        project.save();
        res.redirect("newProject");
    } else {
        res.redirect("/login");
    }
});

router.get("/practiscore", function (req, res) {
    if (req.isAuthenticated()) {
        PractiscoreSearch.find({}, function (err, posts) {
            if (err) {
                console.log(err);
            } else {
                res.render("practiscoreData", {
                    results: posts,
                    isAdmin: req.isAuthenticated()
                });
            }
        });
    } else {
        res.redirect("/login");
    }
});

router.post("/edit/:projectID", upload.array("images", 12), function (req, res) {
    if (req.isAuthenticated()) {
      Project.findOne({
        _id: req.params.projectID
      }, function (err, post) {
        let images = post.images.concat(req.files);
        Project.replaceOne({
          _id: req.params.projectID
        }, {
          title: req.body.title,
          githubLink: req.body.githubLink,
          techStacks: req.body.techStacks,
          demoLink: req.body.demoLink,
          description: req.body.description,
          images: images,
          isFeatured: req.body.isFeatured
        },
          function (err, results) {
            if (!err) {
              res.redirect("/admin");
            } else {
              res.send(err);
            }
          });
  
      });
    } else {
      res.redirect("/login");
    }
  });
  
router.post("/delete/:projectID", function (req, res) {
    if (req.isAuthenticated()) {
      Project.deleteOne({
        _id: req.params.projectID
      }, function (err) {
        if (!err) {
          res.redirect(req.header('Referer'));
        } else {
          res.send(err);
        }
      });
    } else {
      res.redirect("/login");
    }
  });
  
router.post("/delimage/:projectID/:imageIndex", function (req, res) {
    if (req.isAuthenticated()) {
      Project.findOne({
        _id: req.params.projectID
      }, function (err, post) {
        if (err) {
          console.log(err);
        } else {
          post.images.splice(req.params.imageIndex, 1);
          Project.updateOne({
            _id: req.params.projectID
          }, {
            images: post.images
          },
            function (err) {
              if (!err) {
                res.redirect(req.header('Referer'));
              } else {
                res.send(err);
              }
            });
        }
      });
    } else {
      res.redirect("/login");
    }
  });


module.exports = router;