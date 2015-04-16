var uuid = require('node-uuid');
var Entity = require('../entity.js');

// This is so simple.  The graph is part of the object so we dont have to diff graphs.
module.exports = function (entity, done) {

  // This should be called with an Entity object, but if not then attempt to wrap one.
  if (!(entity instanceof Entity)) {
    entity = this.new_entity(entity);
  }

  var id = entity.get('id');

  //if new record, then set the id.
  if (typeof (id) == "undefined" || id === null) {
    entity.set('id', uuid.v4());
  }

  var pmodel = this.whitelist(entity.persistence_model());
  pmodel.updated_date = new Date();
  var validation_result = this.validate(pmodel);

  // fail if does not pass validation
  if (validation_result.errors.length) {
    return done(new Error(JSON.stringify(validation_result, null, 2)));
  }

  pmodel._id = [pmodel.id, pmodel.updated_date.valueOf()].join('_');

  this.db.insert(pmodel, function (err, body) {
    entity._type = entity.type;
    done(err, err ? body : entity);
  });
};
