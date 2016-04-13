'use strict';

var access_token = 'Bearer ' + window.token;

var api = new IngestAPI({
  host: 'http://weasley.teamspace.ad:8080',
  token: access_token
});

var mock = require('xhr-mock');
var networksResource;

describe('Ingest API : Resource : Networks', function () {

  beforeEach(function () {

    networksResource = new api.networksResource({
      host: api.config.host,
      resource: 'networks',
      tokenSource: api.getToken.bind(api),
      cache: api.cache,
      invite: '/networks/invite'
    });

    // Re-enable cache each time.
    networksResource.cache.enabled = true;
  });

  describe('linkUser', function () {

    it('Should successfully link a user to the authorized network.', function (done) {

      var networkId, userId, request, network;

      networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';
      userId = 'c33a7fb6-1246-4634-9c02-a29149ee3954';

      network = {
        "network_id": "fed6e925-dee4-41cc-be4a-479cabc149a5",
        "name": "Redspace",
        "key": "redspace",
        "members": [
          {
            "id": "c33a7fb6-1246-4634-9c02-a29149ee3954",
            "url": "http://weasley.teamspace.ad:8080/users/c33a7fb6-1246-4634-9c02-a29149ee3954",
            "email": "THISNEWUSER@redspace.com",
            "profile": {
              "display_name": "",
              "title": "Geek Yo"
            },
            "timezone": "America/Halifax",
            "deleted_at": null
          }
        ]
      };

      mock.setup();

      // Mock the response from the REST api.
      mock.mock('LINK', api.config.host + '/networks/' + networkId, function (request, response) {

        // Restore the XHR object.
        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify(network));

      });

      request = networksResource.linkUser(networkId, userId).then(function (response) {

        expect(response).toBeDefined();
        expect(response.statusCode).toBe(200);

        expect(response.data).toEqual(network);

        done();

      }, function (error) {

        expect(response).not.toBeDefined();

        done();

      });

      // Ensure a promise is returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if no userId is passed in.', function (done) {

      var networkId, request;

      networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';

      request = networksResource.linkUser(networkId, null).then(function (response) {

        expect(response).not.toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise is returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if no networkId is passed in.', function (done) {

      var userId, request;

      userId = 'c33a7fb6-1246-4634-9c02-a29149ee3954';

      request = networksResource.linkUser(null, userId).then(function (response) {

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

  describe('unlinkUser', function () {

    it('Should successfully unlink a user to the authorized network.', function (done) {

      var networkId, userId, request, network;

      networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';
      userId = 'c33a7fb6-1246-4634-9c02-a29149ee3954';

      network = {
        "network_id": "fed6e925-dee4-41cc-be4a-479cabc149a5",
        "name": "Redspace",
        "key": "redspace",
        "members": []
      };

      mock.setup();

      // Mock the response from the REST api.
      mock.mock('UNLINK', api.config.host + '/networks/' + networkId,
        function (request, response) {

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(network));

        });

      request = networksResource.unlinkUser(networkId, userId).then(function (response) {

        expect(response).toBeDefined();
        expect(response.statusCode).toBe(200);

        expect(response.data).toEqual(network);

        done();

      }, function (error) {

        expect(response).not.toBeDefined();

        done();

      });

      // Ensure a promise is returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if no userId is passed in.', function (done) {

      var request, networkId;

      networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';

      request = networksResource.unlinkUser(networkId, null).then(function (response) {

        expect(response).not.toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise is returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if no networkId is passed in.', function (done) {

      var request, userId;

      userId = 'c33a7fb6-1246-4634-9c02-a29149ee3954';

      request = networksResource.unlinkUser(null, userId).then(function (response) {

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

  describe('inviteUser', function () {

    it('Should invite the user.', function (done) {

      var networkId, email, name, request;

      networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';
      email = 'michael.cunningham@redspace.com';
      name = 'Michael Cunningham';

      mock.setup();

      // Mock the response from the REST api.
      mock.mock('POST', api.config.host + '/networks/fed6e925-dee4-41cc-be4a-479cabc149a5/invite',
        function (request, response) {

          // Restore the XHR object.
          mock.teardown();

          return response.status(204);

        });

      request = networksResource.inviteUser(networkId, email, name).then(function (response) {

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

    it('Should fail if no "email" is passed in.', function (done) {

      var request, name, networkId;

      networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';
      name = 'Michael Cunningham';

      request = networksResource.inviteUser(networkId, null, name).then(function (response) {

        expect(response).not.toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise is returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if no "name" is passed in.', function (done) {

      var request, email, networkId;

      networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';
      email = 'michael.cunningham@redspace.com';

      request = networksResource.inviteUser(networkId, email, null).then(function (response) {

        expect(response).not.toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise is returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if no "networkId" is passed in.', function (done) {

      var request, email, name;

      name = 'Michael Cunningham';
      email = 'michael.cunningham@redspace.com';

      request = networksResource.inviteUser(null, email, name).then(function (response) {

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

});
