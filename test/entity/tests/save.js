var App = require('mixdown-app').App;
var EntityPlugin = require('../../../index.js').BaseEntity;
var Entity = require('../../../index.js').Entity;
var ModelPlugin = require('../../../index.js').BaseModel;
var Model = require('../../../index.js').Model;

var assert = require('assert');
var config = require('../../fixture/localhost_config.js');
var _ = require('lodash');
var async = require('async');
var uuid = require('node-uuid');

suite('Save', function () {
  var app = new App();

  setup(function (done) {

    app.use(new EntityPlugin(_.extend({
      app: app
    }, config)));

    app.use(new ModelPlugin(_.extend({
      app: app
    }, config)), 'models');

    app.setup(done);
  });


  test('Save Entity w/ model', function (done) {
    var entity = app.entities.new_entity({
      created_by: '11111111-69fe-11e4-b116-123b93f75cba',
      updated_by: '11111111-69fe-11e4-b116-123b93f75cba'
    });

    var model = app.models.new_model({
      created_by: '11111111-69fe-11e4-b116-123b93f75cba',
      updated_by: '11111111-69fe-11e4-b116-123b93f75cba'
    });


    async.waterfall([

      // save entity with no content.
      function (cb) {
        // console.log('save entity');
        app.entities.save(entity, cb);
      },

      // save new model
      function (junk, cb) {
        // console.log('save model', model);
        app.models.save(model, cb);
      },

      // attach model, then save again
      function (new_model, cb) {
        // console.log('save entity');
        // console.log(new_model);
        app.entities.save(entity.add_content(new_model), cb);
      },
      // get result for assert.
      function (save_result, cb) {
        // console.log('get entity', entity.get('id'));
        app.entities.get(entity.get('id'), cb);
      },
      // get result for assert.
      function (fresh_entity, cb) {
        // console.log('get entity', entity.get('id'));
        app.entities.hydrate(fresh_entity, cb);
      }
    ], function (err, results) {

      // console.log(results ? results.view_model() : null);

      assert.ifError(err, 'Save should not return error.');
      assert.ok(results, 'Should return a valid entity as result');
      assert.ok(results.view_model().models, 'Should have an array of models');
      done();
    });

  });

});