var App = require('mixdown-app').App;
var Model = require('../../../index.js').Model;
var ModelPlugin = require('../../../index.js').BaseModel;
var assert = require('assert');
var config = require('../../fixture/localhost_config.js');
var _ = require('lodash');
var async = require('async');
var uuid = require('node-uuid');
var MemoryStream = require('memory-stream');

suite('Get', function () {
  var app = new App();
  var id1 = uuid.v4();
  var id2 = uuid.v4();
  var id3 = uuid.v4();

  setup(function (done) {

    app.use(new ModelPlugin(_.extend({
      app: app,
      model_type: 'baz'
    }, config)), 'models');

    async.series([
      app.setup.bind(app),

      // save 2 models
      app.models.save.bind(app.models, app.models.new_model({
        id: id1,
        created_by: '11111111-69fe-11e4-b116-123b93f75cba',
        updated_by: '11111111-69fe-11e4-b116-123b93f75cba'
      })),

      // save 2 models
      app.models.save.bind(app.models, app.models.new_model({
        id: id2,
        created_by: '11111111-69fe-11e4-b116-123b93f75cba',
        updated_by: '11111111-69fe-11e4-b116-123b93f75cba'
      })),

      // save 2 models
      app.models.save.bind(app.models, app.models.new_model({
        id: id3,
        created_by: '11111111-69fe-11e4-b116-123b93f75cba',
        updated_by: '11111111-69fe-11e4-b116-123b93f75cba'
      }))


    ], done);
  });


  test('Get Single', function (done) {

    app.models.get(id1, function (err, m) {
      // console.log(m.view_model());

      assert.ifError(err);
      assert.equal(typeof (m.view_model), 'function', 'view_model() exists on returned model.');
      assert.equal(m.view_model().id, id1, 'Correct id on returned model.');

      done();
    });
  });


  test('Get Multiple', function (done) {

    app.models.get([id1, id2], function (err, results) {

      assert.ifError(err);
      assert.ok(_.isArray(results), 'Results is an array');

      var m = results[0];
      assert.equal(typeof (m.view_model), 'function', 'view_model() exists on returned model.');
      assert.equal(m.view_model().id, id1, 'Correct id on returned model.');

      m = results[1];
      assert.equal(typeof (m.view_model), 'function', 'view_model() exists on returned model.');
      assert.equal(m.view_model().id, id2, 'Correct id on returned model.');

      done();
    });
  });

  test('Stream specific ids', function (done) {

    var rs = app.models.create_stream([id1, id3], {
      view_model: false // do not call view_model before return
    });
    var ms = new MemoryStream({
      objectMode: true
    });

    rs.on('error', assert.ifError.bind(assert));

    ms.on('finish', function () {
      var results = ms.get();
      // console.log(results);

      assert.ok(_.isArray(results), 'Results is an array');

      var m = results[0];
      assert.equal(typeof (m.view_model), 'function', 'view_model() exists on returned model.');
      assert.equal(m.view_model().id, id1, 'Correct id on returned model.');

      m = results[1];
      assert.equal(typeof (m.view_model), 'function', 'view_model() exists on returned model.');
      assert.equal(m.view_model().id, id3, 'Correct id on returned model.');
      done();
    });

    rs.pipe(ms);

  });

});