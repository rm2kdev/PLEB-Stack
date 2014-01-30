var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy

console.log("Initializing Passport");
module.exports = function() {

    passport.use(new LocalStrategy(
        function(email, password, done) {
            User.findOne({ username: username }, function (err, user) {
                if (err) { return done(err); }
                if (!user) {
                    return done(null, false, { message: 'Incorrect username.' });
                }
                if (!user.validPassword(password)) {
                    return done(null, false, { message: 'Incorrect password.' });
                }
                return done(null, user);
            });
        }
    ));
}
