var BaseModel = require('../model/index.js');
var Entity = require('./lib/entity.js');

var BaseEntity = BaseModel.extend({
  _namespace_default: "entities",

  schema: {
    "id": "/entity",
    "type": "object",
    "properties": {

      // the content id of the associated content
      "base_entity_graph": {
        "type": "array",
        "items": {
          "$ref": "/graph"
        }

      }
    }
  },
  graph_schema: {
    "id": "/graph",
    "type": "object",
    "properties": {
      "model_id": {
        "type": "string"
      },
      "model_type": {
        "type": "string"
      }
    }
  },
  model_type: 'entity',
  primary_type: null,
  Model: Entity,

  init: function (options) {
    this._super(options);
    this.validator.addSchema(this.graph_schema, '/graph');
  },

  // alias.
  new_model: function (attrs) {
    return this.new_entity(attrs);
  },

  new_entity: function (attrs) {
    return new this.Model({
      schema: this.schema,
      graph_schema: this.graph_schema,
      primary_type: this.primary_type,
      model_type: this.model_type
    }, attrs);
  },

  // returns a copy of the model with only the fields that are specified in the schema.
  whitelist: function (model) {
    var wlm = this._super(model);
    wlm.base_entity_graph = model.base_entity_graph;
    return wlm;
  },

  // Returns the model from C*
  // supports multi-get with array of ids.
  get: require('./lib/ops/get.js'),

  /*
   * hydrate_options.types {Array} - List of types to hydrate
   * hydrate_options.depth {Number} - number of levels to hydrate. default is 1 and means that we send back the data from get() for models and entities.
   * If depth is 0, then we send back the entity that is passed in.
   */
  hydrate: require('./lib/ops/hydrate.js'),
  delete: require('./lib/ops/delete.js'),
  save: require('./lib/ops/save.js')

});


module.exports = BaseEntity;