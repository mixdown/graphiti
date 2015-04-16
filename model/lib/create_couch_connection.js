var _ = require('lodash');
var nano = require('nano');

module.exports = function (couch_options) {

  _.defaults(couch_options, {
    url: "http://localhost:5984",
    auth: null,
    database: null
  });

  return nano({
    url: couch_options.url,
    request_defaults: {
      auth: couch_options.auth
    },
    log: function (id, args) {

      // Mixdown specific - expects logger to exist.
      if (typeof (logger) !== 'undefined') {
        logger.debug(id, args);
      }
    }
  });
}