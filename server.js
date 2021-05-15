// EXPRESS | REST API
const express = require("express");
const socket = require("socket.io");
const MQTT_client = require("mqtt").connect("mqtt://broker.hivemq.com");
const app = express();
const PORT = process.env.PORT || 5000;

// Route Handler
const databaseRouter = require("./routes/api");

// SIMPLE AUTH
const AUTH_KEY = "SECRETBOJELLEBENJIGIP6TEA";
let AUTH = true;

// State handler
var State = {
  motor: false,
  autoRefresh: false,
  iTemp: "20",
  fetchAmount: "15",
};

// Initialize our express app with the correct port!
const server = app.listen(PORT, () =>
  console.log(`Server is listening on port ${PORT}...`)
);

// Enable json to be used in our backend api!
app.use(express.json());

// Define the about route
app.get("/about", (req, res) => {
  res.send(
    "<h1>About our API</h1>\n<h2>Go to /api : 'to see our home api page'</h2>\n<h2>Go to /api/about : 'to see all of our api routes'</h2>"
  );
});

// Info on how the login (simple security) works!
app.get("/login", (req, res) => {
  res.send("<h1>Login/[SECRET KEY HERE TO ENABLE THE API]</h1>");
});

// The login route (u can provide a key to login), this will enable the home page!
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

// Disable the authentication and the home page!
app.get("/logout", (req, res) => {
  if (AUTH === false) return res.send("<h1>You'r already logged out!</h1>");
  AUTH = false;
  res.send("<h1>Succesfully logged out!</h1>");
});

// Check if you have been authorized!
app.use((req, res, next) => {
  if (AUTH === true) {
    next();
  }
});

// Enable the api Router!
app.use("/api", databaseRouter);

// Enable our static pages so they can load when a user makes a request to '/'!
app.use(express.static("public"));

/* -- SOCKET.IO SETUP -- */
const io = socket(server);

/* -- SOCKET FUNCTIONALITY -- */
io.on("connection", socket => {
  console.log("connection: ", socket.id);

  io.sockets.emit("StateToClient", State);

  socket.on("StateToServer", state => {
    State = state;
    io.sockets.emit("StateToClient", State);
  });
});

/* -- CUSTOM FUNCTIONS -- */
function msgToLoraC() {
  MQTT_client.publish("dragino-1e9d94/cmd", `C${State.iTemp}`);
}

function msgToLora() {
  State.motor
    ? MQTT_client.publish("dragino-1e9d94/cmd", "A")
    : MQTT_client.publish("dragino-1e9d94/cmd", "B");
  setTimeout(msgToLoraC, 1500);
}

setInterval(msgToLora, 3000);
