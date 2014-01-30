/**
 * Module dependencies.
 */
var utils = require('./utils');


/**
 * `Entry` constructor.
 *
 * An entry is conceptually a reverse route, used to map from a controller
 * action to the URL pattern which dispatches to it.
 *
 * @api private
 */
function Entry(controller, action, pattern) {
  this.controller = controller;
  this.action = action;
  this.pattern = pattern;
  // TODO: Implement support for 'sensitive' and 'strict' options
  utils.pathRegexp(pattern, this.keys = []);
}

/**
 * Routing key.
 *
 * A routing key is used to map from a controller action to a URL pattern.
 *
 * @return {String}
 * @api protected
 */
Entry.prototype.key = function() {
  return this.controller + '#' + this.action;
};

/**
 * Build path.
 *
 * Builds a path for the entry, substituting any placeholders with the
 * corresponding value from `options`.
 *
 * @param {Object} options
 * @return {String}
 * @api protected
 */
Entry.prototype.path = function(options) {
  options = options || {};
  
  var self = this
    , path = this.pattern;
  this.keys.forEach(function(key) {
    if (!key.optional) {
      if (!options[key.name] && options[key.name] !== 0) { throw new Error('Unable to substitute value for ":' + key.name + '" in URL pattern "' + self.pattern + '"'); }
      path = path.replace(':' + key.name, options[key.name]);
    } else {
      var replacement = options[key.name] ? '$1' + options[key.name] : '';
      path = path.replace(new RegExp('(\\.?\\/?):' + key.name + '\\?'), replacement);
    }
  });
  
  return path;
};


/**
 * Expose `Entry`.
 */
module.exports = Entry;
