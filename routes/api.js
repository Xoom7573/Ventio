/* GLOBALS */
// EXPRESS
const express = require("express");
const router = express.Router();

// DATABASE
const Datastore = require("nedb");
const db = new Datastore({ filename: "database.db", autoload: true });
let ID = 0;
getID();

// MQTT
const client = require("mqtt").connect("mqtt://broker.hivemq.com");
let currentState = {};

/* ---------- GLOBAL ROUTES ---------- */
// define the home page route
router.get("/", (req, res) => {
    res.send("<h1>API</h1>");
});

// define the about route
router.get("/about", (req, res) => {
    res.send("<h1>About our API</h1>");
});

router.get("/currentState", (req, res) => {
    let reply = {
        Status: "Succes",
        res: currentState,
    };
    res.send(reply);
});

/* ---------- DATABASE ROUTES ---------- */
// define the home page route
router.get("/", (req, res) => {
    res.send("<h1>Database | use(/about) to get more info!</h1>");
});

// define the about route
router.get("/about", (req, res) => {
    res.send("<h1>About database</h1>");
});

router.get("/delete/all", (req, res) => {
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

router.get("/ID", (req, res) => {
    let reply = {
        Status: "Succes",
        res: {
            "Current-ID": ID,
            "Next-ID": ID + 1,
        },
    };
    res.send(reply);
});

router.get("/insert/:val", (req, res) => {
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

//changed res from newDocs to docs and console.log from newDocs to docs
router.get("/find/all", (req, res) => {
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

router.get("/find/latest/:i", (req, res) => {
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
// define the home page route
router.get("/", (req, res) => {
    res.send("<h1>MQTT | use(/about) to get more info!</h1>");
});

// define the about route
router.get("/about", (req, res) => {
    res.send("<h1>About MQTT</h1>");
});

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

/* ---------- MQTT LIBRARY FUNCTIONS ---------- */
client.on("connect", e => {
    client.subscribe("dragino-1e9d94/#");
});

client.on("message", (topic, message) => {
    let msg = message.toString();
    if (topic === "dragino-1e9d94/LoraModule") {
        let s = msg.slice(1, -1);
        let date = new Date();
        currentState = {
            id: ID,
            time: `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`,
            data: JSON.parse(s),
        };
    } else {
        console.log(`Received msg: ${msg} from ${topic}`);
    }
});

/* ---------- CUSTOM FUNCTIONS ---------- */
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

function getLatest(t) {
    let arr = [];
    for (let i = 0; i < t; i++) {
        arr.push({ id: ID - i });
    }
    return arr;
}

function saveState() {
    if (currentState.id != undefined) {
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
setInterval(saveState, 60 * 1000);

//setInterval(() => console.log(currentState), 1000);

module.exports = router;
