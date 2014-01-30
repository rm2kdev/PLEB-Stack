var express = require('express')
var poweredBy = require('connect-powered-by');
var MongoStore = require('connect-mongo')(express);
var passport = require('passport');
var flash = require('connect-flash');

console.log("Initializing Middleware");
module.exports = function () {
    // Use middleware.  Standard [Connect](http://www.senchalabs.org/connect/)
    // middleware is built-in, with additional [third-party](https://github.com/senchalabs/connect/wiki)
    // middleware available as separate modules.
//  if ('development' == this.env) {
//    this.use(express.logger());
//  }

    this.datastore(require('locomotive-mongoose'));
    this.use(poweredBy('Locomotive'));
    this.use(express.favicon());
    this.use(express.static(__dirname + '/../../public'));
    this.use(express.bodyParser());
    this.use(express.cookieParser());

    store = new MongoStore({url: conf[this.env].database_connection, clear_interval: 600});
    this.use(express.session({
        secret: 'asdec321!ew31',
        store: store
    }));
    this.use(passport.initialize());
    this.use(passport.session());

    this.use(flash())
    this.use(function (req, res, next) {
        res.locals.flash = req.flash();
        next();
    });

    this.use(express.methodOverride());
    this.use(this.router);
    this.use(express.errorHandler());
}
