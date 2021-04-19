// EXPRESS | REST API
const express = require("express");
const app = express();
const PORT = process.env.PORT || 5000;

// Route Handler
const databaseRouter = require("./routes/api");

app.listen(PORT, () => console.log(`Server is listening on port ${PORT}...`));
app.use(express.json());
app.use("/api", databaseRouter);
app.use("/public", express.static("public"));
