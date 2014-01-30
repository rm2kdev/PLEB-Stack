// Draw routes.  Locomotive's router provides expressive syntax for drawing
// routes, including support for resourceful routes, namespaces, and nesting.
// MVC routes can be mapped to controllers using convenient
// `controller#action` shorthand.  Standard middleware in the form of
// `function(req, res, next)` is also fully supported.  Consult the Locomotive
// Guide on [routing](http://locomotivejs.org/guide/routing.html) for additional
// information.
module.exports = function routes() {

    //Match Pages
    this.match('/', 'pages#main');

    //Match Auth
    this.match('/register', 'pages#register');
    this.match('/login', 'pages#login');

    //Match Dashboard
    this.match('/dashboard', 'dashboard#dashboard');


    //Match Api
    this.match('/auth/register', 'auth#register', { via: ['post'] });
    this.match('/auth/login', 'auth#login', { via: ['post'] });

}
