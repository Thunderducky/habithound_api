const db = require("../models");
const router = require("express").Router();
const { generateUuid } = require("../service/idService");
const jwt = require("jsonwebtoken");
const {hasValidToken} = require("../middleware");

const { JWT_SECRET } = process.env;

router.post("/register", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for malformed signup
        if (!email || !password) {
            return res.status(401).send("Missing email or password");
        }

        // Pre-existing user -> Can't signup
        const matchingUser = await db.User.findOne({ email });
        if (matchingUser) {
            return res.status(401).send("This email address has already been registered"); // User enumeration maybe? gross
        }

        // email is available, for now we just give it to them but we need to have a process that lets you verify and signup, would mean I need an email service
        await db.User.create({ uuid: generateUuid(), email, password });

        return res.status(200).json(true);
    } catch (err) {
        console.log(err);
        res.status(500).send("An unexpected error occurred during registration")
    }
})

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Malformed signup
        if (!email || !password) {
            return res.status(401).send("Incorrect email or password");
        }

        // Pre-existing user -> Can't signup
        console.log("check for user");
        const matchingUser = await db.User.findOne({ email });
        if (!matchingUser) {
            return res.status(401).send("Incorrect email or password");
        }
        console.log("matching user");
        const payload = {
            sub: matchingUser.uuid
        }
        jwt.sign(payload, JWT_SECRET, { expiresIn: '1h'}, function (err, token) {
            if (err) {
                res.status(500).send("Error while authenticating");
            } else {
                res.status(200).json({token});
            }
        });
    } catch (ex) {
        res.status(500).send("Error while authenticating");
    }
})

router.get("/test", hasValidToken, (req, res) => {
    res.json({user: req.user, msg: "Signed In"})
})

module.exports = router;