require("dotenv").config();
const ShortURL = require('../models/shortURL');
const DiscordUser = require('../models/discordUser');
const DiscordServer = require('../models/discordServer');
const async = require('async');

const types = {
    user: DiscordUser,
    server: DiscordServer
};

exports.api_get = function (req, res) {
    if (req.params.api_key === process.env.API_KEY) {
        const type = req.body.type;
        const data = req.body;
        delete data['type'];
        if (type === "short") {
            ShortURL.findOne({
                short: req.body.short
            }, function (err, link) {
                if (err || link === null) {
                    res.sendStatus(404);
                } else {
                    res.send(link);
                }
            });
        } else if (types.hasOwnProperty(type)) {
            const obj = types[type]
            obj.findOne({
                _id: req.body._id
            }, function (err, returnData) {
                if (err || returnData == null) {
                    res.sendStatus(404);
                } else {
                    res.send(returnData);
                }
            });
        }
    } else {
        res.sendStatus(403);
    }

};

exports.api_post = async function (req, res) {
    const type = req.body.type;
    data = req.body;
    delete data['type'];
    if (req.params.api_key === process.env.API_KEY) {
        if (type == "short") {
            const base = process.env.BASE;
            let shortID = makeid(7);
            while (await idDoesntExist(shortID)) {
                shortID = makeid(7);
            }
            data['_id'] = shortID;
            data['url'] = data.url.replace(/^https?:\/\//, '')
            const new_link = new ShortURL(data);
            new_link.save(function (err) {
                if (!err) {
                    res.send(base + data['_id']);
                } else {
                    console.log(err);
                }
            });
        } else if (types.hasOwnProperty(type)) {
            const new_user = new types[type](data);
            new_user.save(function (err) {
                if (!err) {
                    res.sendStatus(200);
                } else {
                    res.send(err);
                }
            });
        } else {
            res.sendStatus(400);
        }
    } else {
        res.sendStatus(400);
    }
};

exports.api_patch = function (req, res) {
    if (req.params.api_key === process.env.API_KEY) {
        const type = req.body.type;
        const data = req.body;
        delete data['type'];
        if (types.hasOwnProperty(type)) {
            const obj = types[type];
            obj.updateOne({
                _id: req.body._id
            },
                data,
                function (err, results) {
                    if (!err) {
                        res.sendStatus(200);
                    } else {
                        res.sendStatus(400);
                    }
                }
            );
        } else {
            res.sendStatus(400);
        }
    } else {
        res.sendStatus(403);
    }
};

exports.api_delete = function (req, res) {
    if (req.params.api_key === process.env.API_KEY) {
        DiscordUser.deleteOne({
            _id: req.body._id
        }, function (err, status) {
            if (!err && status.deletedCount == 1) {
                res.sendStatus(200);
            } else {
                res.sendStatus(400);
            }
        })
    } else {
        res.sendStatus(404);
    }
};

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

async function idDoesntExist(id) {
    let test = await ShortURL.exists({ _id: id })
    console.log(id)
    console.log(test)
    console.log(test != null)
    return test != null;
};
