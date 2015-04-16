var util = require('util');
var Transform = require('stream').Transform;
var _ = require('lodash');
var propPath = require('property-path');

var DedupeTransform = function (options) {
  options = options || {};
  this.obj_path = options.obj_path;
  this.keys = {};

  Transform.call(this, _.extend(options, {
    objectMode: true
  }));
}

util.inherits(DedupeTransform, Transform);

// This transform ignores things that have already been processed.
DedupeTransform.prototype._transform = function (obj, encoding, callback) {
  var key = this.obj_path ? propPath.get(obj, this.obj_path) : obj;

  if (!this.keys[key]) {
    this.keys[key] = true; // mark as found.
    // push along in stream
    this.push(obj);
  }

  callback();
};

module.exports = {
  by: function (obj_path) {
    return new DedupeTransform(obj_path);
  }
};
