require("dotenv").config();
const createError = require('http-errors');
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");

const User = require(__dirname+'/models/User');

const index = require("./routes/index.js");
const projects = require("./routes/projects.js");
const admin = require("./routes/admin.js");
const practiscore = require("./routes/practiscore");
const users = require("./routes/users.js");
const discordAPI = require("./routes/discordAPI.js");

const app = express();
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

//mongoose.connect(process.env.MONGO_URL);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use("/", index);
app.use("/projects", projects);
app.use("/practiscore", practiscore);
app.use("/users", users);

app.use("/admin", admin);
app.use("/api", discordAPI);

app.use(function(req, res, next) {
  next(createError(404));
});

app.use(function(err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
