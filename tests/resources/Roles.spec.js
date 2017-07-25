'use strict';

var IngestSDK = require('../../src/index');
var mock = require('xhr-mock');

var api = new IngestSDK();
var rolesResource;

describe('Ingest API : Resource : Roles', function () {

  beforeEach(function () {
    rolesResource = new api.rolesResource({
      host: api.config.host,
      resource: 'roles',
      tokenSource: api.getToken.bind(api),
    });

  });

  describe('update', function () {

    it('Should fail if no resource are passed in.', function (done) {

      var request = rolesResource.update().then(function (response) {

        expect(response).toBeUndefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should update a role record.', function (done) {

      var role = {
        id: 'test-role'
      };

      // Mock the XHR object
      mock.setup();

      mock.mock('PUT', api.config.host + '/roles/test-role',
        function (request, response) {

          var _role = JSON.stringify(role);

          // Restore the XHR Object
          mock.teardown();

          expect(_role).toEqual(request._body);

          return response.status(200)
            .header('Content-Type', 'application/json')
            .header('Content-Length', 1)
            .body(_role);

        });

      var request = rolesResource.update(role).then(function (response) {

        expect(response).toBeDefined();
        expect(response.data.id).toEqual('test-role');
        done();

      }, function (error) {

        expect(error).toBeUndefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail to update a role if something other than an object is passed',
      function (done) {

        var request = rolesResource.update('role').then(function (response) {

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
