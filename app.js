const express = require("express");
const app = express();
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.json());

app.get("/", (req, res) => {
  res.render("home");
});

const port = process.env.PORT || 4000;

app.listen(port, (error) => {
  if (error) {
    console.log(error);
  }
  console.log(`App listening at port http://localhost:${port}`);
});
