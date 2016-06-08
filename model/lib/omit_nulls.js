var _ = require('lodash');

var omit_nulls = module.exports = function (obj) {
  return _.omit(obj || {}, function (value) {
    //if this is an array - dig deeper
    if (value instanceof Array) {
      value = omit_nulls(value);
    } else {
      return value === null;
    }

  });
};
