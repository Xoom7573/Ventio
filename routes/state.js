// EXPRESS STUFF
const express = require("express");
const router = express.Router();

// STATE HANDLER
let currentState = getState(); // +function that gets latest data out of our db

router.get("/getState", (req, res) => {
    res.send(currentState);
});

// CUSTOM FUNCTIONS
function getState() {
    let o = {};
    return o;
}

module.exports = router;
