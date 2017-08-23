'use strict';

var IngestSDK = require('../../src/index');
var mock = require('xhr-mock');

var api = new IngestSDK();
var videosResource;

var video = {
  author: {
    deleted_at: null,
    email: 'user@domain.com',
    first_time_user: true,
    id: '7bcdd37d-4c2a-473d-9fdf-ac0a5ac778df',
    profile: {},
    timezone: 'UTC',
    url: 'https://www.someurl.com',
  },
  created_at: '2015-12-18T15:54:53.085423Z',
  deleted_at: null,
  description: 'sdf',
  id: '8dee6bee-cb45-4c49-989b-cf9c70601567',
  playback_url: null,
  poster: null,
  private: null,
  published_at: null,
  schedule_end: null,
  schedule_start: null,
  size: 0,
  status: 0,
  tags: ['sdf'],
  title: 'ad',
  updated_at: '2015-12-18T15:54:53.085423Z',
  updater: {
    deleted_at: null,
    email: 'user@domain.com',
    first_time_user: true,
    id: '7bcdd37d-4c2a-473d-9fdf-ac0a5ac778df',
    profile: {},
    timezone: 'UTC',
    url: 'https://www.someurl.com',
  },
  url: 'https://www.someurl.com'
};

var variants = [
  {
    'id': 'b1ede429-c623-4713-8442-d73c66a963a4',
    'name': 'low',
    'duration': 734.167,
    'type': 'hls',
    'video_id': 'cd74a0df-3177-4a3e-9eb5-c890a90bd3e3',
    'profile_id': '0519d89d-ac2e-4cd7-938a-89c32e764c8a'
  },
  {
    'id': '626abeac-5389-4c91-9b7b-1c39b16e3ada',
    'name': 'medium',
    'duration': 734.167,
    'type': 'hls',
    'video_id': 'cd74a0df-3177-4a3e-9eb5-c890a90bd3e3',
    'profile_id': '0519d89d-ac2e-4cd7-938a-89c32e764c8a'
  }
];

describe('Ingest API : Resource : Videos', function () {

  beforeEach(function () {

    videosResource = new api.videosResource({
      host: api.config.host,
      resource: 'videos',
      tokenSource: api.getToken.bind(api)
    });

  });

  describe('getAll', function () {

    it('Should retrieve all videos.', function (done) {

      var url, request;

      mock.setup();

      // Mock the response from the REST api.
      mock.mock('GET', api.config.host + '/videos',
        function (request, response) {
          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify([video]));
        });

      request = videosResource.getAll().then(function (response) {
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

    it('Should retrieve all videos with a specific status', function (done) {

      var url, request;

      mock.setup();

      // Mock the response from the REST api.
      mock.mock('GET', api.config.host + '/videos?status=all',
        function (request, response) {
          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify([video]));
        });

      request = videosResource.getAll(null, 'all').then(function (response) {
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
      var request = videosResource.getAll(null, true).then(function (response) {
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

  describe('getVariants', function () {

    it('Should retrieve the variants for the provided video.', function (done) {
      var url;

      mock.setup();

      url = api.utils.parseTokens(api.config.host + videosResource.config.variants, {
        resource: videosResource.config.resource,
        id: 'test-id'
      });

      mock.mock('GET', url,
        function (request, response) {

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(variants));

        });

      videosResource.getVariants('test-id').then(function (response) {
        expect(response).toBeDefined();
        expect(response.data).toEqual(variants);
        done();
      }, function (error) {
        expect(error).not.toBeDefined();
        done();
      });

    });

    it('Should fail if an id is not supplied.', function (done) {

      videosResource.getVariants().then(function (response) {
        expect(response).not.toBeDefined();
        done();
      }, function (error) {
        expect(error).toBeDefined();
        done();
      });

    });

  });

  describe('publish', function () {

    it('Should fail if no ids are passed in.', function (done) {

      var request = videosResource.publish().then(function (response) {

        expect(response).toBeUndefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should publish a video record.', function (done) {
      var url, videoIDs;

      // Mock the XHR object
      mock.setup();

      videoIDs = ['1234','2345','3456','4567'];

      url = api.utils.parseTokens(api.config.host + videosResource.config.publish, {
        resource: videosResource.config.resource
      });

      mock.mock('POST', url, function (request, response) {
        // Restore the XHR Object
        mock.teardown();

        return response.status(200)
      });

      var request = videosResource.publish(videoIDs).then(function (response) {
        expect(response.statusCode).toEqual(200);
        done();

      }, function (error) {

        expect(error).toBeUndefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail to publish a video if something other than an array is passed in', function (done) {
      var request = videosResource.publish('test-string').then(function (response) {

        expect(response).toBeUndefined();
        done();

      }, function (error) {

        expect(error).toBeDefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });
  });

  describe('count', function () {

    it('Should retrieve a count of all the videos.', function (done) {

      var url, request;

      url = api.utils.parseTokens(api.config.host + videosResource.config.all, {
        resource: videosResource.config.resource
      });

      mock.setup();

      // Mock the response from the REST api.
      mock.mock('HEAD', url, function (request, response) {
        // Restore the XHR object.
        mock.teardown();

        return response.status(204)
          .header('Resource-Count', 5);

      });

      request = videosResource.count().then(function (response) {

        expect(response).toBeDefined();
        expect(typeof response).toBe('number');
        expect(response).toEqual(5);

        done();

      }, function (error) {

        expect(error).not.toBeDefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should retrieve a count of all the videos with the specified status.', function (done) {
      var request;

      mock.setup();

      // Mock the response from the REST api.
      mock.mock('HEAD', api.config.host + '/videos?status=all', function (request, response) {
        // Restore the XHR object.
        mock.teardown();

        return response.status(204)
          .header('Resource-Count', 5);

      });

      request = videosResource.count('all').then(function (response) {

        expect(response).toBeDefined();
        expect(typeof response).toBe('number');
        expect(response).toEqual(5);

        done();

      }, function (error) {

        expect(error).not.toBeDefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should error if it has a status that is not a string.', function (done) {
      var status = true;  // Not a string.

      var request = videosResource.count(status).then(function (response) {

        expect(response).not.toBeDefined();
        done();

      }, function (error) {

        expect(error).toBeDefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should add a `private` query parameter to the url if private videos are requested.', function (done) {

      var request, status, _private;

      status = '';  // No status filters.
      _private = true;

      mock.setup();

      mock.mock('HEAD', api.config.host + '/videos?private=true', function (request, response) {

        // Restore the XHR object.
        mock.teardown();

        return response.status(204)
          .header('Resource-Count', 11);
      });

      request = videosResource.count(status, _private).then(function (response) {

        expect(typeof response).toBe('number');
        expect(response).toEqual(11);

        done();

      }, function (error) {

        expect(error).not.toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should add both a status and a query parameter.', function (done) {

      var request, status, _private;

      status = 'created,published';
      _private = true;

      mock.setup();

      mock.mock('HEAD', api.config.host + '/videos?status=created,published&private=true', function (req, res) {

        // Restore the XHR object.
        mock.teardown();

        return res.status(204)
          .header('Resource-Count', 11);
      });

      request = videosResource.count(status, _private).then(function (response) {

        expect(typeof response).toBe('number');
        expect(response).toEqual(11);

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
