const Project = require('../models/project');

exports.get_projects = function (req, res) {
    Project.find({}, function (err, posts) {
        if (err) {
            console.log(err);
        } else {
            res.render("projects", {
                projects: posts,
                user: req.user
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
                user: req.user
            });
        }
    })
};
