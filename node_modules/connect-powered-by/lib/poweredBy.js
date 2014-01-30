/**
 * Set `X-Powered-By` header on response.
 *
 * @return {Function}
 * @api public
 */
module.exports = function poweredBy(tech) {
  tech = tech || null;
  
  return function(req, res, next) {
    if (tech) {
      res.setHeader('X-Powered-By', tech);
    } else {
      res.removeHeader('X-Powered-By');
    }
    next();
  }
}
