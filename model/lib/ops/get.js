var _ = require('lodash');
var async = require('async');

// Gets a piece of content.
// @param id {String|Number}: The id of the content.
module.exports.history = function (id, done) {
  var self = this;
  var ids = Array.isArray(id) ? id : [id];

  self.db.view('model', 'id', {
    keys: ids,
    include_docs: true,
    reduce: false
  }, function (err, body) {

    logger.debug('Model History: ' + self.model_type + ' ', err, body);

    if (err) {
      return done(err);
    }
    if (!body.rows || !body.rows.length) {
      return done(new Error('Not Found (' + self.model_type + '): ' + ids));
    }

    done(null, parse_body_map_docs.call(self, body, id));

  });
};

// Gets a piece of content.
// @param id {String|Number}: The id of the content.
module.exports.get = function (id, done) {
  var self = this;
  var ids = Array.isArray(id) ? id : [id];

  // 2 step process.  Get latest versions, then get that doc.
  async.waterfall([

    // First step gets the list of the ids for the latest version of the record.
    function (cb) {
      self.db.view('model', 'id', {
        keys: ids,
        include_docs: false,
        reduce: true,
        group: true,
        descending: true
      }, function (err, body) {

        if (err) {
          return cb(err, body);
        } else if (!body.rows || !body.rows.length) {
          return cb(new Error('Not Found (' + self.model_type + '): ' + ids), body);
        } else {
          // couch ids.
          return cb(null, {
            keys: _.map(body.rows, function (row) {
              return row.value;
            })
          });
        }
      });
    },

    // bulk fetch all of the docs by id.
    // oprevious step parsed the body and passed the array of _ids (couch composite keys)
    self.db.fetch.bind(self.db)

  ], function (err, fetch_body) {
    done(err, parse_body_map_docs.call(self, fetch_body, id));
  });
};

// body: couchdb body.  body.rows is an array.
// id: the original id passed to get();
var parse_body_map_docs = function (body, id) {
  var ids = Array.isArray(id) ? id : [id];
  var self = this;

  // null check
  if (!body || !body.rows) {
    return null;
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
      m = self.new_model();
      m.set_model_from_couch(_.sortBy(model_hash[id], 'updated_date'));
    }

    return m;
  });

  // map single id back to single return.
  if (!Array.isArray(id)) {
    models = models[0];
  }
  return models;
};