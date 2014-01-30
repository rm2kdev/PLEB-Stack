/**
 * Module dependencies.
 */
var scripts = require('scripts')
  , path = require('path')
  , fs = require('fs')
  , existsSync = fs.existsSync || path.existsSync // <=0.6
  , debug = require('debug')('bootable');
  

/**
 * Environment initialization phase.
 *
 * This phase will load an environment initialization script based on the
 * current environment (as set by `NODE_ENV`).  As a special case, if an
 * `all.js` script exists, that file will be loaded for *all* environments,
 * prior to the environment-specific script itself.
 *
 * Examples:
 *
 *   app.phase(environment('config/environments'));
 *
 *   app.phase(environment({ dirname: 'config/environments', env: 'test' }));
 *
 * @param {String|Object} options
 * @return {Function}
 * @api public
 */
module.exports = function(options) {
  if ('string' == typeof options) {
    options = { dirname: options }
  }
  options = options || {};
  var dirname = options.dirname || 'etc/env'
    , env = options.env || process.env.NODE_ENV || 'development'
    , extensions = options.extensions;
  
  return function environment() {
    var file = path.join(dirname, 'all')
      , script = scripts.resolve(path.resolve(file), extensions);
    
    if (existsSync(script)) {
      debug('configuring environment: %s', 'all');
      require(script).call(this);
    }
    
    file = path.join(dirname, env);
    script = scripts.resolve(path.resolve(file), extensions);
    
    if (existsSync(script)) {
      debug('configuring environment: %s', env);
      require(script).apply(this);
    }
  }
}
