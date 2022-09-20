const Project = require('../models/project');
const PractiscoreSearch = require('../models/practiscoreSearch');

exports.admin_home = function (req, res) {
  if (req.isAuthenticated()) {
    res.render("admin", {
      isAdmin: req.isAuthenticated()
    });
  } else {
    res.redirect("/login");
  }
};

exports.new_project = function (req, res) {
  if (req.isAuthenticated()) {
    res.render("newProject", {
      isAdmin: req.isAuthenticated()
    });
  } else {
    res.redirect("/login");
  }
};

exports.edit_project = function (req, res) {
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
};

exports.new_project_post = function (req, res) {
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
};

exports.practiscore_search = function (req, res) {
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
};

exports.edit_project_post = function (req, res) {
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
};

exports.delete_project = function (req, res) {
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
};

exports.delete_image = function (req, res) {
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
};