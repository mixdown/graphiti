var async = require('async');
var _ = require('lodash');

/*
 * hydrate_options.types {Array} - List of types to hydrate
 * hydrate_options.depth {Number} - number of levels to hydrate. default is 1 and means that we send back the data from get() for models and entities.
 * If depth is 0, then we send back the entity that is passed in.
 */
module.exports = function (entity, hydrate_options, callback) {

  // support 2 or 3 arguments
  if (!callback) {
    callback = hydrate_options;
    hydrate_options = null;
  }

  if (!entity) {
    return callback(new Error('Entity (' + this._options.model_type + ') not defined'));
  }

  // set defaults on options.
  hydrate_options = _.defaults(hydrate_options || {}, {
    types: [],
    depth: 2
  });

  var depth = hydrate_options.depth;
  var types = hydrate_options.types && hydrate_options.types.length ? hydrate_options.types : null;
  var self = this;
  var app = this._options.app;
  var entity_types = entity.get_supported_types();
  var hydrate_types = {};

  // stop recursion and send meta data back if depth === 0.  This is not useful from an app, but
  // it is necesary when recursion happens
  if (depth < 1) {
    return callback(null, entity);
  }

  if (types == null) {
    hydrate_types = "all";
  } else {

    _.each(types, function (t) {

      // this is a type on the entity and the plugin was initialized on the app, then we support hydrating this.
      // QUESTION: should we throw when a type that is not valid is passed?
      hydrate_types[t] = entity_types[t] === true && app.hasOwnProperty(t + 's');
    });
  }

  // filter content with blessed types.
  var content_ids = {};
  // generate the functions which pull the data from C*
  var ops = {};


  // create list of ids for each model_type so we can make a single C* call for each type, not each item.
  _.each(entity.get_content(), function (c) {
    if (hydrate_types == "all" || hydrate_types[c.model_type] === true) {
      content_ids[c.model_type] = content_ids[c.model_type] || [];
      content_ids[c.model_type].push(c.model_id);

      // prevent infinite recursion & ensure we only add the fn to ops 1 time.
      if (!ops[c.model_type] && !(entity.attrs.id === c.model_id && entity.model_type === c.model_type)) {
        ops[c.model_type] = factory_model_list(app, content_ids, c.model_type, depth, hydrate_types);
      }
    }
  });

  async.parallel(ops, function (err, hydrated_content) {

    entity.set_hydrated_content(_.flatten(_.map(hydrated_content, function (hc) {
      return hc;
    })));
    callback(err, entity);
  });
};

// generates a function for multi-get in hydrate.
var factory_model_list = function (app, content_ids, model_type, depth, types) {

  var app_plugin = app[model_type] ? app[model_type] : app[model_type + 's'];

  return function (cb) {

    //if it's still undefined, most likely it hasn't been attached.
    if (!app_plugin) {
      return cb(new Error("content model_type is not set or model_type plugin does not exist on app. " + model_type), null);
    }

    app_plugin.get(content_ids[model_type], function (err, results) {

      // entities get recursively hydrated, models already are.
      // we pass depth to manage recursion depth.
      if (typeof (app_plugin.hydrate) === 'function' && !err && depth > 1) {

        var ops = _.map(results, function (m) {

          return function (cbh) {
            if (!m) {
              return cbh(null, null);
            }

            app_plugin.hydrate(m, {
              depth: depth - 1,
              types: types
            }, cbh);
          };

        });

        return async.parallel(ops, cb);
      }

      cb(err, results);

    });

  };
};
