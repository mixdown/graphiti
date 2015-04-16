var _ = require('lodash');
var async = require('async');
var uuid = require('node-uuid');
var deepEqual = require('deep-equal');
var compare_omits = ['_id', 'updated_date', 'updated_by', 'created_by', 'created_date'];

module.exports = function (model, done) {
  var self = this;
  var ops = [];
  var existing_model;
  var dtNow = new Date();
  var has_changes = true; // assume there are changes.  We will diff existing with new in a step.

  // support Model() or plain object
  if (model instanceof this.Model) {
    model = model.get();
  }

  // ensure we only push valid props to db.
  model = self.whitelist(model);
  model.updated_date = dtNow;
  model.model_type = this._options.model_type; // ensure we always save the correct model name to the object before persisting.

  if (!model.updated_by) {
    throw new Error('Model.updated_by is required.');
  }

  if (model.id) {

    // attempt to hydrate existing model if there was an id passed.
    ops.push(function (cb) {
      self.get(model.id, function (err, em) {

        // swallow the hydrate error b/c we are optimistically trying to find the existing record,
        // but we don't really care if it exists yet.
        if (!err && em) {
          existing_model = em.get(); // em is of type Model();
        }
        cb();
      });
    });

  } else {
    model.id = uuid.v4();
  }

  // validate the model.  If there is an existing model, we merge to a copy first to ensure the
  // final resulting model will pass validation...
  ops.push(function (cb) {
    var model_copy;
    var validation_result;

    // check if this model is the same as the one that is already persisted.
    if (deepEqual(_.omit(self.whitelist(model), compare_omits), _.omit(existing_model, compare_omits))) {
      has_changes = false;
    } else if (existing_model) {
      model_copy = _.omit(_.cloneDeep(model), 'created_date', 'created_by'); // copy without created data b/c that should be immutable.
      model_copy = self.whitelist(_.defaults(model_copy, existing_model)); // whitelist.
      validation_result = self.validate(model_copy);
    } else {
      model = _.defaults(model, self.empty_model());
      validation_result = self.validate(model);
    }

    cb(validation_result.errors.length ? new Error(JSON.stringify(validation_result, null, 2)) : null);
  });

  // now save the model to the database
  ops.push(function (cb) {
    if (has_changes) {
      // unique key by id + timestamp
      model._id = [model.id, model.updated_date.valueOf()].join('_');
      self.db.insert(model, cb);
    } else {
      cb();
    }
  });

  // run this whole pipeline.
  async.series(ops, function (err, results) {
    done(err, err ? results : model);
  });
};
