// TODO: Remove all usage of jasmine.Ajax

'use strict';

var IngestSDK = require('../src/index');
var mock = require('xhr-mock');
var jasmineAjax = require('jasmine-ajax');

var api, Request, RequestManager;

describe('Ingest API : Request', function () {

  // Reset the auth token.
  beforeEach(function () {
    api = new IngestSDK();

    Request = api.request;
    RequestManager = api.requestManager;
  });

  it('Should reject the promise if the response is not valid JSON.', function (done) {
    var data = '"1';

    mock.setup();

    mock.get(api.config.host + '/videos',
      function (request, response) {

        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(data);
      });

    var request = api.videos.getAll().then(function (response) {

      expect(response).toBeUnDefined();

      done();

    }, function (error) {

      expect(error).toBeDefined();

      done();

    });

    // Ensure a promise was returned.
    expect(request.then).toBeDefined();

  });

  it('Should reject the promise if the url is not defined.', function (done) {

    api.videos.config.host = null;
    api.videos.config.all = null;

    var request = api.videos.getAll().then(function (response) {

      expect(response).toBeUndefined();
      done();

    }, function (error) {

      expect(error).toBeDefined();

      done();

    });

    // Ensure a promise was returned.
    expect(request.then).toBeDefined();

  });

  it('Should make a request even if a token is missing.', function (done) {

    api.token = null;

    // Mock the XHR object
    mock.setup();

    // Mock the response from the REST api.
    mock.get(api.config.host + '/videos',
      function (request, response) {

        // Restore the XHR object.
        mock.teardown();

        return response.status(200);

      });

    // Mock the call to getToken.
    spyOn(api, 'getToken').and.returnValue(null);

    var request = api.videos.getAll().then(function (response) {

      expect(response).toBeDefined();
      done();

    }, function (error) {

      expect(error).toBeUndefined();
      done();

    });

    // Ensure a promise was returned.
    expect(request.then).toBeDefined();

  });

  it('Should fail if the data object cannot be stringifyed.', function () {

    // The follow code sets up an object with a cyclical reference. This will
    // cause the JSON stringify to fail.
    var video = {};
    var cover = {};
    var result;

    video.cover = cover;
    cover.video = video;

    spyOn(Request.prototype, 'makeRequest').and.returnValue(null);

    result = Request.prototype.preparePostData(video);

    expect(result.success).toEqual(false);

  });

  it('Should fail if bad data is passed to makeRequest', function (done) {
    var request = new Request({
      url: api.config.host + '/videos',
      token: api.getToken(),
      method: 'POST',
      data: {test: true}
    });

    api.request = request;

    spyOn(request, 'preparePostData').and.callFake(function () {
      return {
        success: false,
        data: null
      };
    });

    request.send().then(function (response) {

      expect(response).toBeUndefined();
      done();

    }, function (error) {
      expect(error).toBeDefined();
      expect(request.preparePostData).toHaveBeenCalled();

      done();

    });

  });

  it('Should not stringify the postData if is passed as FormData', function () {
    var result;
    var formData = new FormData();
    formData.append('test', 'test-value');

    result = Request.prototype.preparePostData(formData);

    expect(result.success).toEqual(true);
    expect(result.type).toEqual('FormData');
    expect(result.data).toEqual(formData);
  });

  it('Should abort a request when cancel is called.', function () {

    // Mock the response from the REST api.
    mock.mock('POST', '/test' , function (request, response) {
      // Restore the XHR object.
      mock.teardown();
      return response.timeout(2000);
    });

    var request = new Request({
      url: '/test',
      method: 'POST'
    });

    spyOn(request, 'requestComplete');

    request.send().then(function (response) {
      expect(response).not.toBeDefined();
      done();
    }, function (error) {
      expect(error).toBeDefined();
      expect(request.requestComplete).not.toHaveBeenCalled();
      done();
    });

    request.cancel();

  });

  it('Should retry the request if it responds with a 429', function (done) {
    var url, request, spy;

    spy = spyOn(window, 'setTimeout').and.callFake(function (func) {
      func();
    });

    spyOn(Request.prototype, 'makeRequest').and.callThrough();

    mock.setup();

    // Mock the response from the REST api.
    mock.mock('GET', '/test', function (request, response) {
      // Restore the XHR object.
      mock.teardown();

      return response.status(429)
        .header('Content-Type', 'application/json')
        .body('{}');
    });

    request = new Request({
      url: '/test'
    });

    request.send().then(function (response) {
      expect(response).not.toBeDefined();
      done();
    }, function (error) {
      expect(error).toBeDefined();
      done();
    });

    expect(window.setTimeout).toHaveBeenCalled();
    expect(Request.prototype.makeRequest.calls.count()).toEqual(2);
    expect(request.retrys).toEqual(1);
  });

  it('Should fail if an invalid response code is returned.', function (done) {

    var url, request;

    mock.setup();

    // Mock the response from the REST api.
    mock.mock('GET', '/test', function (request, response) {
      // Restore the XHR object.
      mock.teardown();

      return response.status(401)
        .header('Content-Type', 'application/json')
        .body('{}');

    });

    request = new Request({
      url: '/test'
    });

    request.send().then(function (response) {
      expect(response).not.toBeDefined();
      done();
    }, function (error) {
      expect(error).toBeDefined();
      done();
    });

  });

  it('Should fail if an invalid response code is returned with no content length.', function (done) {

    var url, request;

    mock.setup();

    // Mock the response from the REST api.
    mock.mock('GET', '/test', function (request, response) {
      // Restore the XHR object.
      mock.teardown();

      return response.status(401)
        .header('Content-Type', 'application/json')
        .header('Content-Length', '0');

    });

    request = new Request({
      url: '/test'
    });

    request.send().then(function (response) {
      expect(response).not.toBeDefined();
      done();
    }, function (error) {
      expect(error).toBeDefined();
      done();
    });

  });

  it('Make the POST request synchronously', function () {
    var result, request;
    var sync = false;
    jasmine.Ajax.install();
    jasmine.Ajax.stubRequest(api.config.host + '/videos', null, 'POST').andReturn({
      status: 200,
      responseText: '{"test": true}'
    });

    request = new Request({
      url: api.config.host + '/videos',
      async: false,
      token: api.getToken(),
      method: 'POST',
      data: {test: true}
    });

    request.sendSync(function (error, response) {
      expect(error).toEqual(null);
      expect(response.data.test).toEqual(true);
      sync = true;
    });

    expect(sync).toEqual(true);

    jasmine.Ajax.uninstall();

  });

  it('Make the GET request synchronously', function () {
    var result, request;
    var sync = false;
    jasmine.Ajax.install();
    jasmine.Ajax.stubRequest(api.config.host + '/videos', null, 'GET').andReturn({
      status: 200,
      responseText: '{"test": true}'
    });

    request = new Request({
      url: api.config.host + '/videos',
      async: false,
      token: api.getToken(),
      method: 'GET'
    });

    request.sendSync(function (error, response) {
      expect(error).toEqual(null);
      expect(response.data.test).toEqual(true);
      sync = true;
    });

    expect(sync).toEqual(true);

    jasmine.Ajax.uninstall();

  });

  it('Should still make the request if a callback is not provided.', function () {
    var result, request;
    var sync = false;
    jasmine.Ajax.install();
    jasmine.Ajax.stubRequest(api.config.host + '/videos', null, 'GET').andReturn({
      status: 200,
      responseText: '{"test": true}'
    });

    request = new Request({
      url: api.config.host + '/videos',
      async: false,
      token: api.getToken(),
      method: 'GET'
    });

    expect(function () {
      request.sendSync()
    }).not.toThrow();

    jasmine.Ajax.uninstall();

  });

  it('Should call the callback with an error if invalid response code is returned.', function () {
    var result, request;
    var sync = false;
    jasmine.Ajax.install();
    jasmine.Ajax.stubRequest(api.config.host + '/videos', null, 'GET').andReturn({
      status: 404,
      responseText: '{"test": true}'
    });

    request = new Request({
      url: api.config.host + '/videos',
      async: false,
      token: api.getToken(),
      method: 'GET'
    });

    request.sendSync(function (error, response) {
      expect(error).not.toEqual(null);
      expect(response).not.toBeDefined();
      sync = true;
    });

    expect(sync).toEqual(true);

    jasmine.Ajax.uninstall();

  });

  it('Should fail if sendSync is called with no url set.', function () {
    var sync = false;
    var request = new Request({
      url: null,
      async: false,
      token: api.getToken(),
      method: 'POST',
      data: {test: true}
    });

    request.sendSync(function (error, response) {
      expect(error).toBeDefined();
      sync = true;
    });

    expect(sync).toEqual(true);

  });

  it('Should fail and throw if no callback is provided.', function () {
    var request = new Request({
      url: null,
      async: false,
      token: api.getToken(),
      method: 'POST',
      data: {test: true}
    });

    expect(function () {
      request.sendSync()
    }).toThrow();

  });


});
