const express = require("express");
const router = express.Router();
const PractiscoreSearch = require('../models/practiscoreSearch');
let { PythonShell } = require('python-shell');

router.get("/", function (req, res) {
    res.render("practiscore", {
        isAdmin: req.isAuthenticated()
    });
});

router.post("/", function (req, res) {
    const searchData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        url: req.body.url
    }
    const search = new PractiscoreSearch(searchData);
    let options = {
        mode: 'text',
        pythonOptions: ['-u'],
        args: [searchData.url, searchData.firstName, searchData.lastName, req.body.displayMode]
    };
    PythonShell.run('main.py', options, function (err, results) {
        if (err) {
            console.log(err)
            res.redirect("/practiscore")
        } else {
            search.save()
            res.render("results", {
                isAdmin: req.isAuthenticated(),
                results: results
            })
        }
    });
});


module.exports = router;