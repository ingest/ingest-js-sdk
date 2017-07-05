'use strict';

var IngestAPI = require('../../src/index');

'use strict';

var access_token = 'Bearer ' + window.token;

var api = new IngestAPI({
  host: 'http://weasley.teamspace.ad:8080',
  token: access_token
});

var mock = require('xhr-mock');
var profilesResource;

describe('Ingest API : Resource : Profiles', function () {

  beforeEach(function () {
    profilesResource = new api.profilesResource({
      host: api.config.host,
      resource: 'encoding/profiles',
      tokenSource: api.getToken.bind(api),
      cache: api.cache
    });

    // Re-enable cache each time.
    profilesResource.cache.enabled = true;
  });

  describe('update', function () {

    it('Should fail if no resource are passed in.', function (done) {

      var request = profilesResource.update().then(function (response) {

        expect(response).toBeUndefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should update a profile record.', function (done) {

      var profile = {
        id: 'test-profile'
      };

      // Mock the XHR object
      mock.setup();

      mock.mock('PUT', api.config.host + '/encoding/profiles/test-profile',
        function (request, response) {

          var _profile = JSON.stringify(profile);

          // Restore the XHR Object
          mock.teardown();

          expect(_profile).toEqual(request._body);

          return response.status(200)
            .header('Content-Type', 'application/json')
            .header('Content-Length', 1)
            .body(_profile);

        });

      var request = profilesResource.update(profile).then(function (response) {

        expect(response).toBeDefined();
        expect(response.data.id).toEqual('test-profile');
        done();

      }, function (error) {

        expect(error).toBeUndefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail to update a profile if something other than an object is passed',
      function (done) {

        var request = profilesResource.update('profile').then(function (response) {

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
        'title': 'my profile'
      };

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST api.
      mock.mock('PUT', api.config.host + '/encoding/profiles/3fc358b0-630e-43f2-85f9-69195b346312',
        function (request, response) {

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .header('Content-Length', 1)
            .body(JSON.stringify(data));

        });

      request = profilesResource.update(data).then(function (response) {

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

    it('Should return the cached object if there were no changes detected.', function (done) {

      var called = false;

      // Mock the retrieve and return a different cached value for the first test object.
      spyOn(api.cache, 'retrieve').and.returnValue({
        'id': '3fc358b0-630e-43f2-85f9-69195b346312',
        'value': 'test'
      });

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST api.
      mock.mock('PUT', api.config.host + '/encoding/profiles/3fc358b0-630e-43f2-85f9-69195b346312',
        function (request, response) {
          called = true;
          return response.status(200)
            .header('Content-Type', 'application/json')
            .header('Content-Length', 1)
            .body(JSON.stringify(data));
        });

      profilesResource.update({'id': '3fc358b0-630e-43f2-85f9-69195b346312', 'value': 'test'})
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

});
