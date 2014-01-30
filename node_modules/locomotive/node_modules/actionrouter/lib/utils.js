/**
 * Capitalize the first word of `str`.
 *
 * Examples:
 *
 *    capitalize('hello there');
 *    // => "Hello there"
 *
 * @param {String} str
 * @return {String}
 * @api public
 */
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.substr(1);
}

/**
 * Decapitalize the first word of `str`.
 *
 * Examples:
 *
 *    decapitalize('Hello there');
 *    // => "hello there"
 *
 * @param {String} str
 * @return {String}
 * @api public
 */
function decapitalize(str) {
  return str[0].toLowerCase() + str.slice(1);
}

/**
 * Camel-ize the given `str`.
 *
 * Examples:
 *
 *    camelize('foo_bar');
 *    // => "fooBar"
 *  
 *    camelize('foo_bar_baz', true);
 *    // => "FooBarBaz"
 *
 * @param {String} str
 * @param {Boolean} uppercaseFirst
 * @return {String}
 * @api public
 */
function camelize(str, uppercaseFirst) {
  return str.split(/[_-]/).map(function(word, i){
    if (i || (0 === i && uppercaseFirst)) {
      word = capitalize(word);
    } else if (0 === i && !uppercaseFirst) {
      word = decapitalize(word);
    }
    return word;
  }).join('');
}

/**
 * Underscore the given `str`.
 *
 * Examples:
 *
 *    underscore('FooBar');
 *    // => "foo_bar"
 *  
 *    underscore('SSLError');
 *    // => "ssl_error"
 *
 * @param {String} str
 * @return {String}
 * @api protected
 */
exports.underscore = function(str) {
  str = str.replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2');
  str = str.replace(/([a-z\d])([A-Z])/g, '$1_$2');
  str = str.replace(/-/g, '_');
  return str.toLowerCase();
};


exports.flatten = require('utils-flatten');

/**
 * Module-ize the given `str`.
 *
 * Sanitizes string input from "user-space" application code and normalizes
 * it to the form when resolving modules, including controllers.
 *
 * Modules identifiers take the same form as that used by standard JavaScript
 * module formats, including Node, CommonJS, and AMD.
 *
 * Namespaces and nested resources are accounted for, in which case each level
 * becomes a segment of the fully qualified module identifier.  For instance, if
 * an "admin" namespace is declared, within which `postsController` resides, the
 * controller's fully qualified identifier would be `admin/postsController`.
 *
 * "User-space" input comes from one primary source:
 *   1. Drawing the application's routes.  In this phase, module names are
 *      derived from route namespaces.  If nested, each inner namespace becomes
 *      a segment of the fully qualified identifier.
 *
 * Examples:
 *
 *    moduleize('Foo');
 *    // => "foo"
 *
 * @param {String} str
 * @return {String}
 * @api protected
 */
exports.moduleize = function(str) {
  if (!str) { return; }
  
  var s = str.split(/\/|::/).map(function(word) {
    return camelize(word);
  }).join('/');
  
  return s;
};

/**
 * Controller-ize the given `str`.
 *
 * Sanitizes string input from "user-space" application code and normalizes
 * it to the form used internally for controllers.
 *
 * "User-space" input comes from three primary sources:
 *   1. Paths on the file system containing source code of controllers, if
 *      auto-loading is enabled.  These are typically located at
 *      `app/controllers` and, by convention, are named after the resource and
 *      suffixed with "Controller" (for example: bandsController.js).  Note that
 *      the path's root directory and file extension will be stripped by the
 *      loader prior to this function being called.
 *   2. Drawing the application's routes.  In this phase, controller names are
 *      derived from resource names, when declaring resourceful routes, or from
 *      an explicit `controller` option to match routes (which can alternatively
 *      be specified in the shorthand form of `controller#action`).
 *   3. As a `controller` option to routing helpers, such as `urlFor()`.
 *
 *
 * Controller take the same form as modules identifiers.  Any "controller"
 * suffix will be stripped, as it is redundant within the context of the router.
 *
 * Note that these module identifiers are never resolved within the router.  It
 * is up to the application to supply the necessary logic to load controllers
 * and invoke actions, including any conventsion regarding where controller
 * modules are located on the file system.
 *
 * Examples:
 *
 *    controllerize('foo_bar');
 *    // => "fooBar"
 *
 *    controllerize('foo_bar_controller');
 *    // => "fooBar"
 *
 *    controllerize('fulano/foo_bar');
 *    // => "fulano/fooBar"
 *
 *    controllerize('Fulano::FooBar');
 *    // => "fulano/fooBar"
 *
 * @param {String} str
 * @return {String}
 * @api protected
 */
exports.controllerize = function(str) {
  if (!str) { return; }
  
  var s = exports.moduleize(str);
  if (s.match(/controller$/i)) {
    s = s.slice(0, 0 - 'controller'.length);
  }
  
  return s;
};

/**
 * Function-ize the given `str`.
 *
 * Sanitizes string input from "user-space" application code and normalizes
 * it to the form used when declaring functions, including controller actions
 * and helpers.
 *
 * "User-space" input for _actions_ comes from two primary sources:
 *   1. Drawing the application's routes.  In this phase, action names are
 *      derived from an explicit `action` option to match routes (which can
 *      alternatively be specified in the shorthand of `controller#action`).
 *      Note that resourceful routes follow conventions for action names, and
 *      thus are not subject to sanitization.
 *   2. As an `action` option to routing helpers, such as `urlFor()`.
 *
 * "User-space" input for _helpers_ comes from one primary source:
 *   1. Drawing the application's routes.  In this phase, helper names are
 *      derived from resource names, when declaring resourceful routes, or from
 *      an explicit `as` option to match routes.
 *
 * Additionally, sanitization is needed when utilizing datastore plugins for
 * model awareness.  In this case, a plugin returns a string to indicate the
 * type of a particular record.  Routing helpers, such as `urlFor()`, convert
 * this string into the corresponding named routing helper, which is invoked
 * directly.
 *
 * Examples:
 *
 *    functionize('FooBar', 'URL');
 *    // => "fooBarURL"
 *
 * @param {String} str
 * @param {String} suffix
 * @return {String}
 * @api protected
 */
exports.functionize = function(str, suffix) {
  if (!str) { return; }
  
  var s = '';
  
  for (var i = 0; i < arguments.length; ++i) {
    var a = arguments[i];
    if (i === 0) {
      s = s.concat(camelize(a));
    } else {
      s = s.concat(camelize(a, true));
    }
  }
  
  return s;
};

/**
 * Normalize the given path string,
 * returning a regular expression.
 *
 * An empty array should be passed,
 * which will contain the placeholder
 * key names. For example "/user/:id" will
 * then contain ["id"].
 *
 * @param  {String|RegExp} path
 * @param  {Array} keys
 * @param  {Boolean} sensitive
 * @param  {Boolean} strict
 * @return {RegExp}
 * @api private
 *
 * CREDIT: https://github.com/visionmedia/express/blob/3.4.2/lib/utils.js#L294
 */
exports.pathRegexp = function(path, keys, sensitive, strict) {
  if (path instanceof RegExp) { return path; }
  path = path
    .concat(strict ? '' : '/?')
    .replace(/\/\(/g, '(?:/')
    .replace(/(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?(\*)?/g, function(_, slash, format, key, capture, optional, star){
      keys.push({ name: key, optional: !! optional });
      slash = slash || '';
      return ''
        + (optional ? '' : slash)
        + '(?:'
        + (optional ? slash : '')
        + (format || '') + (capture || (format && '([^/.]+?)' || '([^/]+?)')) + ')'
        + (optional || '')
        + (star ? '(/*)?' : '');
    })
    .replace(/([\/.])/g, '\\$1')
    .replace(/\*/g, '(.*)');
  return new RegExp('^' + path + '$', sensitive ? '' : 'i');
};
