var express = require("express");
var router = express.Router();

// define the home page route
router.get("/", (req, res) => {
    res.send("Database");
});
// define the about route
router.get("/about", (req, res) => {
    res.send("About database");
});

module.exports = router;
