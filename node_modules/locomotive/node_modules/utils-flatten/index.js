/**
 * Flatten the given `arr`.
 *
 * @param {Array} arr
 * @return {Array}
 * @api public
 */

exports = module.exports = function(arr, ret){
  var ret = ret || []
    , len = arr.length;
  for (var i = 0; i < len; ++i) {
    if (Array.isArray(arr[i])) {
      exports(arr[i], ret);
    } else {
      ret.push(arr[i]);
    }
  }
  return ret;
};
