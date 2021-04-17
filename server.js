const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;

// Route Handler
const databaseRouter = require("./routes/database");
const mqttRouter = require("./routes/mqtt.js");

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}...`));

app.use("/database", databaseRouter);

app.use("/mqtt", mqttRouter);

app.use("/public", express.static("public"));

app.use(express.json());
