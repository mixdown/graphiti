var App = require('mixdown-app').App;
var EntityPlugin = require('../../../index.js').BaseEntity;
var Entity = require('../../../index.js').Entity;
var Model = require('../../../index.js').Model;
var assert = require('assert');
var config = require('../../fixture/localhost_config.js');
var _ = require('lodash');

var couch_response = [{
  id: '4db4a486-2fe3-472b-ba83-4cabdf780038',
  active: true,
  created_by: '11111111-69fe-11e4-b116-123b93f75cba',
  created_date: '2014-11-14T00:04:53.000Z',
  updated_by: '11111111-69fe-11e4-b116-123b93f75cba',
  updated_date: '2014-11-14T00:04:53.000Z',
  base_entity_graph: [{
    model_id: '78128c5f-a7e3-419f-9a83-e1d058b57870',
    model_type: 'model'
  }]
}];

suite('Entity', function () {

  var p = new EntityPlugin(config);


  test('Response Simple', function (done) {

    var e = p.new_entity();
    var expected = {
      id: '4db4a486-2fe3-472b-ba83-4cabdf780038',
      active: true,
      created_by: '11111111-69fe-11e4-b116-123b93f75cba',
      created_date: '2014-11-14T00:04:53.000Z',
      updated_by: '11111111-69fe-11e4-b116-123b93f75cba',
      updated_date: '2014-11-14T00:04:53.000Z',
      type: 'entity',
      models: [{
        hydrated: false,
        model_id: '78128c5f-a7e3-419f-9a83-e1d058b57870',
        model_type: 'model'
      }]
    };

    e.set_entity_from_couch(couch_response);
    // console.log(e.view_model(), expected);
    assert.deepEqual(e.view_model(), expected, 'Model should match expected.')

    done();
  });


  test('Add content', function (done) {

    var e = p.new_entity();

    var expected = {
      id: '4db4a486-2fe3-472b-ba83-4cabdf780038',
      active: true,
      created_by: '11111111-69fe-11e4-b116-123b93f75cba',
      created_date: '2014-11-14T00:04:53.000Z',
      updated_by: '11111111-69fe-11e4-b116-123b93f75cba',
      updated_date: '2014-11-14T00:04:53.000Z',
      type: 'entity',
      models: [{
        hydrated: false,
        model_id: '78128c5f-a7e3-419f-9a83-e1d058b57870',
        model_type: 'model'
      }],
      dogs: [{
        hydrated: false,
        model_id: 'fido',
        model_type: 'dog'
      }]
    };

    e.set_entity_from_couch(couch_response);

    var new_content = new Model({
      model_type: 'dog'
    }, {
      id: 'fido'
    });
    e.add_content(new_content);

    // console.log(e.view_model(), expected);
    assert.deepEqual(e.view_model(), expected, 'Model should match expected.')

    done();
  });

});