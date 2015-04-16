var Model = require('../../model/lib/model.js');
var _ = require('lodash');

module.exports = Model.extend({
  attrs: {},
  content: null,
  hydrated_content: null,

  init: function (options, attrs) {
    this._super(options);
    this.attrs = _.extend({
      created_date: new Date(),
      updated_date: new Date(),
      active: true
    }, attrs);
    this.content = [];
    this.hydrated_content = {};
    this.type = _.clone(this._options.model_type);

    // convert to hash
    this._valid_types = null;
    var self = this;
    _.each(this._options.graph_schema.properties.model_type.enum || [], function (model_type) {
      self._valid_types = self._valid_types || {};
      self._valid_types[model_type] = true;
    });
  },
  set_hydrated_content: function (hydrated) {
    var self = this;
    this.hydrated_content = Array.isArray(hydrated) ? {} : hydrated;

    if (Array.isArray(hydrated)) {

      //convert to map
      _.each(hydrated, function (c) {
        if (c) {

          //this allows for backwards compability w/
          //the CouchDB products core schema.
          if (c.product) {
            c = c.product;
          }

          var c_model = c;
          if (c.get) {
            c_model = c.get();
          }

          //for backwards compability
          var model_id = c_model.id || c_model._id;

          self.hydrated_content[model_id] = c;
        }
      });
    }

    return this;
  },

  // passes the raw return from couch so that model can be loaded.
  set_entity_from_couch: function (rows) {
    this.set_model_from_couch(rows);
    this.content = this.get().base_entity_graph || [];
    this.hydrated_content = {}; // clear now, but the plugin will know how to hydrate for us.
    return this;
  },

  // generates a persistence model for the entity in the current state.
  persistence_model: function () {
    var vm = _.clone(this.attrs);
    vm.base_entity_graph = _.map(this.content, function (c) {
      return _.pick(c, 'model_id', 'model_type');
    });
    return vm;
  },

  // convert this entity into a Plain Object formatted for a specific use.
  view_model: function () {

    var vm = _.clone(this.attrs);
    var self = this;

    _.each(this.content, function (c) {
      var c_type = c.model_type;
      var c_namespace = c_type + 's';

      if (self._valid_types === null || self._valid_types[c_type]) {
        vm[c_namespace] = vm[c_namespace] || [];

        var model_hydrated_content = self.hydrated_content[c.model_id];

        if (model_hydrated_content) {
          var content_view_model = model_hydrated_content.view_model ? model_hydrated_content.view_model() : model_hydrated_content;

          vm[c_namespace].push(content_view_model);

        } else {

          vm[c_namespace].push(_.extend({
            hydrated: false
          }, c));
        }
      }
    });

    // primary typed object is a single instance (not array), so if there are items in this list, then
    // convert the list to an object and removed the plural from the name
    var primary_content_key = this._options.primary_type + 's';
    if (Array.isArray(vm[primary_content_key]) && vm[primary_content_key].length) {
      vm[this._options.primary_type] = vm[primary_content_key][0];
    }

    delete vm[primary_content_key];
    delete vm.base_entity_graph;

    vm.type = this.type;
    return vm;
  },
  get: function (prop) {
    return prop ? this.attrs[prop] : _.pick(this.attrs, function (p) {
      return (typeof (p) != "function");
    });
  },

  set: function (prop, value) {

    if (prop === 'id') {
      _.each(this.content, function (c) {
        c.id = value;
      });
    }
    return this.attrs[prop] = value;
  },

  get_supported_types: function () {
    return this._valid_types;
  },

  get_content: function (content_id) {
    if (!content_id) {
      return this.content;
    }

    return _.find(this.content, function (content) {
      return content.model_id === content_id;
    });

  },

  add_content: function (content_model) {
    var self = this;

    if (typeof (content_model.view_model) === 'function') {
      content_model = content_model.view_model();
    }

    if (this.get_content(content_model.id)) {
      return this;
    }

    // ensure we only have 1 instance of primary type
    if (content_model._type === this._options.primary_type) {
      var pc = _.find(this.content, function (c) {
        return c.model_type === self._options.primary_type;
      });

      if (pc) {
        this.remove_content(pc);
      }
    }

    this.content.push({
      model_id: content_model.id,
      model_type: content_model.type || content_model._type
    });
    return this;
  },

  remove_content: function (content_model_or_id) {
    var remove_id = typeof (content_model_or_id) === 'string' ? content_model_or_id : content_model_or_id.id;

    this.content = _.reject(this.content, function (content) {
      return content.model_id === remove_id;
    });

    return this;
  }

});