/**
 * Module dependencies.
 */
var utils = require('./utils');


/**
 * `Namespace` constructor.
 *
 * @api private
 */
function Namespace(name, options, parent) {
  if (typeof name == 'object') {
    options = name;
    name = undefined;
  }
  options = options || {};
  options.module = (options.module !== undefined) ? options.module : name;
  options.method = (options.method !== undefined) ? options.method : name;
  
  this.name = name || '';
  this.module = utils.moduleize(options.module) || '';
  this.method = utils.functionize(options.method) || '';
  this.parent = parent || null;
  this.sep = this.parent ? this.parent.sep : (options.separator || '/');
}

/**
 * Fully qualified path.
 *
 * @param {String} name
 * @return {String}
 * @api protected
 */
Namespace.prototype.qpath = function(name) {
  var qual = name;
  var ns = this;
  while (ns) {
    qual = (ns.name.length)
         ? ((ns.name[ns.name.length - 1] === this.sep || qual === '' || qual[0] === this.sep)
           ? (ns.name + qual)
           : (ns.name + this.sep + qual))
         : qual;
    ns = ns.parent;
  }
  qual = (qual[0] === this.sep) ? qual : (this.sep + qual);
  return qual;
};

/**
 * Fully qualified controller name.
 *
 * Contructs a fully qualified name for `controller`, including any module
 * segments of parent namespaces.  For instance, `postsController` within an
 * "admin" namespace would have a fully qualified name of `admin/posts`.
 *
 * @param {String} name
 * @return {String}
 * @api protected
 */
Namespace.prototype.qcontroller = function(name) {
  var qual = utils.controllerize(name);
  var ns = this;
  while (ns) {
    qual = (ns.module.length) ? (ns.module + '/' + qual) : qual;
    ns = ns.parent;
  }
  return qual;
};

/**
 * Fully qualified function name.
 *
 * Contructs a fully qualified function name, including any method components of
 * parent namespaces.  For instance, an "albums" resource nested under a "bands"
 * resource would yeild helpers in the form of `bandAlbumsPath`,
 * `newBandAlbumPath`, etc.
 *
 * @param {String} name
 * @return {String}
 * @api protected
 */
Namespace.prototype.qfunction = function(name) {
  var comps = [ name ];
  var ns = this;
  while (ns) {
    if (ns.method.length) { comps.unshift(ns.method); }
    ns = ns.parent;
  }
  return utils.functionize.apply(undefined, comps);
};


/**
 * Expose `Namespace`.
 */
module.exports = Namespace;
