// Gets a piece of content.
// @param id {String|Number}: The id of the content.
module.exports = function (ids, done) {
  throw new Error('Not Implemented');

  this.db.get(ids, function (err, body) {
    done(err, body && body.length === 2 ? body[1] : body);
  });
};