var App = require('mixdown-app').App;
var EntityPlugin = require('../../../index.js').BaseEntity;
var assert = require('assert');
var config = require('../../fixture/localhost_config.js');
var _ = require('lodash');
var async = require('async');
var uuid = require('node-uuid');

suite('Basic', function () {
  var app = new App();

  setup(function (done) {

    var p = new EntityPlugin(_.extend({
      app: app
    }, config));

    // attach it
    app.use(p);

    done();
  });


  test('Attach & Detach', function (done) {
    assert.equal(typeof (app.entities), 'object', 'Interface should exist');
    app.remove('entities');
    assert.equal(app.entities, null, 'Interface is removed');
    done();
  });


});