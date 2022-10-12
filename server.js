const path = require("path");
const express = require("express");
const app = express();
require('dotenv').config();
const { PORT = 8080 } = process.env;

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});





https: app.listen(PORT, () => console.log(`I'm listening on port ${PORT}`));
