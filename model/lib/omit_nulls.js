var _ = require('lodash');

module.exports = function(obj) {
  return _.omit(obj || {}, function(value) {
    return value === null;
  });
};
