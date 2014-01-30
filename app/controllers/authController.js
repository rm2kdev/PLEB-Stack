var locomotive = require('locomotive')
  , Controller = locomotive.Controller;

var pagesController = new Controller();

pagesController.register = function() {
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

pagesController.login = function() {
    this.render();
}

module.exports = pagesController;
