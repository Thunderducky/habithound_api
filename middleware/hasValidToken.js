// Eventually we might provide better authentication here
const passport = require("../config/passport");
module.exports = function hasValidToken(req, res, next){
    return passport.authenticate("jwt", {session: false})(req, res, next)
}