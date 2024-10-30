const express = require("express");
const app = express();
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const conn = require("./db/connectionDb");
const session = require("express-session");
const flash = require("connect-flash");
const userModel = require("./models/userModel");
const bcrypt = require("bcrypt");

conn();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.json());
app.use(
  session({
    secret: "secret",
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());

app.get("/", (req, res) => {
  res.render("home");
});

// GET REGISTER
app.get("/register", (req, res) => {
  let error_msg = req.flash("error");
  res.render("register", { error_msg });
});

// POST REGISTER
app.post("/register", async (req, res) => {
  let { firstname, lastname, email, password, password2 } = req.body;
  const user = await userModel.findOne({ email });
  if (user) {
    req.flash("error", "Email already exists");
    res.redirect("/register");
  }

  if (!firstname || !lastname || !email || !password || !password2) {
    req.flash("error", "All fields are required");
    res.redirect("/register");
  } else if (password !== password2) {
    req.flash("error", "Passwords do not match");
    res.redirect("/register");
  } else {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) throw err;
        const newUser = await userModel.create({
          firstname,
          lastname,
          email,
          password: hash,
        });
      });
    });
    req.flash("success", "Registration Successful");
    res.redirect("/login");
  }
});

// GET LOGIN
app.get("/login", (req, res) => {
  let success_msg = req.flash("success");
  let login_error = req.flash("login-error");
  res.render("login", { success_msg , login_error });
});

// POST LOGIN

app.post("/login", async (req, res) => {
  let { email, password } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) {
    req.flash("login-error", "Email not found");
    res.redirect("/login");
  } else {
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        req.session.user = user;
        req.flash("success", "Login Successful");
        res.redirect("/home");
      } else {
        req.flash("login-error", "Incorrect Password");
        res.redirect("/login");
      }
    });
  }
});

const port = process.env.PORT || 4000;

app.listen(port, (error) => {
  if (error) {
    console.log(error);
  }
  console.log(`App listening at port http://localhost:${port}`);
});
