const express = require("express");
const app = express();
const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: "./.env" });
const conn = require("./db/connectionDb");
const session = require("express-session");
const flash = require("connect-flash");

conn();

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.json());
app.use(session({
  secret: "secret",
  cookie: { maxAge: 60000 },
  resave: false,
  saveUninitialized: false
}));
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
app.post("/register", (req, res) => {
  let { firstname, lastname, email, password, password2 } = req.body;
  
  if (!firstname || !lastname || !email || !password || !password2) {
    req.flash("error", "All fields are required");
    res.redirect("/register");
  } else if (password !== password2) {
    req.flash("error", "Passwords do not match");
    res.redirect("/register");
  } else {
    req.flash("success", "Registration Successful");
    res.redirect("/login"); // Success message will be accessible via req.flash in /login
  }
});


app.get("/login", (req, res) => {
  let success_msg = req.flash("success");
  res.render("login", { success_msg });
});

const port = process.env.PORT || 4000;

app.listen(port, (error) => {
  if (error) {
    console.log(error);
  }
  console.log(`App listening at port http://localhost:${port}`);
});
