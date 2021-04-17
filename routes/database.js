const express = require("express");
const router = express.Router();

/* DATABASE STUFF */
const Datastore = require("nedb");
const db = new Datastore({ filename: "database.db", autoload: true });
let ID = 0;

getID();

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

    function getLatest(t) {
        let arr = [];
        for (let i = 0; i < t; i++) {
            arr.push({ id: ID - i });
        }
        return arr;
    }

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

module.exports = router;
