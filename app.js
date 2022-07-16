require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const multer  = require('multer')

const app = express();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
})
const upload = multer({ storage: storage })


app.use(express.static("public"));
app.use('/uploads', express.static('uploads'))

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
  password: String
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
  title: "test",
  body: "test"
}

app.get("/", function(req, res) {
  Project.find({isFeatured: true}, function(err, posts) {
    if (err) {
      console.log(err);
    } else {
        res.render("home", {featureProjects: posts, about: aboutContent, isAdmin: req.isAuthenticated()});
    }
  });
});

app.get("/projects", function(req, res){
  Project.find({}, function(err, posts) {
    if (err) {
      console.log(err);
    } else {
      res.render("projects", {projects: posts, isAdmin: req.isAuthenticated()});
    }
  });
})

app.get("/logout", function(req, res) {
  req.logout(function(err) {
    if (err) {
      console.log(err) }});
  res.redirect("/");
});

// app.get("/register", function(req, res) {
//   res.render("register");
// });

//admin pages

app.get("/login", function(req, res) {
  res.render("login", { isAdmin: req.isAuthenticated() });
});

app.get("/admin", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("admin", {isAdmin: req.isAuthenticated()});
  } else {
    res.redirect("/login");
  }
});

app.get("/admin/newproject", function(req, res) {
  if (req.isAuthenticated()) {
    res.render("newProject", { isAdmin: req.isAuthenticated() });
  } else {
    res.redirect("/login");
  }
});

app.post("/admin/newproject", upload.array('images', 12), function(req, res) {
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
})

// app.get("/admin/edit/:id", function(req, res) {
//   console.log("Asdf");
// });
app.post("/register", function(req, res) {

  User.register({username: req.body.username}, req.body.password, function(err, user) {
    if (err) {
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res, function() {
        res.redirect("/admin");
      });
    }
  });
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
      passport.authenticate("local")(req, res, function(){
        res.redirect("/admin");
      });
    }
  });
});


app.listen(3000, function() {
  console.log("Server started on port 3000");
});
