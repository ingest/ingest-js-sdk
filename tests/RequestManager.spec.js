'use strict';

var IngestSDK = require('../src/index');
var mock = require('xhr-mock');

var api, Request, RequestManager;

describe('Ingest API : RequestManager', function () {

  // Reset the auth token.
  beforeEach(function () {
    api = new IngestSDK();

    Request = api.request;
    RequestManager = api.requestManager;
  });

  it('Should set the max requests to the passed in value', function () {
    expect(RequestManager.maxRequests).toEqual(6);

    RequestManager.setMaxRequests(100);

    expect(RequestManager.maxRequests).toEqual(100);
  });

  it('Should send the request right away if we have enough room to send more', function () {
    var request;

    spyOn(RequestManager, 'addRequest').and.callThrough();
    spyOn(RequestManager, 'sendRequest');

    RequestManager.pending = [];
    RequestManager.activeRequests = 0;

    // Mock the XHR object
    mock.setup();

    // Mock the response from the REST api.
    mock.get(api.config.host + '/videos',
      function (request, response) {

        // Restore the XHR object.
        mock.teardown();

        return response.status(200);

      });

    request = new Request({
      url: api.config.host + '/videos',
      token: api.getToken(),
      method: 'POST'
    });

    request.send();

    expect(RequestManager.addRequest).toHaveBeenCalled();
    expect(RequestManager.sendRequest).toHaveBeenCalled();
    expect(RequestManager.pending.length).toEqual(0);
  });

  it('Should add the request to the queue if not possible to send right away', function () {
    var request;

    spyOn(RequestManager, 'addRequest').and.callThrough();
    spyOn(RequestManager, 'sendRequest');

    RequestManager.activeRequests = 6;

    request = new Request({
      url: api.config.host + '/videos',
      token: api.getToken(),
      method: 'POST'
    });

    RequestManager.addRequest([request, null]);

    expect(RequestManager.addRequest).toHaveBeenCalled();
    expect(RequestManager.sendRequest).not.toHaveBeenCalled();
    expect(RequestManager.pending.length).toEqual(1);
  });

  it('Should reset the timer if it exists and send the request', function (done) {
    var request;

    // Mock the XHR object
    mock.setup();

    // Mock the response from the REST api.
    mock.get(api.config.host + '/videos',
      function (request, response) {

        // Restore the XHR object.
        mock.teardown();

        return response.status(200);

      });

    request = new Request({
      url: api.config.host + '/videos',
      token: api.getToken(),
      method: 'POST'
    });


    spyOn(window, 'clearTimeout');
    spyOn(request, 'send');

    RequestManager.resetTimer = setTimeout(function () {}, 10000);

    RequestManager.sendRequest(request, null);

    done();

    RequestManager.resetTimer = null;
    expect(clearTimeout).toHaveBeenCalled();
    expect(request.send).toHaveBeenCalled();
  });

  it('Should reset the current set if applicable and send the request', function () {
    var request;

    // Mock the XHR object
    mock.setup();

    // Mock the response from the REST api.
    mock.get(api.config.host + '/videos',
      function (request, response) {

        // Restore the XHR object.
        mock.teardown();

        return response.status(200);

      });

    request = new Request({
      url: api.config.host + '/videos',
      token: api.getToken(),
      method: 'POST'
    });

    spyOn(request, 'send');

    RequestManager.currentSetRequests = 6;
    RequestManager.maxRequests = 6;

    RequestManager.lastRequestSetStart = null;
    RequestManager.resetTimer = null;
    RequestManager.sendRequest(request, null);

    expect(request.send).toHaveBeenCalled();
    expect(RequestManager.currentSetRequests).toEqual(1);
    expect(RequestManager.lastRequestSetStart).toBeDefined();
  });

  it('Should not reset the current set and send the request', function () {
    var request;

    // Mock the XHR object
    mock.setup();

    // Mock the response from the REST api.
    mock.get(api.config.host + '/videos',
      function (request, response) {

        // Restore the XHR object.
        mock.teardown();

        return response.status(200);

      });

    request = new Request({
      url: api.config.host + '/videos',
      token: api.getToken(),
      method: 'POST'
    });

    spyOn(request, 'send');

    RequestManager.currentSetRequests = 4;
    RequestManager.maxRequests = 6;

    RequestManager.lastRequestSetStart = null;
    RequestManager.resetTimer = null;
    RequestManager.sendRequest(request, {});

    expect(request.send).toHaveBeenCalled();
    expect(RequestManager.currentSetRequests).toEqual(5);
    expect(RequestManager.lastRequestSetStart).toBeDefined();
  });

  it('Should return early if there are no more pending requests and not set a reset timer', function () {
    var result, response;

    spyOn(RequestManager, 'sendRequest');

    response = {
      status: 200
    };

    RequestManager.pending = [];
    RequestManager.activeRequests = 2;

    result = RequestManager.sendNextRequest(response);

    expect(result).toEqual(response);
    expect(RequestManager.sendRequest).not.toHaveBeenCalled();
    expect(RequestManager.resetTimer).toEqual(null);
  });

  it('Should return early if there are no more pending requests and set a reset timer', function (done) {
    var result, response;

    spyOn(RequestManager, 'sendRequest');

    response = {
      status: 200
    };

    RequestManager.resetTimer = null;
    RequestManager.pending = [];
    RequestManager.activeRequests = 1;

    result = RequestManager.sendNextRequest(response);

    expect(result).toEqual(response);
    expect(RequestManager.sendRequest).not.toHaveBeenCalled();
    expect(RequestManager.resetTimer).not.toEqual(null);

    done();
  });

  it('Should configure the proper values for limit and reset if they are not already set', function () {
    var result, response, request;

    // Mock the XHR object
    mock.setup();

    // Mock the response from the REST api.
    mock.get(api.config.host + '/videos',
      function (request, response) {

        // Restore the XHR object.
        mock.teardown();

        return response.status(200);

      });

    request = new Request({
      url: api.config.host + '/videos',
      token: api.getToken(),
      method: 'POST'
    });

    response = {
      status: 200,
      headers: function (header) {
        switch (header) {
          case 'X-Ratelimit-Reset':
            return 1;
          case 'X-Ratelimit-Remaining':
            return 10;
          case 'X-Ratelimit-Limit':
            return 10;
        }
      }
    };

    RequestManager.maxRequests = 100;
    RequestManager.XRatelimitReset = null;
    RequestManager.XRatelimitLimit = null;

    RequestManager.pending[0] = [request, null];

    spyOn(request, 'send');
    spyOn(RequestManager, 'sendRequest').and.callThrough();

    result = RequestManager.sendNextRequest(response);

    expect(RequestManager.XRatelimitReset).not.toEqual(null);
    expect(RequestManager.XRatelimitLimit).not.toEqual(null);
    expect(RequestManager.sendRequest).toHaveBeenCalled();
    expect(request.send).toHaveBeenCalled();
    expect(RequestManager.maxRequests).toEqual(10);
  });

  it('Should not override the maxRequests and should set the limit and reset if they are not already set', function () {
    var result, response, request;

    // Mock the XHR object
    mock.setup();

    // Mock the response from the REST api.
    mock.get(api.config.host + '/videos',
      function (request, response) {

        // Restore the XHR object.
        mock.teardown();

        return response.status(200);

      });

    request = new Request({
      url: api.config.host + '/videos',
      token: api.getToken(),
      method: 'POST'
    });

    response = {
      status: 200,
      headers: function (header) {
        switch (header) {
          case 'X-Ratelimit-Reset':
            return 1;
          case 'X-Ratelimit-Remaining':
            return 10;
          case 'X-Ratelimit-Limit':
            return 10;
        }
      }
    };

    RequestManager.maxRequests = 10;
    RequestManager.XRatelimitReset = null;
    RequestManager.XRatelimitLimit = null;

    RequestManager.pending[0] = [request, null];

    spyOn(request, 'send');
    spyOn(RequestManager, 'sendRequest').and.callThrough();

    result = RequestManager.sendNextRequest(response);

    expect(RequestManager.XRatelimitReset).not.toEqual(null);
    expect(RequestManager.XRatelimitLimit).not.toEqual(null);
    expect(RequestManager.sendRequest).toHaveBeenCalled();
    expect(request.send).toHaveBeenCalled();
    expect(RequestManager.maxRequests).toEqual(10);
  });

  it('Should delay the request.', function () {
    var response, request;

    request = {}
    response = {
      status: 200,
      headers: function () {
        return 0;
      }
    };

    RequestManager.maxRequests = 10;
    RequestManager.XRatelimitReset = 1;
    RequestManager.XRatelimitLimit = 10;

    RequestManager.pending[0] = [request, null];

    // Spy on setTimeout to test if the request will be scheduled
    spyOn(window, 'setTimeout');

    RequestManager.sendNextRequest(response);

    expect(RequestManager.XRatelimitReset).not.toEqual(null);
    expect(RequestManager.XRatelimitLimit).not.toEqual(null);
    expect(RequestManager.maxRequests).toEqual(10);

    expect(window.setTimeout).toHaveBeenCalledWith(jasmine.any(Function), jasmine.any(Number));

  });
});
