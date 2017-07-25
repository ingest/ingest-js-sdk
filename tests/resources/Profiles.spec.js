'use strict';

var IngestSDK = require('../../src/index');
var mock = require('xhr-mock');

var api = new IngestSDK();
var profilesResource;

describe('Ingest API : Resource : Profiles', function () {

  beforeEach(function () {
    profilesResource = new api.profilesResource({
      host: api.config.host,
      resource: 'encoding/profiles',
      tokenSource: api.getToken.bind(api)
    });
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
  });
});
