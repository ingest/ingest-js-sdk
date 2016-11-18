'use strict';

var api;

var access_token = 'Bearer ' + window.token;

var validVideoId;
var createdVideo;
var nextRange;
var RequestManager;

var mock = require('xhr-mock');

describe('Ingest API', function () {

  // Reset the auth token.
  beforeEach(function () {
    api = new IngestAPI({
      host: 'http://weasley.teamspace.ad:8080',
      token: access_token
    });

    RequestManager = api.requestManager;
  });

  it('Should exist on the window object.', function () {
    expect(IngestAPI).toBeDefined();
  });

  it('Should expose the required functions.', function () {

    var required = [
      'setToken',
      'getToken',
      'upload'
    ];

    var requiredLength = required.length;
    var i, func;

    for (i = 0; i < requiredLength; i++) {
      func = required[i];
      expect(IngestAPI.prototype[func]).toBeDefined();
    }

  });

  it('Should expose the config object.', function () {
    expect(api.config).toBeDefined();
    expect(api.config.host).toBeDefined();
  });

  it('Should be able to create it without a token.', function () {

    var testAPI;

    try {
      testAPI = new IngestAPI();
    } catch (error) {
      expect(error).toBeUndefined();
    }

    expect(testAPI instanceof IngestAPI).toBe(true);

  });

  it('Should parse the id out of a template string', function () {
    var result = api.utils.parseTokens.call(this, '<%=id%>', {id: 'testid'});
    expect(result).toEqual('testid');
  });

  it('Should override the default config object values.', function () {
    expect(api.config.host).not.toEqual(api.defaults.host);
  });

  it('Should set the auth token.', function () {
    api.setToken('test-token');
    expect(api.token).toBeDefined();
    expect(api.token).toEqual('test-token');
  });

  it('Should return the token.', function () {
    var token = api.getToken(api);
    expect(token).toBeDefined();
    expect(token).toEqual(access_token);
  });

  it('Should return the currently configured token.', function () {

    var token = api.getToken();

    expect(token).toEqual(access_token);

  });

  it('Should throw an error if no token is set.', function () {

    api.token = null;

    try {
      api.getToken();
    } catch (error) {
      expect(error).toBeDefined();
    }

  });

  it('Should fail if there is no token set.', function () {
    expect(api.setToken).toThrow();
  });

  it('Should set the max requests for the request manager', function () {
    api.setMaxRequests(10);

    expect(RequestManager.maxRequests).toEqual(10);
  });

  it('Should throw an error if an invalid max is passed in', function () {
    try {
      api.setMaxRequests(-1);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  describe('upload', function () {
    it('Should return an upload object', function () {

      var file = new File([""], "testfile");

      var upload = api.upload(file);

      var instanceCheck = upload instanceof api.uploader;

      expect(instanceCheck).toEqual(true);

    });
  });

});
