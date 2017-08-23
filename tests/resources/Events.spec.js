'use strict';

var IngestSDK = require('../../src/index');
var mock = require('xhr-mock');

var api = new IngestSDK();
var eventsResource;

var event = {
  'event_id': 'eventid',
  'network_id': 'networkid',
  'event_name': 'eventname',
  'created_at': '2017-05-29T14:40:30.807644Z',
  'data': {}
};

describe('Ingest API : Resource : Events', function () {
  beforeEach(function () {
    eventsResource = new api.eventsResource({
      host: api.config.host,
      resource: 'events',
      tokenSource: api.getToken.bind(api)
    });
  });

  describe('getAll', function () {
    it('Should retrieve all events', function (done) {
      var url, request;

      mock.setup();

      mock.mock('GET', api.config.host + '/events',
        function (request, response) {

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify([event]));
        });

      request = eventsResource.getAll().then(function (response) {
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

    it('Should retrieve all events with a specific status', function (done) {
      var url, request;

      mock.setup();

      // Mock the response from the REST api.
      mock.mock('GET', api.config.host + '/events?filter=new',
        function (request, response) {
          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify([event]));
        });

      request = eventsResource.getAll(null, 'new').then(function (response) {
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

    it('Should retrieve all events with a specific type', function (done) {
      var url, request;

      mock.setup();

      // Mock the response from the REST api.
      mock.mock('GET', api.config.host + '/events?resource=videos',
        function (request, response) {
          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify([event]));
        });

      request = eventsResource.getAll(null, null, 'videos').then(function (response) {
        expect(response).toBeDefined();
        expect(response.data).toBeDefined();
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

    it('Should retrieve all events with a specific status AND type', function (done) {
      var url, request;

      mock.setup();

      // Mock the response from the REST api.
      mock.mock('GET', api.config.host + '/events?filter=new&resource=videos',
        function (request, response) {
          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify([event]));
        });

      request = eventsResource.getAll(null, 'new', 'videos').then(function (response) {
        expect(response).toBeDefined();
        expect(response.data).toBeDefined();
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

    it('Should error if it has a status that is not a string', function () {
      var request = eventsResource.getAll(null, true).then(function (response) {
        expect(response).not.toBeDefined();
        done();
      }, function (error) {
        expect(error).toBeDefined();
        done();
      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

    it('Should error if it has a type that is not a string', function () {
      var request = eventsResource.getAll(null, 'new', true).then(function (response) {
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

  describe('getTypes', function () {
    it('Should retrieve all event types', function (done) {
      var url, request;

      mock.setup();

      mock.mock('GET', api.config.host + '/events/types',
        function (request, response) {

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify([]));
        });

      request = eventsResource.getTypes().then(function (response) {
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
  });

});
