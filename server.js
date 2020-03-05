require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const passport = require("./config/passport");
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const authRouter = require("./routes/authRoutes");
const habitRouter = require("./routes/habitRoutes");
mongoose.connect(MONGODB_URI || "mongodb://localhost/habithacker", { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(passport.initialize());

app.get("/", (req, res) => res.send("Welcome to the HabitHound API"))
app.use("/api/auth/local/", authRouter);
app.use("/api/habits/", habitRouter)

app.listen(PORT, () => {
    console.log("Listening on port:", PORT)
});

