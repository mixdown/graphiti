var _ = require('lodash');

var omit_nulls = module.exports = function (obj) {
  return _.omit(obj || {}, function (value) {

    if (value instanceof Array) {
      value = omit_nulls(value);
    }

    return value === null;
  });
};
