var util = require('util');
var _ = require('lodash');
var HydrateStream = require('../hydrate_stream.js');
var JSONStream = require('JSONStream');
var dedupe = require('../dedupe_stream.js');

module.exports = function (ids, opt) {

  // no ids, then stream everything.
  if (!_.isArray(ids) && arguments.length == 1) {
    opt = ids;
    ids = null;
  }

  opt = _.defaults(opt || {}, {
    hydrate: true,
    view_model: true
  });

  if (ids && ids.length > 0) {
    ids = Array.isArray(ids) ? ids : [ids];
  } else {
    ids = null;
  }

  // Create stream against different view if list of ids passed.
  var rs;
  var final_stream;

  if (ids) {
    rs = this.db.view('model', 'id', {
      keys: ids,
      include_docs: false,
      reduce: true,
      group: true
    });

    final_stream = rs.pipe(JSONStream.parse('rows.*.key'));
  } else {
    rs = this.db.view('model', 'type', {
      keys: [this.model_type],
      include_docs: false,
      reduce: false,
      group: false
    });

    final_stream = rs.pipe(JSONStream.parse('rows.*.value')).pipe(dedupe.by());
  }

  if (opt.hydrate) {
    var hydrate_stream = new HydrateStream({
      model_plugin: this,
      view_model: opt.view_model
    });

    final_stream = final_stream.pipe(hydrate_stream);
  }

  return final_stream;
};
