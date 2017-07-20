'use strict';

var IngestSDK = require('../../src/index');
var mock = require('xhr-mock');

var api = new IngestSDK();
var usersResource;

describe('Ingest API : Resource : Users', function () {

  beforeEach(function () {

    usersResource = new api.usersResource({
      host: api.config.host,
      resource: 'users',
      tokenSource: api.getToken.bind(api),
      currentUser: '/users/me',
      transfer: '/users/<%=oldId%>/transfer/<%=newId%>',
      revoke: '/revoke'
    });
  });

  describe('getCurrentUserInfo', function () {

    it('Should retrieve user information.', function (done) {
      var user, request;

      mock.setup();

      user = {
        'id': 'f118ebd6-87ac-49f5-bb30-b1672e812be3',
        'url': 'https://www.someurl.com',
        'email': 'test.tester@ingest.io',
        'timezone': 'America/Halifax',
        'profile': {
          'name': 'Mr. Testy',
          'title': 'Tester of things'
        }
      };

      // Mock the response from the REST api.
      mock.mock('GET', api.config.host + usersResource.config.currentUser,
        function (request, response) {

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(user));

        });

      request = usersResource.getCurrentUserInfo().then(function (response) {

        expect(response).toBeDefined();
        expect(response.data.id).toEqual(user.id);

        done();

      }, function (error) {

        expect(error).not.toBeDefined();

        done();

      });

      // Ensure a promise is returned.
      expect(request.then).toBeDefined();
    });

  });

  describe('transferUserAuthorship', function () {

    it('Should successfully request for user transfer.', function (done) {

      var ids, request;

      ids = {
        old: 'old-id',
        dest: 'dest-id'
      };

      mock.setup();

      // Mock the response from the REST api.
      mock.mock('PATCH', api.config.host + '/users/old-id/transfer/dest-id',
        function (request, response) {

          // Restore the XHR object.
          mock.teardown();

          return response.status(204);

        });

      request = usersResource.transferUserAuthorship(ids.old, ids.dest)
        .then(function (response) {

          expect(response).toBeDefined();
          expect(response.statusCode).toBe(204);

          done();

        }, function (error) {

          expect(error).not.toBeDefined();

          done();

        });

      // Ensure a promise is returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if oldId is not passed in.', function (done) {

      var request, ids;

      ids = {
        old: undefined,
        dest: 'dest-id'
      };

      var request = usersResource.transferUserAuthorship(ids.old, ids.dest)
        .then(function (response) {

          expect(response).not.toBeDefined();

          done();

        }, function (error) {

          expect(error).toBeDefined();

          done();

        });

      // Ensure a promise is returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if destId is not passed in.', function (done) {

      var request, ids;

      ids = {
        old: 'old-id',
        dest: undefined
      };

      var request = usersResource.transferUserAuthorship(ids.old, ids.dest)
        .then(function (response) {

          expect(response).not.toBeDefined();

          done();

        }, function (error) {

          expect(error).toBeDefined();

          done();

        });

      // Ensure a promise is returned.
      expect(request.then).toBeDefined();

    });

  });

  describe('revokeCurrentUser', function () {

    it('Should revoke the current user.', function (done) {

      var request;

      mock.setup();

      // Mock the response from the REST API.
      mock.mock('DELETE', api.config.host + '/users/me/revoke',
        function (request, response) {

          // Restore the XHR object.
          mock.teardown();

          return response.status(204);

        });

      request = usersResource.revokeCurrentUser().then(function (response) {

        expect(response).toBeDefined();
        expect(response.statusCode).toBe(204);

        done();

      }, function (error) {

        expect(error).not.toBeDefined();

        done();

      });

      // Ensure a promise is returned.
      expect(request.then).toBeDefined();

    });

  });

});
