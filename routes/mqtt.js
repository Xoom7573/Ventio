// EXPRESS STUFF
const express = require("express");
const router = express.Router();

// MQTT STUFF
const client = require("mqtt").connect("mqtt://broker.hivemq.com");

router.get("/send/:topic/:msg", (req, res) => {
    let tpc = req.params.topic;
    let msg = req.params.msg;

    client.publish(`dragino-1e9d94/send/${tpc}`, msg);
    let reply = { status: "succes", topic: tpc, message: msg };
    res.send(reply);
});

router.get("/chat/:msg", (req, res) => {
    let msg = req.params.msg;
    client.publish(`dragino-1e9d94/chat`, msg);
    let reply = { status: "succes", message: msg };
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
    if (topic === "dragino-1e9d94/Loramodule") {
        let s = msg.slice(1, -1);
        currentState = JSON.parse(s);
        console.log(currentState);
    }
    console.log(`Received msg: ${msg} from ${topic}`);
});

module.exports = router;
