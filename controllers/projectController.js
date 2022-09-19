const Project = require('../models/project');

exports.get_projects = function (req, res) {
    Project.find({}, function (err, posts) {
        if (err) {
            console.log(err);
        } else {
            res.render("projects", {
                projects: posts,
                isAdmin: req.isAuthenticated()
            });
        }
    })
};

exports.get_single_project = function (req, res) {
    Project.findOne({
        _id: req.params.projectID
    }, function (err, post) {
        if (err) {
            console.log(err);
        } else {
            res.render("singleProject", {
                project: post,
                isAdmin: req.isAuthenticated()
            });
        }
    })
};
