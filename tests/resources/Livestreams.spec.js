'use strict';

var IngestSDK = require('../../src/index');
var mock = require('xhr-mock');

var api = new IngestSDK();
var livestreamResource;

var livestream = {
  "id": "livestream_id",
  "url": "resource_url",
  "stream_key": "streamkey",
  "title": "Live stream title",
  "network_id": "network_id",
  "rtmp_url": "rtmp_url",
  "play_url": "playback_url",
  "status": "FINISHED",
  "created_at": "2017-09-11T12:11:04.975232Z",
  "finished_at": "2017-09-11T12:14:49.330338Z",
  "deleted_at": null
};

describe('Ingest API : Resource : Livestreams', function () {
  beforeEach(function () {
    livestreamResource = new api.livestreamsResource({
      host: api.config.host,
      resource: 'live',
      tokenSource: api.getToken.bind(api)
    });
  });

  describe('getAll', function () {
    it('Should retrieve all livestreams', function (done) {
      var url, request;

      mock.setup();

      mock.mock('GET', api.config.host + '/live',
        function (request, response) {

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify([livestream]));
        });

      request = livestreamResource.getAll().then(function (response) {
        expect(response).toBeDefined();
        expect(response.data).toBeDefined();
        expect(response.headers).toBeDefined();
        expect(typeof response.headers).toBe('function');
        expect(response.statusCode).toBeDefined();

        done();
      }, function (error) {
        expect(error).not.toBeDefined();
        done();
      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

    it('Should retrieve all livestreams with a specific status', function (done) {
      var url, request;

      mock.setup();

      // Mock the response from the REST api.
      mock.mock('GET', api.config.host + '/live?status=finished',
        function (request, response) {
          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify([livestream]));
        });

      request = livestreamResource.getAll(null, 'finished').then(function (response) {
        expect(response).toBeDefined();
        expect(response.data).toBeDefined();
        expect(response.headers).toBeDefined();
        expect(typeof response.headers).toBe('function');
        expect(response.statusCode).toBeDefined();

        done();
      }, function (error) {
        expect(error).not.toBeDefined();
        done();
      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should error if it has a status that is not a string', function () {
      var request = livestreamResource.getAll(null, true).then(function (response) {
        expect(response).not.toBeDefined();
        done();
      }, function (error) {
        expect(error).toBeDefined();
        done();
      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });
  });

  describe('getStatus', function () {
    it('Should retrieve the status for the provided livestream.', function (done) {
      var url;

      mock.setup();

      url = api.utils.parseTokens(api.config.host + livestreamResource.config.status, {
        resource: livestreamResource.config.resource,
        id: 'test-id'
      });

      mock.mock('GET', url,
        function (request, response) {

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(livestream));

        });

      livestreamResource.getStatus('test-id').then(function (response) {
        expect(response).toBeDefined();
        expect(response.data).toEqual(livestream);
        expect(response.headers).toBeDefined();
        expect(typeof response.headers).toBe('function');
        expect(response.statusCode).toBeDefined();
        done();
      }, function (error) {
        expect(error).not.toBeDefined();
        done();
      });

    });

    it('Should fail if an id is not supplied.', function (done) {
      livestreamResource.getStatus().then(function (response) {
        expect(response).not.toBeDefined();
        done();
      }, function (error) {
        expect(error).toBeDefined();
        done();
      });

    });
  });

  describe('end', function () {

    it('Should end a livestream.', function (done) {
      var request, url;

      // Mock the XHR object
      mock.setup();

      // Mock the response from the REST api.
      mock.mock('POST', api.config.host + '/live/live-id/stop',
        function (request, response) {

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify({}));

        });

      request = livestreamResource.end('live-id', 'streamkey').then(function (response) {
        expect(response).toBeDefined();
        expect(response.headers).toBeDefined();
        expect(typeof response.headers).toBe('function');
        expect(response.statusCode).toBeDefined();
        done();
      }, function (error) {
        expect(error).toBeUndefined();
        done();
      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

    it('Should fail if the id is not a string', function (done) {
      var request = livestreamResource.end({test: true}).then(function (response) {
        expect(response).not.toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

    it('Should fail if the streamkey is not a string', function (done) {
      var request = livestreamResource.end('id', {test: true}).then(function (response) {
        expect(response).not.toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });
  });

});
