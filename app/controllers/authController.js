var locomotive = require('locomotive')
var Controller = locomotive.Controller;
var passport = require("passport")

var authController = new Controller();

authController.register = function() {
    var controller = this;

    console.log(controller.req.body)
    User.registerUser(controller.req.body.username,controller.req.body.password,controller.req.body.email,controller.req.body.name, function(err,user){
        if(err){
            controller.req.flash("error", "Oops! there was a problem!")
            controller.res.redirect("/register")
        }else if(user){
            controller.req.flash("success", "success your account was created!")
            controller.res.redirect("/login")
        }else{
            controller.req.flash("error", "Oops! there was a problem!")
            controller.res.redirect("/register")
        }
    })

}

authController.login = function() {
    var controller = this;
    controller.req.flash("success", "thanks for logging in!!")
    controller.res.redirect("/dashboard")
}
authController.before('login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }))


module.exports = authController;
