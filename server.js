// EXPRESS | REST API
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;

// Route Handler
const databaseRouter = require("./routes/api");

// SIMPLE AUTH
const AUTH_KEY = "SECRETBOJELLEBENJIGIP6TEA";
let AUTH = true;

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}...`));

app.use(express.json());

// define the home page route
app.get("/", (req, res) => {
  res.send("<h1>API | GIP 6TEA | BO - JELLE - BEN-JAMIN</h1>");
});

// define the about route
app.get("/about", (req, res) => {
  res.send("<h1>About our API</h1>");
});

app.get("/login", (req, res) => {
  res.send("<h1>Login/[SECRET KEY HERE TO ENABLE THE API]</h1>");
});

app.get("/login/:key", (req, res) => {
  if (AUTH === true) return res.send("<h1>You'r already logged in!</h1>");
  if (req.params.key === AUTH_KEY) {
    AUTH = true;
    res.send("<h1>Succesfull login!</h1>");
  } else {
    AUTH = false;
    res.send("<h1>incorrect secret!</h1>");
  }
});

app.get("/logout", (req, res) => {
  if (AUTH === false) return res.send("<h1>You'r already logged out!</h1>");
  AUTH = false;
  res.send("<h1>Succesfully logged out!</h1>");
});

app.use((req, res, next) => {
  if (AUTH === true) {
    next();
  }
});

app.use("/api", databaseRouter);
app.use("/public", express.static("public"));
