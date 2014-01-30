var locomotive = require('locomotive')
  , Controller = locomotive.Controller;

var pagesController = new Controller();

pagesController.main = function() {
    this.render();
}

pagesController.register = function() {
    this.render();
}

pagesController.login = function() {
    this.render();
}

module.exports = pagesController;
