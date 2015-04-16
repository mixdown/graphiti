var App = require('mixdown-app').App;
var ModelPlugin = require('../../../index.js').BaseModel;
var assert = require('assert');

suite('Validate', function () {
  var app = new App();

  // todo, expand the invalid test cases.
  var invalid_test_data = [{
    id: '95b981e0-69fe-11e4-b116-123b93f75cba',
    created_by: '95b979fc-69fe-11e4-b116-123b93f75cba',
    created_date: 'not a date',
    updated_by: '95b97ed4-69fe-11e4-b116-123b93f75cba',
    updated_date: new Date(),
    active: true,
    model_type: 'test_type',
    field1: 0,
    field2: {},
    field3: []
  }];

  var test_data = [{
    id: '95b981e0-69fe-11e4-b116-123b93f75cba',
    created_by: '95b979fc-69fe-11e4-b116-123b93f75cba',
    created_date: new Date(),
    updated_by: '95b97ed4-69fe-11e4-b116-123b93f75cba',
    updated_date: new Date(),
    active: true,
    model_type: '',
    field1: 0,
    field2: {},
    field3: [],
    field4: new Date()
  }];

  setup(function () {

    // create plugin
    var p = new(ModelPlugin.extend({
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
            "type": "string",
            "format": "utc-millisec",
            "required": true
          }
        }
      },
      model_type: 'test_type'
    }))({
      app: app
    });

    // attach it
    app.use(p, 'foo');

    app.setup(function () {
      return;
    });
  });


  test('Valid docs', function (done) {

    test_data.forEach(function (data) {
      var validate_result = app.foo.validate(data);
      // console.log(validate_result);
      assert.equal(validate_result.errors.length, 0, 'Should pass validation');
    });

    done();
  });

  test('Invalid docs', function (done) {

    invalid_test_data.forEach(function (data) {
      var validate_result = app.foo.validate(data);
      assert.ok(validate_result.errors.length, 'Should fail validation');
    });

    done();
  });

});