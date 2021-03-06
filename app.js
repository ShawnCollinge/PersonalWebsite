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

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);
const Project = new mongoose.model("Project", projectSchema);

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


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
