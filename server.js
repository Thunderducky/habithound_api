const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.connect(MONGODB_URI || "mongodb://localhost/habithacker")

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log("Listening on port:", PORT)
})
// // Static directory to be served
// app.use(express.static("app/public"));

