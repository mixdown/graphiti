var App = require('mixdown-app').App;
var BaseModel = require('../../../index.js').BaseModel;
var assert = require('assert');
var _ = require('lodash');

suite('Basic Model', function () {
  var app;

  setup(function (done) {

    if (app) {
      return done();
    }

    app = new App();

    // create plugin
    var p = new(BaseModel.extend({
      schema: {
        "id": "/unit_test",
        "type": "object",
        "properties": {
          "field1": {
            "type": "number",
            "required": true
          },
          "field2": {
            "type": "object",
            "required": true
          },
          "field3": {
            "type": "array",
            "required": true
          },
          "field4": {
            "type": "object",
            "items": {
              type: "boolean"
            }
          },
        }
      }
    }))({
      app: app,
      couchdb: require('../../fixture/localhost_config.js').couchdb
    });

    // attach it
    app.use(p, 'foo');

    app.setup(function (err) {
      done(err);
    });
  });

  test('Attach & Detach', function (done) {
    assert.equal(typeof (app.foo), 'object', 'Interface should exist');
    // app.remove('foo');
    // assert.equal(app.foo, null, 'Interface is removed');
    done();
  });

  test('Test properties', function (done) {

    var expected = {
      id: 'text',
      created_by: 'text',
      created_date: 'timestamp',
      updated_by: 'text',
      updated_date: 'timestamp',
      active: 'boolean',
      field1: 'double',
      field2: 'map<text,text>',
      field3: 'list<text>',
      field4: 'map<text,boolean>'
    };
    assert.deepEqual(app.foo.properties, expected, 'Properties map should be correct.');
    done();
  });

  test('Model empty_model()', function (done) {
    var model = app.foo.empty_model();

    _.each(app.foo.properties, function (t, k) {

      switch (t) {
      case 'text':
      case 'ascii':
        assert.equal(typeof (model[k]), 'string', 'Model[' + k + '] should be correct type');
        break;
      case 'map<text,text>':
        assert.ok(_.isPlainObject(model[k]), 'Model[' + k + '] should be correct type');
        break;
      case 'list<text>':
        assert.ok(Array.isArray(model[k]), 'Model[' + k + '] should be correct type');
        break;
      case 'timestamp':
        assert.ok((model[k] instanceof Date), 'Model[' + k + '] should be correct type');
        break;
      case 'boolean':
        assert.ok(_.isBoolean(model[k]), 'Model[' + k + '] should be correct type');
        break;
      case 'double':
        assert.equal(isNaN(model[k]), false, 'Model[' + k + '] should be correct type');
        break;
      default:
        assert.equal(model[k], null, 'Model[' + k + '] should be null');
        break;
      }
    });

    done();
  });

  test('Model whitelist()', function (done) {
    var bloated = _.extend(app.foo.empty_model(), {
      id: '95b981e0-69fe-11e4-b116-123b93f75cba',
      created_by: '95b979fc-69fe-11e4-b116-123b93f75cba',
      updated_by: '95b97ed4-69fe-11e4-b116-123b93f75cba',
      bad1: null,
      bad2: 'cheesedogs'
    });

    var clean = app.foo.whitelist(bloated);

    // console.log(bloated, clean);

    assert.deepEqual(Object.keys(clean), Object.keys(app.foo.empty_model()), 'Whitelisted properties map should be correct.');
    done();
  });

});