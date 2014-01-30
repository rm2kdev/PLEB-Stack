/**
 * Returns the type of `doc`.
 *
 * The Mongoose datastore adapter allows Locomotive to introspect documents
 * stored in MongoDB and managed by Mongoose.
 *
 * @param {Object} doc
 * @return {String}
 * @api public
 */
exports.recordOf = function(doc) {
  // Introspec `doc`, to determine if it matches the signature of a Mongoose
  // object.  If so, `modelName` indicates the record type.
  if (doc.db && doc.collection && doc.schema) {
    return doc.constructor.modelName ? doc.constructor.modelName : null;
  }
  return null;
}
