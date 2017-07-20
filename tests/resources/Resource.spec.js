'use strict';

var IngestSDK = require('../../src/index');
var mock = require('xhr-mock');

var api = new IngestSDK();
var resource;
var validVideoId;
var createdVideo;
var nextRange;

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

describe('Ingest API : Resource', function () {

  beforeEach(function () {
    resource = new api.resource({
      host: api.config.host,
      resource: 'videos',
      tokenSource: api.getToken.bind(api)
    });

    // Set my token to empty
    api.setToken('');
  });

  describe('parse resource', function () {

    it('Should properly build the resource urls.', function () {

      var url = api.utils.parseTokens(resource.config.host + resource.config.all, {
        resource: resource.config.resource
      });

      expect(url).toEqual(resource.config.host + '/videos');

    });

  });

  describe('_tokenSource', function () {

    it('Should return null if the token source is not defined.', function () {

      var result;

      resource.config.tokenSource = null;

      result = resource._tokenSource();

      expect(result).toEqual(null);

    });

  });

  describe('getAll', function () {

    it('Should retrieve all resources.', function (done) {

      var url, request;

      url = api.utils.parseTokens(api.config.host + resource.config.all, {
        resource: resource.config.resource
      });

      mock.setup();

      // Mock the response from the REST api.
      mock.mock('GET', url, function (request, response) {
        // Restore the XHR object.
        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify([video]));

      });

      request = resource.getAll().then(function (response) {
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

    it('Should fail if there is an invalid token set.', function (done) {

      api.setToken('invalid-token');

      var request = resource.getAll().then(function (response) {
        expect(response).toBeDefined();
        expect(response.data).toBeDefined();
        expect(response.headers).toBeDefined();
        expect(typeof response.headers).toBe('function');
        expect(response.statusCode).toBeDefined();

        done();
      }, function (error) {

        expect(error).toBeDefined();

        // Reset the token;
        api.setToken('Bearer somevalidtoken');

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

  });

  describe('getById', function () {
    it('Should return a single resource.', function (done) {
      var url, request;

      url = api.utils.parseTokens(api.config.host + resource.config.byId, {
        resource: resource.config.resource,
        id: '12345'
      });

      mock.setup();

      // Mock the response from the REST api.
      mock.mock('GET', url, function (request, response) {
        // Restore the XHR object.
        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify({data: video}));

      });

      request = resource.getById('12345').then(function (response) {
        expect(response).toBeDefined();
        expect(response.data).toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeUndefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if no ID is provided.', function (done) {
      var request = resource.getById('').then(function (response) {

        expect(response).toBeUndefined();
        done();

      }, function (error) {

        expect(error).toBeDefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('should fail if the passed in ID is not a string', function (done) {
      var request = resource.getById(1234).then(function (response) {

        expect(response).toBeUndefined();
        done();

      }, function (error) {

        expect(error).toBeDefined();
        done();

      });

      expect(request.then).toBeDefined();
    });
  });

  describe('add', function () {

    it('Should add a resource.', function (done) {
      var video = {
        'title': 'an-example.mkve.mkv',
        'size': 0,
        'description': 'Test video.'
      };

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST api.
      mock.mock('POST', api.config.host + '/videos' , function (request, response) {
        // Restore the XHR object.
        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify(video));

      });

      var request = resource.add(video).then(function (response) {

        expect(response).toBeDefined();
        expect(response.data).toBeDefined();
        expect(response.headers).toBeDefined();
        expect(typeof response.headers).toBe('function');
        expect(response.statusCode).toBeDefined();

        // Store the video to use later with the delete test.
        createdVideo = response.data.id;

        done();

      }, function (error) {

        expect(error).toBeUndefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if only a string is passed.', function (done) {

      var video = 'test video';

      var request = resource.add(video).then(function (response) {

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

  describe('delete', function () {

    it('Should delete a resource.', function (done) {

      // Mock the XHR object
      mock.setup();

      // Mock the response from the REST api.
      mock.mock('DELETE', api.config.host + '/videos/1234',
        function (request, response) {

          var data = {
            ok: true
          };

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(data));

        });

      var request = resource.delete('1234').then(function (response) {

        expect(response).toBeDefined();
        expect(response.data).toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeUndefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should delete a resource synchronously.', function (done) {

      spyOn(resource, '_deleteResource').and.callFake(function (resource, permanent, async) {
        expect(async).toEqual(false);
        return api.utils.promisify(true, 'deleted');
      });

      var request = resource.delete('1234', false).then(function (response) {

        expect(resource._deleteResource).toHaveBeenCalled();
        expect(response).toBeDefined();
        expect(response).toEqual('deleted');

        done();

      }, function (error) {

        expect(error).toBeUndefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should delete a resource.', function (done) {

      // Mock the XHR object
      mock.setup();

      // Mock the response from the REST api.
      mock.mock('DELETE', api.config.host + '/videos/1234',
        function (request, response) {

          var data = {
            ok: true
          };

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(data));

        });

      var request = resource.delete('1234').then(function (response) {

        expect(response).toBeDefined();
        expect(response.data).toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeUndefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if the id is not a string', function (done) {

      var request = resource.delete({test: true}).then(function (response) {

        expect(response).not.toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it ('Should permanently delete a resource', function (done) {

      // Mock the XHR object
      mock.setup();

      // Mock the response from the REST api.
      mock.mock('DELETE', api.config.host + '/videos/1234?permanent=1',
        function (request, response) {

          var data = {
            ok: true
          };

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(data));

        });

      var request = resource.permanentDelete('1234').then(function (response) {

        expect(response).toBeDefined();
        expect(response.data.ok).toEqual(true);
        done();

      }, function (error) {

        expect(error).toBeUndefined();
        done();

      });

    });

    it('Should fail if no resources are passed in.', function (done) {

      var request = resource.delete().then(function (response) {

        expect(response).toBeUndefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should soft-delete the resource.', function (done) {

      var data, request, id;

      id = '3fc358b0-630e-43f2-85f9-69195b346312';

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST api.
      mock.mock('DELETE', api.config.host + '/videos/' + id,
        function (request, response) {

          // Restore the XHR object.
          mock.teardown();

          return response.status(202);

        });

      request = api.videos.delete(id).then(function (response) {

        expect(response).toBeDefined();
        expect(typeof response.headers).toBe('function');
        expect(response.statusCode).toBe(202);
        expect(response.data).toBeFalsy();

        done();

      }, function (error) {

        expect(error).not.toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

  });

  describe('search', function () {

    it('Should retrive search results for the given input', function (done) {

      // Mock the XHR Object.
      mock.setup();

      mock.mock('GET', api.config.host + '/videos?search=test',
        function (request, response) {

          var data = {
            called: true
          };

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(data));
        });

      var request = resource.search('test').then(function (response) {

        expect(response).toBeDefined();
        expect(response.data.called).toEqual(true);
        done();

      }, function (error) {

        expect(error).not.toBeDefined();
        done();

      });

      // Ensure a promise is returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if search input is not supplied', function (done) {

      var request = resource.search().then(function (response) {

        expect(response).toBeUndefined();
        done();

      }, function (error) {

        expect(error).toBeDefined();
        done();

      });

      // Ensure a promise is returned.
      expect(request.then).toBeDefined();

    });

    it('Should error if it has a status that is not a string', function () {
      var request = resource.search('12345', null, true).then(function (response) {
        expect(response).not.toBeDefined();
        done();
      }, function (error) {
        expect(error).toBeDefined();
        done();
      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

    it('Should retrieve search results for the given input, from the trash.', function (done) {
      // Mock the XHR Object.
      mock.setup();

      mock.mock('GET', api.config.host + '/videos?search=test&status=trashed',
        function (request, response) {

          var data = {
            called: true
          };

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(data));
        });

      spyOn(resource, 'search').and.callThrough();

      var request = resource.searchTrash('test').then(function (response) {

        expect(response).toBeDefined();
        expect(response.data.called).toEqual(true);

        expect(resource.search).toHaveBeenCalledWith('test', undefined, 'trashed');

        done();

      }, function (error) {

        expect(error).not.toBeDefined();
        done();

      });

      // Ensure a promise is returned.
      expect(request.then).toBeDefined();
    });
  });

  describe('count', function () {

    it('Should retrieve a count of all the resources', function (done) {

      var url, request;

      url = api.utils.parseTokens(api.config.host + resource.config.all, {
        resource: resource.config.resource
      });

      mock.setup();

      // Mock the response from the REST api.
      mock.mock('HEAD', url, function (request, response) {
        // Restore the XHR object.
        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .header('Resource-Count', 5)
          .body('{}');

      });

      request = resource.count().then(function (response) {

        expect(response).toBeDefined();
        expect(typeof response).toBe('number');

        done();

      }, function (error) {

        expect(error).toBeUndefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

  });

  describe('getTrashed', function () {

    it('Should retrieve trashed resources.', function (done) {

      var data = ['video1', 'video2', 'video3'];

      mock.setup();

      mock.mock('GET', api.config.host + '/videos?status=trashed',
        function (request, response) {

          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(data));

        });

      var request = resource.getTrashed().then(function (response) {

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

    it('Should retrieve the next page of trashed resources.', function (done) {

      var data = ['video4', 'video5', 'video6'];

      mock.setup();

      mock.mock('GET', api.config.host + '/videos?status=trashed',
        function (request, response) {

          mock.teardown();

          expect(request._headers.range).toEqual('12345');

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(data));

        });

      var request = resource.getTrashed({
        Range: '12345'
      }).then(function (response) {

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

  });

  describe('trashCount', function () {

    it('Should return the count of trashed resources.', function (done) {

      var url, request;

      url = api.utils.parseTokens(api.config.host + resource.config.trash, {
        resource: resource.config.resource
      });

      mock.setup();

      // Mock the response from the REST api.
      mock.mock('HEAD', url, function (request, response) {
        // Restore the XHR object.
        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .header('Resource-Count', 5)
          .body('{}');

      });

      request = resource.trashCount().then(function (response) {

        expect(response).toBeDefined();
        expect(typeof response).toBe('number');

        done();

      }, function (error) {

        expect(error).toBeUndefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

  });

  describe('update', function () {

    it('Should fail if no resource are passed in.', function (done) {

      var request = resource.update().then(function (response) {

        expect(response).toBeUndefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should update a resource record.', function (done) {

      var video = {
        id: 'test-video'
      };

      // Mock the XHR object
      mock.setup();

      mock.mock('PATCH', api.config.host + '/videos/test-video',
        function (request, response) {

          var _video = JSON.stringify(video);

          // Restore the XHR Object
          mock.teardown();

          expect(_video).toEqual(request._body);

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(_video);

        });

      var request = resource.update(video).then(function (response) {

        expect(response).toBeDefined();
        expect(response.data.id).toEqual('test-video');
        done();

      }, function (error) {

        expect(error).toBeUndefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail to update a resource if something other than an object is passed',
      function (done) {

        var request = resource.update('video').then(function (response) {

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

  describe('permanentDelete', function () {

    it('Should permanently delete the passed in resource.', function (done) {

      var data, request, id;

      id = '3fc358b0-630e-43f2-85f9-69195b346312';

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST api.
      mock.mock('DELETE', api.config.host + '/videos/' + id + '?permanent=1',
        function (request, response) {

          // Restore the XHR object.
          mock.teardown();

          return response.status(202);

        });

      request = resource.permanentDelete(id, true).then(function (response) {

        expect(response).toBeDefined();
        expect(typeof response.headers).toBe('function');
        expect(response.statusCode).toBe(202);
        expect(response.data).toBeFalsy();

        done();

      }, function (error) {

        expect(error).toBeUndefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if no resources are passed in.', function (done) {

      var request = resource.permanentDelete().then(function (response) {

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

});
