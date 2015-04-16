var _ = require('lodash');

// Gets a piece of content.
// @param id {String|Number}: The id of the content.
module.exports = function (id, done) {
  var self = this;
  var ids = Array.isArray(id) ? id : [id];

  self.db.view('model', 'id', {
    keys: ids,
    include_docs: true,
    reduce: false
  }, function (err, body) {

    if (err) {
      return done(err);
    }
    if (!body.rows || !body.rows.length) {
      return done(new Error('Not Found (' + self.model_type + '): ' + ids));
    }

    var model_hash = {};

    _.each(body.rows, function (row) {
      var m = row && row.doc ? row.doc : null;
      if (m) {
        model_hash[m.id] = model_hash[m.id] || [];
        model_hash[m.id].push(m);
      }
    });

    var models = _.map(ids, function (id) {
      var m = null;

      if (model_hash[id] && model_hash[id].length) {
        m = self.new_entity();
        m.set_entity_from_couch(_.sortBy(model_hash[id], 'updated_date'));
      }

      return m;
    });

    // map single id back to single return.
    if (!Array.isArray(id)) {
      models = models[0];
    }

    done(null, models);

  });
};