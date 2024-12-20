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
const multer = require("multer");
const cookieParser = require("cookie-parser");
const characterModels = require("./models/characterModels");

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
app.use(cookieParser());

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 },
});

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/home", async (req, res) => {
  const videos = await characterModels.find();
  const characters = await characterModels.find();

  // Convert the image buffer to Base64 string
  const charactersWithImageBase64 = characters.map((character) => {
    if (character.image) {
      character.imageBase64 = character.image.toString("base64");
    }
    return character;
  });
  res.render("home", { videos, characters: charactersWithImageBase64 });
});

app.get("/inputDetails", (req, res) => {
  res.render("inputDetails");
});

app.post(
  "/create",
  upload.fields([
    { name: "imageFile", maxCount: 1 },
    { name: "videoFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, link } = req.body;
      const imageBuffer =
        req.files && req.files.imageFile ? req.files.imageFile[0].buffer : null;
      const videoBuffer =
        req.files && req.files.videoFile ? req.files.videoFile[0].buffer : null;

      if (!imageBuffer || !videoBuffer) {
        return res
          .status(400)
          .send("Both image and video are required. Please try again.");
      }

      // console.log("Uploaded Image:", req.files.imageFile);
      // console.log("Uploaded Video:", req.files.videoFile);

      const newCharacter = new characterModels({
        name,
        image: imageBuffer,
        video: videoBuffer,
        link,
      });

      await newCharacter.save();
      res.send("Character with image and video uploaded successfully!");
    } catch (error) {
      console.error("Error during character upload:", error.message);
      res.status(500).send("Error uploading character: " + error.message);
    }
  }
);

app.get("/video/:id", async (req, res) => {
  try {
    const video = await characterModels.findById(req.params.id);
    res.send(video.video);
  } catch (error) {
    res.status(500).send("Error streaming video");
  }
});
// GET REGISTER
app.get("/register", (req, res) => {
  let error_msg = req.flash("error");
  res.render("register", { error_msg });
});

// POST REGISTER
app.post("/register", async (req, res) => {
  let { firstname, lastname, email, password, password2 } = req.body;
  let user = await userModel.findOne({ email });
  if (user) {
    req.flash("error", "Email already exists");
    res.redirect("/register");
    return;
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
  res.render("login", { success_msg, login_error });
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
