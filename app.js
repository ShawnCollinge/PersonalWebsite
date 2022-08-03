require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const multer = require('multer')

const app = express();

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads')
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname)
  }
});
const upload = multer({
  storage: storage
});


app.use(express.static("public"));
app.use('/uploads', express.static('uploads'));

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGO_URL);

const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  resume: Array
});

const projectSchema = new mongoose.Schema({
  title: String,
  githubLink: String,
  techStacks: String,
  demoLink: String,
  description: String,
  images: Array,
  isFeatured: Boolean
});

const userSchema = new mongoose.Schema({
    username: String,
    city: String,
    pronouns: String,
    admin: {
        type: Boolean,
        default: false
    }
});

const shortSchema = new mongoose.Schema({
    _id: String,
    url: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);
const Project = new mongoose.model("Project", projectSchema);
const DiscordUser = new mongoose.model("DiscordUser", userSchema);
const ShortURL = new mongoose.model("ShortURL", shortSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const aboutContent = {
  title: "Welcome to my website",
  body: "This is my personal website that showcases my projects I've been working on."
}

app.get("/", function(req, res) {
  Project.find({
    isFeatured: true
  }, function(err, posts) {
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

app.get("/projects", function(req, res) {
  Project.find({}, function(err, posts) {
    if (err) {
      console.log(err);
    } else {
      res.render("projects", {
        projects: posts,
        isAdmin: req.isAuthenticated()
      });
    }
  });
});

app.get("/projects/:projectID", function(req, res) {
  Project.findOne({
    _id: req.params.projectID
  }, function(err, post) {
    if (err) {
      console.log(err);
    } else {
      res.render("singleProject", {
        project: post,
        isAdmin: req.isAuthenticated()
      });
    }
  });
});

app.get("/contact", function(req, res) {
  res.render("contact", {
    isAdmin: req.isAuthenticated()
  });
});

// app.get("/register", function(req, res) {
//   res.render("register", {isAdmin: req.isAuthenticated()});
// });


//////// admin pages

app.get("/login", function(req, res) {
  res.render("login", {
    isAdmin: req.isAuthenticated()
  });
});

app.get("/logout", function(req, res) {
  req.logout(function(err) {
    if (err) {
      console.log(err)
    }
  });
  res.redirect("/");
});


app.get("/admin", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("admin", {
      isAdmin: req.isAuthenticated()
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/admin/newproject", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("newProject", {
      isAdmin: req.isAuthenticated()
    });
  } else {
    res.redirect("/login");
  }
});

app.get("/admin/edit/:projectID", function(req, res) {
  if (req.isAuthenticated()) {
    Project.findOne({
      _id: req.params.projectID
    }, function(err, post) {
      res.render("editProject", {
        isAdmin: req.isAuthenticated(),
        project: post
      });
    });
  } else {
    res.redirect("/login");
  }
});

app.post("/admin/newproject", upload.array("images", 12), function(req, res) {
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

// app.post("/register", function(req, res) {
//   User.register({
//     username: req.body.username
//   }, req.body.password, function(err, user) {
//     if (err) {
//       console.log(err);
//       res.redirect("/register");
//     } else {
//       passport.authenticate("local")(req, res, function() {
//         res.redirect("/admin");
//       });
//     }
//   });
// });

app.post("/admin/edit/:projectID", upload.array("images", 12), function(req, res) {
  if (req.isAuthenticated()) {
    Project.findOne({
      _id: req.params.projectID
    }, function(err, post) {
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
        function(err, results) {
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

app.post("/admin/delete/:projectID", function(req, res) {
  if (req.isAuthenticated()) {
    Project.deleteOne({
      _id: req.params.projectID
    }, function(err) {
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

app.post("/admin/delimage/:projectID/:imageIndex", function(req, res) {
  if (req.isAuthenticated()) {
    Project.findOne({
      _id: req.params.projectID
    }, function(err, post) {
      if (err) {
        console.log(err);
      } else {
        post.images.splice(req.params.imageIndex, 1);
        Project.updateOne({
            _id: req.params.projectID
          }, {
            images: post.images
          },
          function(err) {
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



app.post("/login", function(req, res) {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, function(err) {
    if (err) {
      console.log(err);
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/admin");
      });
    }
  });
});

// Discord bot api stuff

app.get("/s/:id", function(req, res) {
    ShortURL.findOne({ _id: req.params.id }, function (err, data) {
        if (err || data === null) {
            res.redirect("/");
        } else {
            console.log(data)
            res.redirect(data.url);
        }
    });
});

app.route("/api/:api_key")

    .get(function (req, res) {
        if (req.params.api_key === process.env.API_KEY) {
            if (req.body.type === "user") {
                DiscordUser.findOne({ username: req.body.username }, function (err, user) {
                    if (err || user == null) {
                        res.sendStatus(404);
                    } else {
                        res.send(user);
                    }
                });
            } else if (req.body.type === "shortener") {
                ShortURL.findOne({ short: req.body.short }, function (err, link) {
                    if (err || link === null) {
                        res.sendStatus(404);
                    } else {
                        res.send(link);
                    }
                });
            }
        } else {
            res.sendStatus(403);
        }

    })

    .post(function (req, res) {
        const type = req.body.type;
        if (req.params.api_key === process.env.API_KEY) {
            data = req.body;
            delete data['type']
            if (type == "user") {
                new_user = new DiscordUser(data);
                new_user.save(function (err) {
                    if (!err) {
                        res.sendStatus(200);
                    } else {
                        res.send(err);
                    }
                });
            } else if (type == "short") {
                const base = process.env.BASE
                data['_id'] = makeid(7);
                new_link = new ShortURL(data);
                new_link.save(function (err) {
                    if (!err) {
                        res.send(base + data['_id']);
                    } else {
                        res.send(err);
                    }
                });
            }
        } else {
            res.send(400);
        }
    })

    .patch(function (req, res) {
        if (req.params.api_key === process.env.API_KEY) {
            DiscordUser.updateOne({ username: req.body.username },
                req.body, function (err, results) {
                    if (!err) {
                        res.sendStatus(200);
                    } else {
                        res.sendStatus(400);
                    }
                }
            )
        } else {
            res.sendStatus(403);
        }
    })

    .delete(function (req, res) {
        if (req.params.api_key === process.env.API_KEY) {
            DiscordUser.deleteOne({ username: req.body.username }, function (err, status) {
                if (!err && status.deletedCount == 1) {
                    res.sendStatus(200);
                } else {
                    res.sendStatus(400);
                }
            })
        } else {
            res.sendStatus(404);
        }
    });



app.listen(3000, function() {
  console.log("Server started on port 3000");
});


function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() *
            charactersLength));
    }
    return result;
}
