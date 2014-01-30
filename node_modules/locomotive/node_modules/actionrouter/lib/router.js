/**
 * Module dependencies.
 */
var Methods = require('methods')
  , inflect = require('i')()
  , utils = require('./utils')
  , Namespace = require('./namespace')
  , Entry = require('./entry');


/**
 * `Router` constructor.
 *
 * @api private
 */
function Router(handler) {
  this._handler = handler;
  this._define = undefined;
  this._assist = undefined;
  this._ns = [];
  this._ns.push(new Namespace());
  this._entries = {};
}

/**
 * Draw routes.
 *
 * Executes `fn` in the context of the `Router` instance.
 *
 * @param {Function} fn
 * @api public
 */
Router.prototype.draw = function(fn) {
  fn.apply(this);
};

/**
 * Create a route to the root path ('/').
 *
 * For options, see `match()`, as `root()` invokes it internally.
 *
 * The root route should be placed at the top of `config/routes.js` in order to
 * match against it first.  As this route is typically the most popular route of
 * a web application, this is an optimization.
 * 
 * Examples:
 *
 *     this.root('pages#main');
 *
 * @param {String|Object} shorthand
 * @param {Object} options
 * @api public
 */
Router.prototype.root = function(shorthand, options) {
  this.match('', shorthand, options);
};

/**
 * Create a route matching `pattern`.
 *
 * A route that will be handled by `songsController#show()` can be specified
 * using shorthand notation:
 *
 *     this.match('songs/:title', 'songs#show');
 *
 * which is equivalent to using `controller` and `action` options.
 *
 *     this.match('songs/:title', { controller: 'songs', action: 'show' });
 *
 *
 * If an `as` option is specified, path and URL routing helper functions will be
 * dynamically declared.  For example, given the following route:
 *
 *    this.match('bands/:id', 'bands#show', { as: 'bands' });
 *
 * the following routing helpers will be available to views:
 *
 *    bandsPath(101)
 *    // => "/bands/101"
 *    bandsPath('counting-crows')
 *    // => "/bands/counting-crows"
 *    bandsPath({ id: '507f1f77bcf86cd799439011' })
 *    // => "/bands/507f1f77bcf86cd799439011"
 *
 *    bandsURL(101)
 *    // => "http://www.example.com/bands/101"
 *    bandsURL('counting-crows')
 *    // => "http://www.example.com/bands/counting-crows"
 *    bandsURL({ id: '507f1f77bcf86cd799439011' })
 *    // => "http://www.example.com/bands/507f1f77bcf86cd799439011"
 *
 *
 * Options:
 *
 *  - 'controller'  the route's controller
 *  - 'action'      the route's action
 *  - `as`          name used to declare routing helpers
 *  - `via`         allowed HTTP method(s) for route
 * 
 * Examples:
 *
 *     this.match('songs/:title', 'songs#show');
 *
 *     this.match('songs/:title', { controller: 'songs', action: 'show' });
 *
 *     this.match('bands', 'bands#create', { via: 'post' });
 *
 * @param {String} pattern
 * @param {String|Object} shorthand
 * @param {Object} options
 * @api public
 */
Router.prototype.match = function(pattern, shorthand, _options) {
  var options = _options;
  if (!options && typeof shorthand === 'object') {
    options = shorthand;
  }
  if (typeof options == 'function' && typeof arguments[arguments.length - 1] == 'object') {
    options = arguments[arguments.length - 1];
  }
  options = options || {};
  
  if (typeof shorthand === 'string') {
    var split = shorthand.split('#');
    options.controller = split[0];
    options.action = split[1];
  }
  
  var ns = this._ns[this._ns.length - 1]
    , method = (options.via || 'get')
    , methods = Array.isArray(method) ? method : [ method ]
    , path = ns.qpath(pattern)
    , controller = ns.qcontroller(options.controller)
    , action = utils.functionize(options.action)
    , helper = utils.functionize(options.as);
  
  for (var i = 0, len = methods.length; i < len; i++) {
    method = methods[i].toLowerCase();
    if (Methods.indexOf(method) == -1) { throw new Error('Method "' + method + '" is not supported by protocol'); }
    
    if (typeof shorthand === 'function' || Array.isArray(shorthand)) {
      var callbacks = utils.flatten([].slice.call(arguments, 1));
      // pop off any final options argument
      if (typeof callbacks[callbacks.length - 1] != 'function') { callbacks.pop(); }
    
      // Mount functions or arrays of functions directly as Express route
      // handlers/middleware.
      this.define(method, path, callbacks);
      if (helper) {
        this.assist(helper, path);
      }
    } else {
      this._route(method, path, controller, action, helper);
    }
  }
};

/**
 * Create a verb route matching `pattern`.
 *
 * A POST request that will be handled by `bandsController#create()` can be
 * specified using shorthand notation:
 *
 *     this.post('bands', 'bands#create');
 *
 * which is equivalent to using `controller` and `action` options.
 *
 *     this.post('bands', { controller: 'bands', action: 'create' });
 *
 * Verb routes are syntactic sugar for `match` routes.
 *
 *
 * Verb routes also mean Locomotive's router implements support for the complete
 * API exposed by Express for routing, making it easy to migrate routes from
 * Express to Locomotive.
 *
 * For example, reusing existing middleware for a user API.
 *
 *     this.get('/user/:id', user.load, function(req, res) {
 *       res.json(req.locals.user);
 *     });
 *
 *
 * Options:
 *
 *  - 'controller'  the route's controller
 *  - 'action'      the route's action
 *  - `as`          name used to declare routing helpers
 *
 * @param {String} pattern
 * @param {String|Object} shorthand
 * @param {Object} options
 * @api public
 */
Methods.forEach(function(method) {
  Router.prototype[method] = function(pattern, shorthand, options) {
    var args = [].slice.call(arguments)
      , opts = {}
      , la = arguments[arguments.length - 1];

    if (typeof la == 'object' && typeof la != 'function' && !Array.isArray(la)) {
      args = [].slice.call(arguments, 0, arguments.length - 1);
      opts = arguments[arguments.length - 1];
    }

    opts.via = method;
    args.push(opts);
    this.match.apply(this, args);
  };
});

// del -> delete alias
Router.prototype.del = Router.prototype.delete;

/**
 * Create resourceful routes for singleton resource `name`.
 *
 * A resourceful route provides a mapping between HTTP methods and URLs to
 * corresponding controller actions.  A single entry in the route configuration,
 * such as:
 *
 *     this.resource('profile');
 *
 * creates six different routes in the application, all handled by
 * `profileController` (note that the controller is singular).
 *
 *     GET     /profile/new   -> new()
 *     POST    /profile       -> create()
 *     GET     /profile       -> show()
 *     GET     /profile/edit  -> edit()
 *     PUT     /profile       -> update()
 *     DELETE  /profile       -> destroy()
 *
 * Additionally, path and URL routing helpers will be dynamically declared.
 *
 *     profilePath()
 *     // => "/profile"
 *     newProfilePath()
 *     // => "/profile/new"
 *     editAccountPath()
 *     // => "/profile/edit"
 *
 *     profileURL()
 *     // => "http://www.example.com/profile"
 *     newProfileURL()
 *     // => "http://www.example.com/profile/new"
 *     editAccountURL()
 *     // => "http://www.example.com/profile/edit"
 *
 * The singleton variation of a resourceful route is useful for resources which
 * are referenced without an ID, such as /profile, which always shows the
 * profile of the currently logged in user.  In this case, a singular resource
 * maps /profile (rather than /profile/:id) to the show action.
 * 
 * Examples:
 *
 *     this.resource('profile');
 *
 * @param {String} name
 * @api public
 */
Router.prototype.resource = function(name, options, fn) {
  if (typeof options === 'function') {
    fn = options;
    options = {};
  }
  options = options || {};
  
  var actions = [ 'new', 'create', 'show', 'edit', 'update', 'destroy' ]
    , ns = this._ns[this._ns.length - 1]
    , path = ns.qpath(name)
    , controller = ns.qcontroller(name)
    , helper = ns.qfunction(name);
  
  if (options.only) {
    actions = Array.isArray(options.only) ? options.only : [ options.only ];
  } else if (options.except) {
    var except = Array.isArray(options.except) ? options.except : [ options.except ];
    actions = actions.filter(function(a) {
      return except.indexOf(a) == -1;
    });
  }
  
  var self = this;
  actions.forEach(function(action) {
    switch (action) {
      case 'new':     self._route('get' , path + '/new.:format?' , controller, 'new'     , utils.functionize('new', helper));
        break;
      case 'create':  self._route('post', path                   , controller, 'create' );
        break;
      case 'show':    self._route('get' , path + '.:format?'     , controller, 'show'    , helper);
        break;
      case 'edit':    self._route('get' , path + '/edit.:format?', controller, 'edit'    , utils.functionize('edit', helper));
        break;
      case 'update':  self._route('put' , path                   , controller, 'update' );
        break;
      case 'destroy': self._route('del' , path                   , controller, 'destroy');
        break;
    }
  });
  
  this.namespace(name, { module: options.namespace ? name : null, method: name }, function() {
    fn && fn.call(this);
  });
};

/**
 * Create resourceful routes for collection resource `name`.
 *
 * A resourceful route provides a mapping between HTTP methods and URLs to
 * corresponding controller actions.  A single entry in the route configuration,
 * such as:
 *
 *     this.resources('photos');
 *
 * creates seven different routes in the application, executed by
 * `photosController`.
 *
 *     GET     /photos           -> index()
 *     GET     /photos/new       -> new()
 *     POST    /photos           -> create()
 *     GET     /photos/:id       -> show()
 *     GET     /photos/:id/edit  -> edit()
 *     PUT     /photos/:id       -> update()
 *     DELETE  /photos/:id       -> destroy()
 *
 * Additionally, path and URL routing helpers will be dynamically declared.
 *
 *     photosPath()
 *     // => "/photos"
 *     photoPath('abc123')
 *     // => "/photos/abc123"
 *     newPhotoPath()
 *     // => "/photos/new"
 *     editPhotoPath('abc123')
 *     // => "/photos/abc123/edit"
 *
 * Resources can also be nested infinately using callback syntax:
 *
 *     router.resources('bands', function() {
 *       this.resources('albums');
 *     });
 * 
 * Examples:
 *
 *     this.resources('photos');
 *
 * @param {String} name
 * @api public
 */
Router.prototype.resources = function(name, options, fn) {
  if (typeof options === 'function') {
    fn = options;
    options = {};
  }
  options = options || {};
  
  var actions = [ 'index', 'new', 'create', 'show', 'edit', 'update', 'destroy' ]
    , ns = this._ns[this._ns.length - 1]
    , singular = inflect.singularize(name)
    , path = ns.qpath(name)
    , param = options.param ? (':' + options.param) : ':id'
    , controller = ns.qcontroller(name)
    , helper = ns.qfunction(singular)
    , collectionHelper = ns.qfunction(name)
    , placeholder;
  
  if (options.only) {
    actions = Array.isArray(options.only) ? options.only : [ options.only ];
  } else if (options.except) {
    var except = Array.isArray(options.except) ? options.except : [ options.except ];
    actions = actions.filter(function(a) {
      return except.indexOf(a) == -1;
    });
  }
  
  var self = this;
  actions.forEach(function(action) {
    switch (action) {
      case 'index':   self._route('get' , path + '.:format?'                   , controller, 'index'   , collectionHelper);
        break;
      case 'new':     self._route('get' , path + '/new.:format?'               , controller, 'new'     , utils.functionize('new', helper));
        break;
      case 'create':  self._route('post', path                                 , controller, 'create' );
        break;
      case 'show':    self._route('get' , path + '/' + param + '.:format?'     , controller, 'show'    , helper);
        break;
      case 'edit':    self._route('get' , path + '/' + param + '/edit.:format?', controller, 'edit'    , utils.functionize('edit', helper));
        break;
      case 'update':  self._route('put' , path + '/' + param                   , controller, 'update' );
        break;
      case 'destroy': self._route('del' , path + '/' + param                   , controller, 'destroy');
        break;
    }
  });
  
  placeholder = options.param ? (':' + options.param) : (':' + utils.underscore(singular) + '_id');
  this.namespace(name + '/' + placeholder, { module: options.namespace ? name : null, method: singular }, function() {
    fn && fn.call(this);
  });
};

/**
 * Create namespace in which to organize routes.
 *
 * Typically, you might want to group administrative routes under an `admin`
 * namespace.  Controllers for these routes would be placed in the `app/controllers/admin`
 * directory.
 *
 * A namespace with resourceful routes, such as:
 *
 *     this.namespace('admin', function() {
 *       this.resources('posts');
 *     });
 *
 * creates namespaced routes handled by `admin/postsController`:
 *
 *     GET     /admin/posts
 *     GET     /admin/posts/new
 *     POST    /admin/posts
 *     GET     /admin/posts/:id
 *     GET     /admin/posts/:id/edit
 *     PUT     /admin/posts/:id
 *     DELETE  /admin/posts/:id
 *
 * @param {String} name
 * @param {Function} fn
 * @api public
 */
Router.prototype.namespace = function(name, options, fn) {
  if (typeof options === 'function') {
    fn = options;
    options = {};
  }
  options = options || {};
  
  var ns = this._ns[this._ns.length - 1];
  this._ns.push(new Namespace(name, options, ns));
  fn.call(this);
  this._ns.pop();
};

/**
 * Find route to `controller` and `action`.
 * 
 * @param {String} controller
 * @param {String} action
 * @return {Route}
 * @api protected
 */
Router.prototype.find = function(controller, action) {
  var key = controller + '#' + action;
  return this._entries[key];
};

/**
 * Registers a function used to create handlers for an underlying server.
 *
 * When declaring routes, `Router` creates handler functions bound to a
 * controller action.  It is the responsiblity of the framework making use of
 * `Router` to then mount these functions in a manner in which they can be
 * invoked by the underlying server.
 *
 * For instance, Locomotive mounts handlers using Express.
 *
 * Examples:
 *
 *     var dispatch = require('./middleware/dispatch');
 *
 *     router.handler(function(controller, action) {
 *       return dispatch(controller, action);
 *     });
 *
 * @param {Function} method
 * @api public
 */
Router.prototype.handler = function(handler) {
  this._handler = handler;
};

/**
 * Registers a function used to define routes in an underlying server.
 *
 * When declaring routes, `Router` creates handler functions bound to a
 * controller action.  It is the responsiblity of the framework making use of
 * `Router` to then mount these functions in a manner in which they can be
 * invoked by the underlying server.
 *
 * For instance, Locomotive mounts handlers using Express.
 *
 * Examples:
 *
 *     var app = express();
 *     
 *     router.define(function(method, path, callbacks) {
 *       app[method](path, callbacks);
 *     });
 *
 * @param {Function} method
 * @api public
 */
Router.prototype.define = function(method, pattern, callbacks) {
  if (typeof method === 'function') {
    this._define = method;
    return this;
  }
  
  if (!this._define) { throw new Error('Router is unable to define routes'); }
  this._define.apply(undefined, arguments);
};

/**
 * Registers a function used to assist routing in an application.
 *
 * @param {Function} name
 * @api public
 */
Router.prototype.assist = function(name, entry) {
  if (typeof name === 'function') {
    this._assist = name;
    return this;
  }
  
  if (!this._assist) { return; }
  this._assist.apply(undefined, arguments);
};

/**
 * Create route from `method` and `pattern` to `controller` and `action`.
 * 
 * @param {String} method
 * @param {String} pattern
 * @param {String} controller
 * @param {String} action
 * @api private
 */
Router.prototype._route = function(method, pattern, controller, action, helper) {
  // Define a route handler that dispatches to a controller action.
  this.define(method, pattern, this._handler(controller, action));
  
  // Add the entry to the reverse routing table.  The reverse routing table is
  // used by routing helper functions to construct URLs to a specific controller
  // action.  When building paths and URLs, routes declared first take priority.
  // Therefore, if there is already an entry for this controller action in the
  // table, don't overwrite it.
  var entry = new Entry(controller, action, pattern);
  var key = entry.key();
  if (!this._entries[key]) {
    this._entries[key] = entry;
  }
  
  // Declare path and URL routing helper functions.
  if (helper) {
    this.assist(helper, entry);
  }
};


/**
 * Expose `Router`.
 */
module.exports = Router;
