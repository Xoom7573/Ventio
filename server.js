/* EXPRESS | REST API */
// CONST VARS
const express = require("express");
const socket = require("socket.io");
const MQTT_client = require("mqtt").connect("mqtt://broker.hivemq.com");
const app = express();
const PORT = process.env.PORT || 5000;

// Route Handler
const databaseRouter = require("./routes/api");

// Simple authentication
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

// Enable JSON to be used in our backend api!
app.use(express.json());

// Define the about route.
app.get("/about", (req, res) => {
  res.send(
    "<h1>About our webpage!</h1>\n" +
      `<a href="/api"><h4>Go to /api : to see our home api page</h4></a>\n`
  );
});

// Info on how the login works! (simple security)
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

// Disable the authentication (aka. the home page)!
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

// Enable our static website so they can load when a user makes a request to '/'!
app.use(express.static("public"));

/* -- SOCKET.IO SETUP -- */
const io = socket(server);

/* -- SOCKET FUNCTIONALITY -- */
// Runs when a new connection is made!
io.on("connection", socket => {
  // Logs the id from the client that made a connection.
  console.log("connection: ", socket.id);

  // Sends immediatly the Controls state back to the client.
  io.sockets.emit("StateToClient", State);

  // Listens if there are changes happening to the control state from our website.
  socket.on("StateToServer", state => {
    State = state;
    io.sockets.emit("StateToClient", State);
  });
});

/* -- CUSTOM FUNCTIONS -- */
// This will send a set_temp to the MQTT broker!
function msgToLoraC() {
  MQTT_client.publish("dragino-1e9d94/cmd", `C${State.iTemp}`);
}

// This will send a command to start and stop the motor to the MQTT broker!
function msgToLora() {
  State.motor
    ? MQTT_client.publish("dragino-1e9d94/cmd", "A")
    : MQTT_client.publish("dragino-1e9d94/cmd", "B");
  // this will msgToLoraC run after a second
  setTimeout(msgToLoraC, 1000);
}

// Run every 2 seconds
setInterval(msgToLora, 2000);
