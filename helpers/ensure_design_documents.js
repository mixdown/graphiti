var dd_model = require('../design_documents/model.json');

module.exports = function (plugin, done) {

  // ensure the design doc exists in db.  if not, then insert.  if does exist, then do not update.
  plugin.db.get(dd_model._id, function (err, body) {

    if (err || !body) {
      plugin.db.insert(dd_model, done);
    } else {
      done();
    }
  });

};