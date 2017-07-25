'use strict';

var IngestSDK = require('../../src/index');
var mock = require('xhr-mock');

var api = new IngestSDK();
var inputsResource;

describe('Ingest API : Resource : Inputs', function () {

  beforeEach(function () {

    inputsResource = new api.inputsResource({
      host: api.config.host,
      resource: 'encoding/inputs',
      tokenSource: api.getToken.bind(api)
    });
  });

  describe('getAll', function () {

    it('Should request all Inputs without a filter chain if none was provided.', function (done) {

      var request;

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the API.
      mock.mock('GET', api.config.host + '/encoding/inputs', function (req, res) {

        // Restore the XHR object.
        mock.teardown();

        return res.status(200).body([]);

      });

      request = inputsResource.getAll().then(function (response) {

        expect(response).toBeDefined();
        done();

      }, function (error) {

        expect(error).not.toBeDefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should request all Inputs with a filter chain if provided.', function (done) {

      var filters = ['has-video', 'new'];
      var headers = {};
      var request;

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the API.
      mock.mock('GET', api.config.host + '/encoding/inputs?filter=has-video,new', function (req, res) {

        // Restore the XHR object.
        mock.teardown();

        return res.status(200).body([]);

      });

      request = inputsResource.getAll(headers, filters).then(function (response) {

        expect(response).toBeDefined();
        done();

      }, function (error) {

        expect(error).not.toBeDefined();
        done();

      });

      // Ensure a promise is returned.
      expect(request.then).toBeDefined();

    });

  });

  describe('search', function () {

    it('Should return a rejected promise if the provided search query is not a string.', function (done) {

      var input = {};  // Not a string.
      var headers = {};
      var filters = null;  // No filters provided.

      var promise = inputsResource.search(input, headers, filters).then(function (result) {

        expect(result).not.toBeDefined();
        done();

      }, function (error) {

        expect(error).toBe('IngestSDK Inputs search requires search input to be passed as a string.');
        done();

      });

      // Ensure a promise is returned.
      expect(promise.then).toBeDefined();

    });

    it('Should search for Inputs matching query `test` without a filter chain.', function (done) {

      var input = 'test';
      var headers = {};
      var filters = null;  // No filters provided.
      var request;

      // Mock the XHR object.
      mock.setup();

      mock.mock('GET', api.config.host + '/encoding/inputs?search=test', function (req, res) {

        // Restore the XHR object.
        mock.teardown();

        return res.status(200).body([]);

      });

      request = inputsResource.search(input, headers, filters).then(function (response) {

        expect(response).toBeDefined();
        done();

      }, function (error) {

        expect(error).not.toBeDefined();
        done();

      });

      // Ensure a promise is returned.
      expect(request.then).toBeDefined();

    });

  });

  it('Should search for Inputs matching query `test` with a filter chain of `audio-only` and `new`.', function (done) {

    var input = 'test';
    var headers = {};
    var filters = ['audio-only', 'new'];
    var request;

    // Mock the XHR object.
    mock.setup();

    mock.mock('GET', api.config.host + '/encoding/inputs?search=test&filter=audio-only,new', function (req, res) {

      // Restore the XHR object.
      mock.teardown();

      return res.status(200).body([]);

    });

    request = inputsResource.search(input, headers, filters).then(function (response) {

      expect(response).toBeDefined();
      done();

    }, function (error) {

      expect(error).not.toBeDefined();
      done();

    });

    // Ensure a promise is returned.
    expect(request.then).toBeDefined();

  });

});
