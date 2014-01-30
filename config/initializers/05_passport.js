var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy

console.log("Initializing Passport");
module.exports = function () {

    passport.use(new LocalStrategy(
        function (username, password, done) {
            User.findOne({ username: username }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false, { message: 'Incorrect username.' });
                }
                user.validPassword(password, function (valid) {
                    if (valid) {
                        return done(null, user);

                    } else {
                        return done(null, false, { message: 'Incorrect password.' });
                    }
                })

            });
        }
    ));

    passport.serializeUser(function (user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

}
