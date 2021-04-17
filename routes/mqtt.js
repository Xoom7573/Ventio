// EXPRESS STUFF
const express = require("express");
const router = express.Router();

// MQTT STUFF
const client = require("mqtt").connect("mqtt://broker.hivemq.com");

// STATE HANDLER
let state = getState(); // +function that gets latest data out of our db

router.get("/getState", (req, res) => {
    res.send(state);
});

router.get("/send/:topic/:msg", (req, res) => {
    let tpc = req.params.topic;
    let msg = req.params.msg;

    client.publish(`dragino-1e9d94/test/${tpc}`, msg);
    let reply = { status: "succes", topic: tpc, message: msg };
    res.send(reply);
});

router.get("/sendCMD/:msg", (req, res) => {
    let msg = req.params.msg;

    client.publish(`dragino-1e9d94/cmd`, msg);
    let reply = { status: "succes", topic: "dragino-1e9d94/cmd", message: msg };
    res.send(reply);
});

// MQTT STUFF!
client.on("connect", e => {
    client.subscribe("dragino-1e9d94/#");
});

client.on("message", (topic, message) => {
    let msg = message.toString();
    console.log(`Received msg: ${msg} from ${topic}`);
});

// CUSTOM FUNCTIONS
function getState() {
    let o = {};
    return o;
}

module.exports = router;
