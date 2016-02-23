var access_token = 'Bearer ' + window.token;

var api = new IngestAPI({
  host: 'http://weasley.teamspace.ad:8080',
  token: access_token
});

var mock = require('xhr-mock');

var resource;
var validVideoId;
var createdVideo;
var nextRange;

describe('Ingest API : Resource', function () {

  beforeEach(function () {
    resource = new api.resource({
      host: api.config.host,
      resource: 'videos',
      tokenSource: api.getToken.bind(api),
      cache: api.cache
    });

    // Re-enable cache each time.
    resource.cache.enabled = true;
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

      resource.cache.enabled = false;

      var request = resource.getAll().then(function (response) {
        expect(response).toBeDefined();
        expect(response.data).toBeDefined();
        expect(response.headers).toBeDefined();
        expect(typeof response.headers).toBe('function');
        expect(response.statusCode).toBeDefined();

        validVideoId = response.data[0].id;

        nextRange = response.headers('Next-Range');

        expect(nextRange).toBeDefined();

        expect(validVideoId).toBeDefined();

        done();
      }, function (error) {
        expect(error).toBeUndefined();
        done();
      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should retrieve all resources and cache the result', function (done) {

      spyOn(resource.cache, 'save').and.callThrough();

      var request = resource.getAll().then(function (response) {
        expect(response).toBeDefined();
        expect(response.data).toBeDefined();
        expect(response.headers).toBeDefined();
        expect(typeof response.headers).toBe('function');
        expect(response.statusCode).toBeDefined();

        validVideoId = response.data[0].id;

        nextRange = response.headers('Next-Range');

        expect(nextRange).toBeDefined();

        expect(validVideoId).toBeDefined();

        expect(resource.cache.save).toHaveBeenCalled();

        done();
      }, function (error) {
        expect(error).toBeUndefined();
        done();
      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should retrieve the next page of resources.', function (done) {

      var request = resource.getAll({
        Range: nextRange
      }).then(function (response) {

        expect(response).toBeDefined();
        expect(response.data).toBeDefined();
        expect(response.headers).toBeDefined();
        expect(typeof response.headers).toBe('function');
        expect(response.statusCode).toBeDefined();

        expect(response.data[0].id).not.toEqual(validVideoId);

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
        api.setToken(access_token);

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

  });

  describe('getById', function () {

    it('Should return a single resource.', function (done) {

      var request = resource.getById(validVideoId).then(function (response) {

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

    it('Should fail if an invalid ID is provided.', function (done) {
      var request = resource.getById('invalid-id').then(function (response) {

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

    it('Should ignore the cache if it is disabled.', function (done) {

      spyOn(resource.cache, 'retrieve').and.callThrough();

      resource.cache.enabled = false;

      var request = resource.getById(validVideoId).then(function (response) {

        expect(response).toBeDefined();
        expect(response.data).toBeDefined();

        expect(resource.cache.retrieve).not.toHaveBeenCalled();

        done();

      }, function (error) {

        expect(error).toBeUndefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

  });

  describe('add', function () {

    it('Should add a resource.', function (done) {

      resource.cache.enabled = false;

      var video = {
        'title': 'an-example.mkve.mkv',
        'size': 0,
        'description': 'Test video.'
      };

      // Mock the XHR object.
      mock.setup();

      var resp = {
        author: {
          deleted_at: null,
          email: "shawn.gillam-wright@redspace.com",
          first_time_user: true,
          id: "7bcdd37d-4c2a-473d-9fdf-ac0a5ac778df",
          profile: {},
          timezone: "UTC",
          url: "http://weasley.teamspace.ad:8080/users/7bcdd37d-4c2a-473d-9fdf-ac0a5ac778df",
        },
        created_at: "2015-12-18T15:54:53.085423Z",
        deleted_at: null,
        description: "sdf",
        id: "8dee6bee-cb45-4c49-989b-cf9c70601567",
        playback_url: null,
        poster: null,
        private: null,
        published_at: null,
        schedule_end: null,
        schedule_start: null,
        size: 0,
        status: 0,
        tags: ["sdf"],
        title: "ad",
        updated_at: "2015-12-18T15:54:53.085423Z",
        updater: {
          deleted_at: null,
          email: "shawn.gillam-wright@redspace.com",
          first_time_user: true,
          id: "7bcdd37d-4c2a-473d-9fdf-ac0a5ac778df",
          profile: {},
          timezone: "UTC",
          url: "http://weasley.teamspace.ad:8080/users/7bcdd37d-4c2a-473d-9fdf-ac0a5ac778df",
        },
        url: "http://weasley.teamspace.ad:8080/videos/8dee6bee-cb45-4c49-989b-cf9c70601567"
      };

      // Mock the response from the REST api.
      mock.mock('POST', api.config.host + '/videos' , function (request, response) {
        // Restore the XHR object.
        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify(resp));

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

    it('Should add a resource and cache the result.', function (done) {

      var video = {
        'title': 'an-example.mkve.mkv',
        'size': 0,
        'description': 'Test video.'
      };

      // Mock the XHR object.
      mock.setup();

      var resp = {
        author: {
          deleted_at: null,
          email: "shawn.gillam-wright@redspace.com",
          first_time_user: true,
          id: "7bcdd37d-4c2a-473d-9fdf-ac0a5ac778df",
          profile: {},
          timezone: "UTC",
          url: "http://weasley.teamspace.ad:8080/users/7bcdd37d-4c2a-473d-9fdf-ac0a5ac778df",
        },
        created_at: "2015-12-18T15:54:53.085423Z",
        deleted_at: null,
        description: "sdf",
        id: "8dee6bee-cb45-4c49-989b-cf9c70601567",
        playback_url: null,
        poster: null,
        private: null,
        published_at: null,
        schedule_end: null,
        schedule_start: null,
        size: 0,
        status: 0,
        tags: ["sdf"],
        title: "ad",
        updated_at: "2015-12-18T15:54:53.085423Z",
        updater: {
          deleted_at: null,
          email: "shawn.gillam-wright@redspace.com",
          first_time_user: true,
          id: "7bcdd37d-4c2a-473d-9fdf-ac0a5ac778df",
          profile: {},
          timezone: "UTC",
          url: "http://weasley.teamspace.ad:8080/users/7bcdd37d-4c2a-473d-9fdf-ac0a5ac778df",
        },
        url: "http://weasley.teamspace.ad:8080/videos/8dee6bee-cb45-4c49-989b-cf9c70601567"
      };

      // Mock the response from the REST api.
      mock.mock('POST', api.config.host + '/videos' , function (request, response) {
        // Restore the XHR object.
        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify(resp));

      });

      spyOn(resource.cache, 'save').and.callThrough();

      var request = resource.add(video).then(function (response) {

        expect(response).toBeDefined();
        expect(response.data).toBeDefined();
        expect(response.headers).toBeDefined();
        expect(typeof response.headers).toBe('function');
        expect(response.statusCode).toBeDefined();

        expect(resource.cache.save).toHaveBeenCalled();

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

      resource.cache.enabled = false;

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

      resource.cache.enabled = false;

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

    it('Should delete a resource and remove it from cache.', function (done) {

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

      spyOn(resource.cache, 'remove').and.callThrough();

      var request = resource.delete('1234').then(function (response) {

        expect(response).toBeDefined();
        expect(response.data).toBeDefined();

        expect(resource.cache.remove).toHaveBeenCalled();

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

    it('Should soft-delete all resources inside the passed in array.', function (done) {

      resource.cache.enabled = false;

      var data, request;

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST api.
      mock.mock('DELETE', api.config.host + '/videos',
        function (request, response) {

          // Restore the XHR object.
          mock.teardown();

          return response.status(202);

        });

      // Mock request data.
      data = [
        {
          'id': '3fc358b0-630e-43f2-85f9-69195b346312'
        }
      ];

      request = api.videos.delete(data).then(function (response) {

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

    it('Should soft-delete all resources and remove them from cache.', function (done) {

      var data, request;

      spyOn(resource.cache, 'remove').and.callThrough();

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST api.
      mock.mock('DELETE', api.config.host + '/videos',
        function (request, response) {

          // Restore the XHR object.
          mock.teardown();

          return response.status(202);

        });

      // Mock request data.
      data = [
        {
          'id': '3fc358b0-630e-43f2-85f9-69195b346312'
        }
      ];

      request = api.videos.delete(data).then(function (response) {

        expect(response).toBeDefined();
        expect(typeof response.headers).toBe('function');
        expect(response.statusCode).toBe(202);
        expect(response.data).toBeFalsy();

        expect(resource.cache.remove).toHaveBeenCalled();

        done();

      }, function (error) {

        expect(error).toBeUndefined();

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

        expect(error).toBeUndefined();
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

  });

  describe('count', function () {

    it('Should retrieve a count of all the resources', function (done) {

      var request = resource.count().then(function (response) {

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

      mock.mock('GET', api.config.host + '/videos?filter=trashed',
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

      mock.mock('GET', api.config.host + '/videos?filter=trashed',
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

      var request = resource.trashCount().then(function (response) {

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

    it('Should send a request with an array of resource objects.', function (done) {

      var data, request;

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST api.
      mock.mock('PATCH', api.config.host + '/videos',
        function (request, response) {

          var data = {
            'Body': [
              {
                'id': '3fc358b0-630e-43f2-85f9-69195b346312',
                'url': 'http://weasley.teamspace.ad:8080/videos/3fc358b0-630e-43f2-85f9-69195b346312',
                'title': 'an-exampleMODIFIED.mkve.mkv',
                'description': 'Test video.2',
                'playback_url': null,
                'status': 0,
                'size': 0,
                'created_at': '2015-12-08T17:54:48.437471Z',
                'updated_at': '2015-12-16T17:29:48.108036Z',
                'deleted_at': null,
                'published_at': null,
                'schedule_start': null,
                'schedule_end': null,
                'private': false,
                'tags': null,
                'poster': null,
                'author': {
                  'id': '7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c',
                  'url': 'http://weasley.teamspace.ad:8080/users/7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c',
                  'email': 'jamie.stackhouse@redspace.com',
                  'profile': {
                    'display_name': 'Jamie Stackhouse',
                    'title': 'Super Geek'
                  },
                  'timezone': 'America/Halifax',
                  'deleted_at': null,
                  'first_time_user': true
                },
                'updater': {
                  'id': '7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c',
                  'url': 'http://weasley.teamspace.ad:8080/users/7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c',
                  'email': 'jamie.stackhouse@redspace.com',
                  'profile': {
                    'display_name': 'Jamie Stackhouse',
                    'title': 'Super Geek'
                  },
                  'timezone': 'America/Halifax',
                  'deleted_at': null,
                  'first_time_user': true
                }
              }
            ],
            'Errors': null
          };

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(data));

        });

      // Mock request data.
      data = [
        {
          'id': '3fc358b0-630e-43f2-85f9-69195b346312',
          'title': 'an-exampleMODIFIED.mkve.mkv'
        }
      ];

      request = resource.update(data).then(function (response) {

        expect(response).toBeDefined();
        expect(response.data.Body).toBeDefined();
        expect(response.data.Errors).toBeNull();
        expect(response.data.Body[0].id).toBeDefined();
        expect(response.data.Body[0].title).toBe('an-exampleMODIFIED.mkve.mkv');

        done();

      }, function (error) {

        expect(error).toBeUndefined();

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

    it('Should not perform a diff if caching is disabled.', function (done) {

      var request;

      api.cache.enabled = false;

      spyOn(api.cache, 'diff');

      // Mock request data.
      var data = {
        'id': '3fc358b0-630e-43f2-85f9-69195b346312',
        'title': 'an-exampleMODIFIED.mkve.mkv'
      };

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST api.
      mock.mock('PATCH', api.config.host + '/videos/3fc358b0-630e-43f2-85f9-69195b346312',
        function (request, response) {

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(data));

        });

      request = resource.update(data).then(function (response) {

        expect(response).toBeDefined();
        expect(api.cache.diff).not.toHaveBeenCalled();

        done();

      }, function (error) {

        expect(error).toBeUndefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should return the cached object if there were no changes detected.', function () {

      var called = false;

      // Mock the retrieve and return a different cached value for the first test object.
      spyOn(api.cache, 'retrieve').and.returnValue({
        'id': '3fc358b0-630e-43f2-85f9-69195b346312',
        'value': 'test'
      });

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST api.
      mock.mock('PATCH', api.config.host + '/videos/3fc358b0-630e-43f2-85f9-69195b346312',
        function (request, response) {
          called = true;
          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(data));
        });

      resource.update({'id': '3fc358b0-630e-43f2-85f9-69195b346312', 'value': 'test'})
        .then(function (response) {
          expect(response).toBeDefined();
          expect(called).toEqual(false);
          mock.teardown();
          done();
        }, function (error) {
          expect(error).toBeUndefined();
          mock.teardown();
          done();
        });

    });

  });

  describe('permanentDelete', function () {

    it('Should permanently delete all resources inside the passed in array.', function (done) {

      var data, request;

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST api.
      mock.mock('DELETE', api.config.host + '/videos?permanent=1',
        function (request, response) {

          console.log(request);

          // Restore the XHR object.
          mock.teardown();

          return response.status(202);

        });

      // Mock request data.
      data = [
        {
          'id': '3fc358b0-630e-43f2-85f9-69195b346312'
        }
      ];

      request = resource.permanentDelete(data, true).then(function (response) {

        expect(response).toBeDefined();
        expect(typeof response.headers).toBe('function');
        expect(response.statusCode).toBe(202);
        expect(response.data).toBeFalsy();

        console.log('here', response);

        done();

      }, function (error) {

        console.log('HERE', error);

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

  xdescribe('getThumbnails', function () {

    it('Should fail if an id is not provided.', function (done) {

      var request = resource.getThumbnails().then(function (response) {

        expect(response).toBeUndefined();
        done();

      }, function (error) {

        expect(error).toBeDefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should return a list of thumbnails.', function (done) {

      // Mock the XHR object.
      mock.setup();

      var data = [
        {
          'thumbnail_id':'a7d6da39-5d2e-4ff7-a5a1-b6b5da0ba124',
          'thumbnail_url':'https://play-dev.ingest.io/redspace/065764b6-093c-4c2d-b347-4b37e73320dd/poster01.jpg',
          'thumbnail_type':'system'
        },
        {
          'thumbnail_id':'969620c5-ea68-4b54-bdec-3300242b5eeb',
          'thumbnail_url':'https://play-dev.ingest.io/redspace/065764b6-093c-4c2d-b347-4b37e73320dd/poster02.jpg',
          'thumbnail_type':'system'
        },
        {
          'thumbnail_id':'6f5dbf2f-f9e5-406c-8856-aaf6daa9947e',
          'thumbnail_url':'https://play-dev.ingest.io/redspace/065764b6-093c-4c2d-b347-4b37e73320dd/poster03.jpg',
          'thumbnail_type':'system'
        },
        {
          'thumbnail_id':'5bf0fddc-39dd-4630-913c-2e3582c781ad',
          'thumbnail_url':'https://play-dev.ingest.io/redspace/065764b6-093c-4c2d-b347-4b37e73320dd/poster04.jpg',
          'thumbnail_type':'system'
        }
      ];

      // Mock the response from the REST api.
      mock.mock('GET', api.config.host + '/videos/a-video-id/thumbnails',
        function (request, response) {

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(data));

        });

      var request = resource.getThumbnails('a-video-id').then(function (response) {

        expect(response).toBeDefined();
        expect(response.data.length).toEqual(4);
        done();

      }, function (error) {

        expect(error).toBeUndefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

  });

});
