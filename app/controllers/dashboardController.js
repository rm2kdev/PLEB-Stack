var locomotive = require('locomotive');
var Controller = locomotive.Controller;
var passport = require("passport");

var dashboardController = new Controller();

dashboardController.dashboard = function () {
    this.render();
}

dashboardController.before('*', function (req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    else {
        req.flash("info", "Please login before trying to access dashboard");
        res.redirect('/login');
    }
})

module.exports = dashboardController;
