var IngestAPI = require('./IngestAPI.js');
var utils = require('util');

var api;

describe('IngestAPI Wrapper', function() {

  beforeAll(function() {
    api = new IngestAPI();
  });

  it('Should work.', function() {
    expect(api).toBeDefined();
  });

  it('Should be true', function() {

    var name;

    expect(api.init).toBeDefined();

    expect(api.init()).toEqual('IngestAPI');

  });

});
