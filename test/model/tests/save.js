var App = require('mixdown-app').App;
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

    app.use(new ModelPlugin(_.extend({
      app: app,
      model_type: 'baz'
    }, config)), 'models');

    app.setup(done);
  });


  test('Save Model', function (done) {

    var model = app.models.new_model({
      created_by: '11111111-69fe-11e4-b116-123b93f75cba',
      updated_by: '11111111-69fe-11e4-b116-123b93f75cba'
    });

    // app.models.on('cql', function(data) {
    //   console.log('');
    //   console.log(data);
    // });

    async.waterfall([

      // save new model
      function (cb) {
        app.models.save(model, cb);
      }

    ], function (err, results) {

      // console.log(results);

      assert.ifError(err, 'Save should not return error.');
      done();
    });


  });

});