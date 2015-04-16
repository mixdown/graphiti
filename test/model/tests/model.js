var App = require('mixdown-app').App;
var Model = require('../../../index.js').Model;
var assert = require('assert');

var couch_response = [{
  id: '3d298f5e-b14d-4a3f-ac2b-5bc074a10cfc',
  updated_date: new Date('Wed Nov 12 2014 15: 25: 00 GMT - 0600(CST)'),
  active: true,
  created_by: '33333333-69fe-11e4-b116-123b93f75cba',
  created_date: new Date('Wed Nov 12 2014 15: 25: 00 GMT - 0600(CST)'),
  text: 'This is the first comment',
  updated_by: '33333333-69fe-11e4-b116-123b93f75cba'
}, {
  id: '3d298f5e-b14d-4a3f-ac2b-5bc074a10cfc',
  updated_date: new Date('Wed Nov 12 2014 15: 35: 00 GMT - 0600(CST)'),
  text: 'This is the second comment',
  updated_by: '22222222-69fe-11e4-b116-123b93f75cba'
}, {
  id: '3d298f5e-b14d-4a3f-ac2b-5bc074a10cfc',
  updated_date: new Date('Wed Nov 12 2014 15: 45: 00 GMT - 0600(CST)'),
  text: 'This is the third comment',
  updated_by: '33333333-69fe-11e4-b116-123b93f75cba'
}, {
  id: '3d298f5e-b14d-4a3f-ac2b-5bc074a10cfc',
  updated_date: new Date('Wed Nov 12 2014 15: 55: 00 GMT - 0600(CST)'),
  text: 'This is the final comment',
  updated_by: '33333333-69fe-11e4-b116-123b93f75cba'
}];

suite('Model', function () {

  test('Empty model', function (done) {

    var m = new Model({
      model_type: 'dog'
    }, {
      id: 'fido',
      active: true
    });

    var expected = {
      id: 'fido',
      active: true,
      type: 'dog'
    };

    assert.deepEqual(m.get(), expected, 'Model should have correct attributes')

    done();
  });

  test('Response Simple', function (done) {

    var m = new Model({
      model_type: 'comment'
    });

    var expected = {
      id: '3d298f5e-b14d-4a3f-ac2b-5bc074a10cfc',
      updated_date: new Date('Wed Nov 12 2014 15: 55: 00 GMT - 0600(CST)'),
      active: true,
      created_by: '33333333-69fe-11e4-b116-123b93f75cba',
      created_date: new Date('Wed Nov 12 2014 15: 25: 00 GMT - 0600(CST)'),
      text: 'This is the final comment',
      updated_by: '33333333-69fe-11e4-b116-123b93f75cba',
      type: 'comment'
    };

    m.set_model_from_couch(couch_response);
    // console.log(m.get(), expected);
    assert.deepEqual(m.get(), expected, 'Collapsed model should match expected.')

    done();
  });

  test('Response Time Machine', function (done) {

    var m = new Model({
      model_type: 'comment'
    });
    var time_machine_date = new Date('Wed Nov 12 2014 15: 40: 00 GMT - 0600(CST)');

    var expected = {
      id: '3d298f5e-b14d-4a3f-ac2b-5bc074a10cfc',
      updated_date: new Date('Wed Nov 12 2014 15: 35: 00 GMT - 0600(CST)'),
      active: true,
      created_by: '33333333-69fe-11e4-b116-123b93f75cba',
      created_date: new Date('Wed Nov 12 2014 15: 25: 00 GMT - 0600(CST)'),
      text: 'This is the second comment',
      updated_by: '22222222-69fe-11e4-b116-123b93f75cba',
      type: 'comment'
    };

    m.set_model_from_couch(couch_response);
    // console.log(m.get(time_machine_date), expected);
    assert.deepEqual(m.get(time_machine_date), expected, 'Time Machine Collapsed model should match expected.')

    done();
  });

});