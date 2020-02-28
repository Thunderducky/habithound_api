require("dotenv").config();
const moment = require("moment");
const passport = require("passport");
const { Strategy:JwtStrategy, ExtractJwt } = require('passport-jwt');
const db = require("../models");
const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET
}

// Extract the relevant user information
passport.use(new JwtStrategy(opts, async (jwt_payload, done) => {
    try {
        if(jwt_payload.exp < moment().unix()){
            return done(null, false); // We have an expired token
        }
        const user = await db.User.findOne({
            uuid: jwt_payload.sub
        });
        // if the user is valid and hasn't expired
        if (user) {
            return done(null, user)
        } else {
            return (null, false)
        }
    } catch (err) {
        done(err);
    }
}));

module.exports = passport;