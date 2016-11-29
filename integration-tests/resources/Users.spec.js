'use strict';

var access_token = 'Bearer ' + window.token;

var api = new IngestAPI({
  host: 'http://weasley.teamspace.ad:8080',
  token: access_token
});

var mock = require('xhr-mock');
var usersResource;

describe('Ingest API : Resource : Users', function () {

  beforeEach(function () {

    usersResource = new api.usersResource({
      host: api.config.host,
      resource: 'users',
      tokenSource: api.getToken.bind(api),
      cache: api.cache,
      currentUser: '/users/me',
      transfer: '/users/<%=oldId%>/transfer/<%=newId%>',
      revoke: '/revoke'
    });

    // Re-enable cache each time.
    usersResource.cache.enabled = true;
  });

  describe('getCurrentUserInfo', function () {

    it('Should retrieve user information.', function (done) {
      var user, request;

      mock.setup();

      user = {
        'id': 'f118ebd6-87ac-49f5-bb30-b1672e812be3',
        'url': 'http://weasley.teamspace.ad:8080/users/07f6de51-4e2b-4d8e-9eac-79cbd5f6825f',
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
            .header('Content-Length', 1)
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
