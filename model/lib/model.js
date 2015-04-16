var BasePlugin = require('mixdown-app').Plugin;
var _ = require('lodash');

var Model = module.exports = BasePlugin.extend({
  history: null,
  attrs: null,

  init: function (options, attrs) {
    this._super(options);
    this.attrs = attrs;
  },

  // passes the raw return from couchdb so that model can be loaded.
  set_model_from_couch: function (rows) {
    rows = Array.isArray(rows) ? rows : [];

    if (rows.length) {
      this.history = _.sortBy(rows, 'updated_date');
      this.attrs = null;
      Model.prototype.get.call(this); // get() with no args caches current full version
    }
  },

  view_model: function () {
    return _.defaults({
      type: this._options.model_type
    }, this.get());
  },

  get: function (timestamp) {
    var record;
    var self = this;

    if (!timestamp && this.attrs) {
      record = _.clone(this.attrs);

    } else if (this.history && this.history && this.history.length) {

      _.each(this.history, function (row) {

        if (!timestamp || timestamp > row.updated_date) {
          record = _.extend(record || {}, row);
        }
      });

      // cache this result if not a time machine get();
      this.attrs = _.clone(record);

    } else {
      return null;
    }

    record.type = this._options.model_type;

    return record;
  }

});