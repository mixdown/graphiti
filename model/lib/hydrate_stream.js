var util = require('util');
var Transform = require('stream').Transform;
var _ = require('lodash');

var HydrateModelTransform = function (options) {
  options = options || {};
  this.model_plugin = options.model_plugin;
  this.view_model = options.view_model; // flag says whether to emit as a view model or entity/model
  this.push_count = 0;
  this.error_count = 0;

  Transform.call(this, _.extend(options, {
    objectMode: true
  }));
}

util.inherits(HydrateModelTransform, Transform);

HydrateModelTransform.prototype._transform = function (id, encoding, callback) {
  var self = this;

  this.model_plugin.get(id, function (err, model) {

    // stop streaming on error
    if (err) {
      self.error_count++;
      self.push(null);
      return callback(err);
    }

    try {
      self.push(self.view_model ? model.view_model() : model);
      callback();
      self.push_count++;
    } catch (e) {
      self.error_count++;
      callback(e);
    }
  });

};

module.exports = HydrateModelTransform;