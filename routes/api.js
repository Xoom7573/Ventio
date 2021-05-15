/* -- EXPRESS GLOBAL VARIABLES! -- */
const express = require("express");
const router = express.Router();

/* -- DATABASE FEATURES! -- */
const Datastore = require("nedb");
const db = new Datastore({ filename: "database.db", autoload: true });
let ID = 0;
getID();

/** -- MQTT GLOBAL VARIABLES! -- */
const client = require("mqtt").connect("mqtt://broker.hivemq.com");
let currentState = {};

/* ---------- GLOBAL API ROUTES ---------- */
// Define the home page route of our api (on ventio.xyz/api).
router.get("/", (req, res) => {
  res.send(
    "<h1>API | GIP 6TEA | BO - JELLE - BEN-JAMIN</h1>\n" +
      "<h3>To learn more about our api use (/api/about)</h3>\n" +
      `<a href="/api/about"><h4>www.ventio.xyz/api/about</h4></a>\n`
  );
});

// Define the about page route of our api (on ventio.xyz/api/about).
router.get("/about", (req, res) => {
  res.send(
    "<h1>Our Public Routes!</h1>\n" +
      "<h3>Global Routes:</h3>\n" +
      `<a href="/"><h4>www.ventio.xyz</h4></a>\n` +
      `<a href="/api"><h4>www.ventio.xyz/api</h4></a>\n` +
      `<a href="/api/currentState"><h4>www.ventio.xyz/api/currentState</h4></a>\n` +
      "<h4>-----------------------------</h4>\n" +
      "<h3>Database Routes:</h3>\n" +
      `<a href="/api/database"><h4>www.ventio.xyz/api/database</h4></a>\n` +
      `<a href="/api/database/about"><h4>www.ventio.xyz/api/database/about</h4></a>\n` +
      `<a href="/api/database/delete/all"><h4>www.ventio.xyz/api/database/delete/all</h4></a>\n` +
      `<a href="/api/database/ID"><h4>www.ventio.xyz/api/database/ID</h4></a>\n` +
      `<a href="/api"><h4>www.ventio.xyz/api/database/insert/{number} : check this one</h4></a>\n` +
      `<a href="/api/database/find/all"><h4>www.ventio.xyz/api/database/find/all</h4></a>\n` +
      `<a href="/api/database/find/latest/1"><h4>www.ventio.xyz/api/database/find/latest/{number}</h4></a>\n` +
      "<h4>-----------------------------</h4>\n" +
      "<h3>MQTT Routes:</h3>\n" +
      `<a href="/api/mqtt"><h4>www.ventio.xyz/api/mqtt</h4></a>\n` +
      `<a href="/api/mqtt/about"><h4>www.ventio.xyz/api/mqtt/about</h4></a>\n` +
      `<a href="/api/mqtt/send/ExampleTopic/HelloWorld"><h4>www.ventio.xyz/api/mqtt/send/{your topic}/{your message}</h4></a>\n` +
      `<a href="/api/mqtt/chat/HelloWorld"><h4>www.ventio.xyz/api/mqtt/chat/{your message}</h4></a>\n` +
      `<a href="/api/mqtt/sendCMD/ExampleCommand"><h4>www.ventio.xyz/api/mqtt/sendCMD/{your command}</h4></a>\n` +
      "<h4>-----------------------------</h4>\n"
  );
});

// Defines the api route that returns the currentstate of our project!
router.get("/currentState", (req, res) => {
  let date = new Date();
  let reply = {
    Status: "Succes",
    res: {
      id: ID,
      time: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
      state: currentState,
    },
  };
  res.send(reply);
});

/* ---------- DATABASE ROUTES ---------- */
// Defines the home page route.
router.get("/database", (req, res) => {
  res.send(
    "<h1>DATABASE</h1>\n" +
      "<h3>use(/about) to get more info!</h3>\n" +
      `<a href="/api/database/about"><h4>www.ventio.xyz/api/database/about</h4></a>\n`
  );
});

// Defines the about route.
router.get("/database/about", (req, res) => {
  res.send(
    "<h1>About database</h1>\n" +
      "<h3>Database Routes:</h3>\n" +
      `<a href="/api/database"><h4>www.ventio.xyz/api/database</h4></a>\n` +
      `<a href="/api/database/delete/all"><h4>www.ventio.xyz/api/database/delete/all</h4></a>\n` +
      `<a href="/api/database/ID"><h4>www.ventio.xyz/api/database/ID</h4></a>\n` +
      `<a href="/api"><h4>www.ventio.xyz/api/database/insert/{number} : check this one</h4></a>\n` +
      `<a href="/api/database/find/all"><h4>www.ventio.xyz/api/database/find/all</h4></a>\n` +
      `<a href="/api/database/find/latest/1"><h4>www.ventio.xyz/api/database/find/latest/{number}</h4></a>\n`
  );
});

// Defines the delete/all database route.
// With this you can delete all the samples of our database.
router.get("/database/delete/all", (req, res) => {
  db.remove({}, { multi: true }, (err, numRemoved) => {
    let reply = {
      Status: "Succes",
      res: {
        "Removed-Items": numRemoved,
      },
    };
    res.send(reply);
  });
  getID();
});

// Defines the database/ID route.
// This will return current (latest ID/latest Sample added to the DB) and next ID from the database.
router.get("/database/ID", (req, res) => {
  let reply = {
    Status: "Succes",
    res: {
      "Current-ID": ID,
      "Next-ID": ID + 1,
    },
  };
  res.send(reply);
});

//
router.get("/database/insert/:val", (req, res) => {
  let date = new Date();
  ID += 1;
  let doc = {
    id: ID,
    time: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
    val: req.params.val,
  };

  db.insert(doc, (err, newDoc) => {
    console.log(newDoc);
  });
  res.send({ Status: "Succes", Res: doc });
});

// Defines the database/find/all route.
// This will return all the samples that are stored in my database.
router.get("/database/find/all", (req, res) => {
  db.find({}, function (err, docs) {
    docs.sort(function (a, b) {
      return a.id - b.id;
    });
    const reply = {
      Status: "Succes",
      res: docs,
    };
    res.send(reply);
  });
});

// Defines the database/find/latest/{number: ex->'10'} route.
// With this route you can return a part of the latest data.
router.get("/database/find/latest/:i", (req, res) => {
  let i = req.params.i;

  if (i > ID)
    return res.send({
      Status: "Failed",
      res: "There arn't that many documents!",
    });

  db.find({ $or: getLatest(i) }, (err, docs) => {
    docs.sort(function (a, b) {
      return a.id - b.id;
    });
    const reply = {
      Status: "Succes",
      res: docs,
    };
    res.send(reply);
  });
});

/* ---------- MQTT ROUTES ---------- */
// Defines the home page route from mqtt.
router.get("/mqtt", (req, res) => {
  res.send(
    "<h1>MQTT</h1>\n" +
      "<h3>use(/about) to get more info!</h3>\n" +
      `<a href="/api/mqtt/about"><h4>www.ventio.xyz/api/mqtt/about</h4></a>\n`
  );
});

// Defines the about route from mqtt.
router.get("/mqtt/about", (req, res) => {
  res.send(
    "<h1>About MQTT</h1>\n" +
      "<h3>MQTT Routes:</h3>\n" +
      `<a href="/api/mqtt"><h4>www.ventio.xyz/api/mqtt</h4></a>\n` +
      `<a href="/api/mqtt/send/ExampleTopic/HelloWorld"><h4>www.ventio.xyz/api/mqtt/send/{your topic}/{your message}</h4></a>\n` +
      `<a href="/api/mqtt/chat/HelloWorld"><h4>www.ventio.xyz/api/mqtt/chat/{your message}</h4></a>\n` +
      `<a href="/api/mqtt/sendCMD/ExampleCommand"><h4>www.ventio.xyz/api/mqtt/sendCMD/{your command}</h4></a>\n`
  );
});

// Defines the mqtt/send/{your chosen topic}/{your chosen message} route.
// With this u can send messages to a "custom topic" but it will always start with dragino-1e9d94/send/{your chosen topic}.
router.get("/mqtt/send/:topic/:msg", (req, res) => {
  let tpc = req.params.topic;
  let msg = req.params.msg;

  client.publish(`dragino-1e9d94/send/${tpc}`, msg);
  let reply = { status: "succes", topic: tpc, message: msg };
  res.send(reply);
});

// Defines the mqtt/chat/{your message} route.
// With this u can send messages to the dragino-1e9d94/chat topic.
router.get("/mqtt/chat/:msg", (req, res) => {
  let msg = req.params.msg;
  client.publish(`dragino-1e9d94/chat`, msg);
  let reply = { status: "succes", message: msg };
  res.send(reply);
});

// Defines the mqtt/sendCMD/{your command} route.
// With this u can send commands to the dragino-1e9d94/cmd topic, these will be received by our lora system.
router.get("/mqtt/sendCMD/:msg", (req, res) => {
  let msg = req.params.msg;
  client.publish(`dragino-1e9d94/cmd`, msg);
  let reply = { status: "succes", topic: "dragino-1e9d94/cmd", message: msg };
  res.send(reply);
});

/* ---------- MQTT LIBRARY FUNCTIONS ---------- */
// Connect as a client!
client.on("connect", e => {
  client.subscribe("dragino-1e9d94/#");
});

// message receive callback function!
client.on("message", (topic, message) => {
  let msg = message.toString();
  if (topic === "dragino-1e9d94/LoraModule") {
    let s = msg.slice(1, -1);
    currentState = JSON.parse(s);
  } else if (topic === "dragino-1e9d94/cmd") {
    // ignore these messages!
  } else {
    // print out any other message that doesn't come from 1 of the routes above!
    console.log(`Received msg: ${msg} from ${topic}`);
  }
});

/* ---------- CUSTOM FUNCTIONS ---------- */
// Gets the latest id from the database!
function getID() {
  db.find({}, (err, data) => {
    let arrID = [-1];
    data.map(element => {
      arrID.push(element.id);
    });
    ID = Math.max.apply(null, arrID);
    console.log("curID: ", ID);
  });
}

// A little utility fucntion to get the latest data out of my database!
function getLatest(t) {
  let arr = [];
  for (let i = 0; i < t; i++) {
    arr.push({ id: ID - i });
  }
  return arr;
}

// This will save a sample to the database!
function saveState() {
  if (currentState.motor != undefined) {
    let date = new Date();
    ID += 1;
    let doc = {
      id: ID,
      time: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
      data: currentState,
    };
    db.insert(doc, (err, newDoc) => {
      console.log(newDoc);
    });
  } else {
    currentState = {};
  }
}

/* ---------- CUSTOM ACTIONS ---------- */
// This will save a sample every 10 seconds to my database!
setInterval(saveState, 10 * 1000);
//setInterval(() => console.log(currentState), 1000);

// This will export my express router so it can be enabled in 'server.js'.
module.exports = router;
