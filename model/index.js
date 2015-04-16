var BasePlugin = require('mixdown-app').Plugin;
var base_props = require('./lib/base_props.js');
var _ = require('lodash');
var Validator = require('jsonschema').Validator
var create_couch_connection = require('./lib/create_couch_connection.js');
var async = require('async');
var uuid = require('node-uuid');
var Model = require('./lib/model.js');
var omit_nulls = require('./lib/omit_nulls.js');
var ensure_design_documents = require('../helpers/ensure_design_documents.js');

// Create a new plugin from the base plugin class.
// this._options is the options hash that was passed on init.
module.exports = BasePlugin.extend({

  // the JSON schema for validating this entity.
  schema: {
    "id": "/model",
    "type": "object",
    "properties": {}
  },

  model_type: 'model',

  // allows plugin to DI a custom model class.
  Model: Model,

  // Setting this here so that unit tests can inject a polyfill that does not rely on the db running.
  db: null,

  properties: null,
  keys: null,

  init: function (options) {
    var self = this;

    var opt = _.defaults(_.cloneDeep(options || {}), {
      couchdb: {},
      model_type: self.model_type
    });

    opt.app = options.app; // reserved and cannot just clone this since it is a complex prototype.

    this._super(opt);
    // apply model_type override if it was passed from config.
    if (this._options.model_type) {
      this.model_type = this._options.model_type;
    }

    this.validator = new Validator();

    // ensure core properties exist on the model.
    this.schema.properties = _.extend(_.cloneDeep(base_props), this.schema.properties);

    // generate the list of properties for this model.
    this.properties = {};
    _.each(this.schema.properties, function (spec, name) {
      var ptype = 'text';

      if (spec['$ref']) {
        ptype = 'map<text>';
      } else {

        switch (spec.type) {

        case 'array':
          ptype = 'list<text>'; // TODO: ability to read the type of things in an array.
          break;
        case 'object':
          if (spec.items && spec.items.type === 'boolean') {
            ptype = 'map<text,boolean>'; // TODO: ability to read the type of things in an array.
          } else {
            ptype = 'map<text,text>'; // TODO: ability to read the type of things in an array.
          }
          break;
        case 'number':
          ptype = 'double';
          break;
        case 'boolean':
          ptype = 'boolean';
          break;
        default:

          // string can have some special cases.
          switch (spec.format) {
          case 'date-time':
          case 'utc-millisec':
            ptype = 'timestamp';
            break;
          default:
            break;
          };

          // already set to text by default.
          break;
        };
      }

      self.properties[name] = ptype;
    });

  },

  new_model: function (attrs) {
    var m = _.extend(this.empty_model(), attrs || {});

    return new this.Model({
      model_type: this.model_type
    }, m);
  },

  // uses schema to validate the model.
  validate: function (model) {

    // omit nulls since non-required fields will fail validation
    // ex: non-required field where phone=null would fail validation because typeof(phone) != 'string'.
    var test_model = omit_nulls(model);

    // in order to pass validation, we have to convert dates to strings.
    _.each(this.schema.properties, function (spec, key) {

      if (spec.format === 'date-time' && test_model[key] instanceof Date) {
        test_model[key] = test_model[key].toISOString();

      } else if (spec.format === 'utc-millisec' && test_model[key] instanceof Date) {
        test_model[key] = test_model[key].valueOf().toString();
      }
    });

    return this.validator.validate(test_model, this.schema || {});
  },

  // generates an empty model with default values.
  empty_model: function () {
    var model = {};
    var self = this;

    _.each(this.properties, function (type, key) {

      if (self.schema.properties[key].hasOwnProperty('default')) {
        model[key] = self.schema.properties[key].default;

      } else if (self.schema.properties[key].required) {

        switch (type) {
        case 'timestamp':
          model[key] = new Date();
          break;
        case 'list<text>':
          model[key] = [];
          break;
        case 'map<text,boolean>':
        case 'map<text,text>':
          model[key] = {};
          break;
        case 'double':
          model[key] = 0;
          break;
        case 'boolean':
          model[key] = false;
          break;
        default:
          model[key] = '';
          break;
        }
      } else {

        // not required, then set the prop to null.  generates the key in case one needs to enumerate the object, but does not set the val.
        model[key] = null;
      }
    });

    model.type = this.model_type;
    return model;
  },

  // Returns the model from DB
  get: require('./lib/ops/get.js').get,
  history: require('./lib/ops/get.js').history,

  // returns a copy of the model with only the fields that are specified in the schema.
  whitelist: function (model) {
    var wlm = _.pick(model, Object.keys(this.properties));
    wlm.type = model.type || this.model_type;
    return wlm;
  },

  // Removes the model from DB
  delete: require('./lib/ops/delete.js'),


  // Persists the model to DB
  // Saves the model to the table in C*
  // if model.id is not a valid uuid, then error.
  // if mode.id is not set, then a new uuid is generated.
  // if a partial model is passed for an update operation, then the existing model is fetched and the props in model are merged into existing before save.
  save: require('./lib/ops/save.js'),

  create_stream: require('./lib/ops/create_stream.js'),

  _setup: function (done) {
    var couch_options = this._options.couchdb;

    // NOTE: "this" is the plugin itself.  no need to use the getter/setter here.  Only on the interface exposed to users.
    var db_connection = create_couch_connection(couch_options);

    var setup_ops = [];
    var self = this;

    setup_ops.push(function (cb) {
      // check if db exists..  create if not.
      db_connection.db.list(function (err, body) {

        if (err) {
          err.message = 'db.list(): ' + err.message;
          cb(err);
          return;
        }
        // body is an array
        var db = _.find(body, function (db) {
          return db === couch_options.database;
        });
        if (db) {
          self.db = db_connection.use(couch_options.database);
          cb();
          return;
        }
        db_connection.db.create(couch_options.database, function (err, body) {
          //If the error is that the database exists already then we are okay
          if (err && err.error != 'file_exists') {
            // return error if db create fail

            err.stack = 'db.create(): Database (' + couch_options.database + ') not found and could not be created. \n' + err.stack;
            cb(err);
          } else {
            self.db = db_connection.use(couch_options.database);
            cb();
          }
        });

      });
    });

    setup_ops.push(ensure_design_documents.bind(null, self));

    async.series(setup_ops, done);
  }
});