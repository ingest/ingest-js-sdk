'use strict';

var IngestSDK = require('../../src/index');
var mock = require('xhr-mock');

var api = new IngestSDK();
var networksResource;

describe('Ingest API : Resource : Networks', function () {

  beforeEach(function () {

    networksResource = new api.networksResource({
      host: api.config.host,
      resource: 'networks',
      tokenSource: api.getToken.bind(api)
    });
  });

  describe('linkUser', function () {

    it('Should successfully link a user to the authorized network.', function (done) {

      var networkId, userId, request, network;

      networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';
      userId = 'c33a7fb6-1246-4634-9c02-a29149ee3954';

      network = {
        'network_id': 'fed6e925-dee4-41cc-be4a-479cabc149a5',
        'name': 'Redspace',
        'key': 'redspace',
        'members': [
          {
            'id': 'c33a7fb6-1246-4634-9c02-a29149ee3954',
            'url': 'https://www.someurl.com',
            'email': 'user@domain.com',
            'profile': {
              'display_name': '',
              'title': 'Geek Yo'
            },
            'timezone': 'America/Halifax',
            'deleted_at': null
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
        'network_id': 'fed6e925-dee4-41cc-be4a-479cabc149a5',
        'name': 'Redspace',
        'key': 'redspace',
        'members': []
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
      email = 'user@domain.com';
      name = 'Test Name';

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

    it('Should re-send an invite to the user.', function (done) {

      var networkId, email, name, resend, promise, requestPayload;

      networkId = 'network-uuid';
      email = 'user@domain.com';
      name = 'Network User';
      resend = true;

      mock.setup();

      // Mock the response from the REST API.
      mock.mock('POST', api.config.host + '/networks/network-uuid/invite', function (request, response) {

        // Set the request payload for future evaluation.
        requestPayload = JSON.parse(request._xhr.data);

        // Restore the XHR object.
        mock.teardown();

        return response.status(204);

      });

      promise = networksResource.inviteUser(networkId, email, name, resend).then(function (response) {

        expect(response).toBeDefined();
        expect(response.statusCode).toBe(204);
        expect(requestPayload.resend).toEqual(true);

        done();

      }, function (error) {

        expect(error).not.toBeDefined();
        done();

      });

      // Ensure a promise is returned.
      expect(promise.then).toBeDefined();

    });

    it('Should fail if no `email` is passed in.', function (done) {

      var request, name, networkId;

      networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';
      name = 'Test Name';

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

    it('Should fail if no `name` is passed in.', function (done) {

      var request, email, networkId;

      networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';
      email = 'user@domain.com';

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

    it('Should fail if no `networkId` is passed in.', function (done) {

      var request, email, name;

      name = 'Test Name';
      email = 'user@domain.com';

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

  describe('getSecureKeys', function () {

    it('Should fail if no networkId is specified.', function (done) {

      var request = networksResource.getSecureKeys(null).then(function (response) {

        expect(response).not.toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should retrieve all network secure keys from the specified network.', function (done) {
      var networkId, request;

      networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST api.
      mock.get(api.config.host + '/networks/fed6e925-dee4-41cc-be4a-479cabc149a5/keys',
        function (request, response) {

          var data = [
            {
              'id': '801d46e7-8cc8-4b2c-b064-770a0a046bd8',
              'title': 'Network Secure Key',
              'key': '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0....',
              'created_at': '2014-10-10 11:20:38.022191',
              'updated_at': '2014-10-10 11:20:38.022191',
              'author_id': '7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c',
              'updater_id': '7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c'
            }
          ];

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(data));

        });

      request = networksResource.getSecureKeys(networkId).then(function (response) {

        expect(response).toBeDefined();
        expect(response.data[0].id).toBeDefined();
        expect(response.data[0].title).toBeDefined();
        expect(response.data[0].key).toBeDefined();
        expect(response.data[0].created_at).toBeDefined();
        expect(response.data[0].updated_at).toBeDefined();
        expect(response.data[0].author_id).toBeDefined();
        expect(response.data[0].updater_id).toBeDefined();

        done();

      }, function (error) {

        expect(error).not.toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });
  });

  describe('addSecureKey', function () {

    it('Should fail if no networkId is passed in.', function (done) {

      var keyId, request;

      keyId = '801d46e7-8cc8-4b2c-b064-770a0a046bd8';

      request = networksResource.addSecureKey(null, keyId).then(function (response) {

        expect(response).not.toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if no data is passed in.', function (done) {
      var request, networkId;

      networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';

      request = networksResource.addSecureKey(networkId).then(function (response) {

        expect(response).not.toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if data was passed in but not as an object.', function () {

      var request, networkId;

      networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';

      request = networksResource.addSecureKey(networkId, 'data!').then(function (response) {

        expect(response).not.toBeDefined();

        done();

      }, function () {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should remove the title if it is the wrong type.', function (done) {
      var data, request, networkId;

      networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST api.
      mock.post(api.config.host + '/networks/fed6e925-dee4-41cc-be4a-479cabc149a5/keys',
        function (request, response) {

          var data = {
            'id': '801d46e7-8cc8-4b2c-b064-770a0a046bd8',
            'title': 'Default Key Title',
            'key': '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0....',
            'created_at': '2014-10-10 11:20:38.022191',
            'updated_at': '2014-10-10 11:20:38.022191',
            'author_id': '7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c',
            'updater_id': '7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c'
          };

          // Restore the XHR object.
          mock.teardown();

          return response.status(201)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(data));

        });

      // Mock the request data
      data = {
        title: [{'name': 'Taylor Swift'}],
        key: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0....'
      };

      request = networksResource.addSecureKey(networkId, data).then(function (response) {
        expect(response).toBeDefined();
        expect(response.data.id).toBeDefined();
        expect(response.data.title).toBe('Default Key Title');
        expect(response.data.key).toBeDefined();
        expect(response.data.created_at).toBeDefined();
        expect(response.data.updated_at).toBeDefined();
        expect(response.data.author_id).toBeDefined();
        expect(response.data.updater_id).toBeDefined();

        done();

      }, function (error) {

        expect(error).not.toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

    it('Should fail if the supplied key is not a string.', function (done) {

      var data, request, networkId;

      networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';

      data = {
        title: 'This is a secure key.',
        key: []
      };

      request = networksResource.addSecureKey(networkId, data).then(function (response) {

        expect(response).not.toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

    it('Should add a secure key entry when given valid parameters.', function (done) {
      var data, request, networkId;

      networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST api.
      mock.post(api.config.host + '/networks/fed6e925-dee4-41cc-be4a-479cabc149a5/keys',
        function (request, response) {

          var data = {
            'id': '801d46e7-8cc8-4b2c-b064-770a0a046bd8',
            'title': 'My secure key entry.',
            'key': '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0....',
            'created_at': '2014-10-10 11:20:38.022191',
            'updated_at': '2014-10-10 11:20:38.022191',
            'author_id': '7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c',
            'updater_id': '7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c'
          };

          // Restore the XHR object.
          mock.teardown();

          return response.status(201)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(data));

        });

      // Mock the request data
      data = {
        title: 'My secure key entry.',
        key: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0....'
      };

      request = networksResource.addSecureKey(networkId, data).then(function (response) {

        expect(response).toBeDefined();
        expect(response.data.id).toBeDefined();
        expect(response.data.title).toBe('My secure key entry.');
        expect(response.data.key).toBeDefined();
        expect(response.data.created_at).toBeDefined();
        expect(response.data.updated_at).toBeDefined();
        expect(response.data.author_id).toBeDefined();
        expect(response.data.updater_id).toBeDefined();

        done();

      }, function (error) {

        expect(error).not.toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });
  });

  describe('getSecureKeyById', function () {

    it('Should fail if no networkId is supplied.', function (done) {

      var request, keyId;

      keyId = '801d46e7-8cc8-4b2c-b064-770a0a046bd8';

      request = networksResource.getSecureKeyById(null, keyId).then(function (response) {

        expect(response).not.toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if no keyId is supplied.', function (done) {

      var request, networkId;

      networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';

      request = networksResource.getSecureKeyById(networkId, null).then(function (response) {

        expect(response).not.toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if the keyId supplied is not a string.', function (done) {

      var networkId, keyId, request;

      networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';
      keyId = ['Totally not a string.'];

      request = networksResource.getSecureKeyById(networkId, keyId).then(function (response) {

        expect(response).not.toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

    it('Should retrieve a secure key entry when given valid parameters.', function (done) {
      var request, keyId, networkId;

      networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';
      keyId = '801d46e7-8cc8-4b2c-b064-770a0a046bd8';

      // Mock the XHR object
      mock.setup();

      // Mock the response from the REST api.
      mock.get(api.config.host + '/networks/' + networkId + '/keys/' + keyId,
        function (request, response) {

          var data = {
            'id': keyId,
            'title': 'Secure Key Entry #1',
            'key': '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0....',
            'created_at': '2014-10-10 11:20:38.022191',
            'updated_at': '2014-10-10 11:20:38.022191',
            'author_id': '7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c',
            'updater_id': '7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c'
          };

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(data));

        });

      request = networksResource.getSecureKeyById(networkId, keyId).then(function (response) {

        expect(response).toBeDefined();
        expect(response.data.id).toBe(keyId);
        expect(response.data.title).toBeDefined();
        expect(response.data.key).toBeDefined();
        expect(response.data.created_at).toBeDefined();
        expect(response.data.updated_at).toBeDefined();
        expect(response.data.author_id).toBeDefined();
        expect(response.data.updater_id).toBeDefined();

        done();

      }, function (error) {

        expect(error).not.toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });
  });

  describe('updateSecureKey', function () {
    it('Should fail if no networkId is supplied.', function (done) {

      var request, keyId;

      keyId = '801d46e7-8cc8-4b2c-b064-770a0a046bd8';

      request = networksResource.updateSecureKey(null, keyId).then(function (response) {

        expect(response).not.toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if no data is supplied.', function (done) {

      var request, networkId;

      networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';

      request = networksResource.updateSecureKey(networkId, undefined).then(function (response) {

        expect(response).not.toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if the data supplied is not an object.', function (done) {

      var data, request, networkId;

      networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';
      data = 'Totally not an object.';

      request = networksResource.updateSecureKey(networkId, data).then(function (response) {

        expect(response).not.toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if the given data.id is not a string.', function (done) {

      var data, request, networkId;

      networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';
      data = {
        id: ['Totally not a string']
      };

      request = networksResource.updateSecureKey(networkId, data).then(function (response) {

        expect(response).not.toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should remove the given title if it is not a string.', function (done) {

      var data, keyId, networkId, request;

      networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';
      keyId = '801d46e7-8cc8-4b2c-b064-770a0a046bd8';

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST api.
      mock.mock('PATCH', api.config.host + '/networks/' + networkId + '/keys/' + keyId,
        function (request, response) {

          var data = {
            'id': keyId,
            'title': 'Default Key Title',
            'key': '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0....',
            'created_at': '2014-10-10 11:20:38.022191',
            'updated_at': '2014-10-10 11:20:38.022191',
            'author_id': '7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c',
            'updater_id': '7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c'
          };

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(data));

        });

      // Mock request data.
      data = {
        id: keyId,
        title: ['Totally not a string.']
      };

      request = networksResource.updateSecureKey(networkId, data).then(function (response) {

        expect(response).toBeDefined();
        expect(response.data.id).toBeDefined();
        expect(response.data.title).toBe('Default Key Title');
        expect(response.data.key).toBeDefined();
        expect(response.data.created_at).toBeDefined();
        expect(response.data.updated_at).toBeDefined();
        expect(response.data.author_id).toBeDefined();
        expect(response.data.updater_id).toBeDefined();

        done();

      }, function (error) {

        expect(error).not.toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

    it('Should update the secure key entry under normal conditions.', function (done) {

      var data, keyId, networkId, request;

      networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';
      keyId = '801d46e7-8cc8-4b2c-b064-770a0a046bd8';

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST api.
      mock.mock('PATCH', api.config.host + '/networks/' + networkId + '/keys/' + keyId,
        function (request, response) {

          var data = {
            'id': keyId,
            'title': 'This is a new key.',
            'key': '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0....',
            'created_at': '2014-10-10 11:20:38.022191',
            'updated_at': '2014-10-10 11:20:38.022191',
            'author_id': '7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c',
            'updater_id': '7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c'
          };

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(data));

        });

      // Mock request data.
      data = {
        id: keyId,
        title: 'This is a new key.'
      };

      request = networksResource.updateSecureKey(networkId, data).then(function (response) {

        expect(response).toBeDefined();
        expect(response.data.id).toBeDefined();
        expect(response.data.title).toBe('This is a new key.');
        expect(response.data.key).toBeDefined();
        expect(response.data.created_at).toBeDefined();
        expect(response.data.updated_at).toBeDefined();
        expect(response.data.author_id).toBeDefined();
        expect(response.data.updater_id).toBeDefined();

        done();

      }, function (error) {

        expect(error).not.toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });
  });

  describe('deleteSecureKey', function () {

    it('Should fail if no networkId is given.', function (done) {

      var request, keyId;

      keyId = '801d46e7-8cc8-4b2c-b064-770a0a046bd8';

      request = networksResource.deleteSecureKey(null, keyId).then(function (response) {

        expect(response).not.toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if no keyId is given.', function (done) {

      var request, networkId;

      networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';

      request = networksResource.deleteSecureKey(networkId, null).then(function (response) {

        expect(response).not.toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if the keyId given is not a string.', function (done) {

      var request, keyId, networkId;

      networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';
      keyId = ['Totally not a string.'];

      request = networksResource.deleteSecureKey(networkId, keyId).then(function (response) {

        expect(response).not.toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned;
      expect(request.then).toBeDefined();

    });

    it('Should delete the secure key entry when given proper parameters.', function (done) {

      var request, keyId, networkId;

      networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';
      keyId = '801d46e7-8cc8-4b2c-b064-770a0a046bd8';

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST api.
      mock.mock('DELETE', api.config.host + '/networks/' + networkId + '/keys/' + keyId,
        function (request, response) {

          // Restore the XHR object.
          mock.teardown();

          return response.status(204);

        });

      // Make the request.
      request = networksResource.deleteSecureKey(networkId, keyId).then(function (response) {

        expect(response).toBeDefined();

        // Should be no response body on a 204 Accepted.
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

  describe('createCustomer', function () {

    it('Should fail if the given parameters are not the correct types.', function (done) {

      var networkId = null;   // Not a string.
      var stripeToken = null; // Not a string.

      networksResource.createCustomer(stripeToken, networkId).then(function (response) {

        expect(response).not.toBeDefined();
        done();

      }, function (error) {

        expect(error).toBeDefined();
        expect(error).toMatch(/createCustomer requires stripeToken and networkId to be strings/);
        done();

      });

    });

    it('Should successfully create a Stripe customer for the given network.', function (done) {

      var networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';

      var requestData = {
        'stripeToken': 'tok_notarealtoken'
      };

      var responseData = {
        'networkID': networkId,
        'networkName': 'Redspace',
        'stripeCustomerID': 'cus_abcdefghijklmnopqrstuvwxyz'
      };

      var request;

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST API.
      mock.mock('POST', api.config.host + '/networks/fed6e925-dee4-41cc-be4a-479cabc149a5/customers',
        function (request, response) {
          // Restore the XHR object.
          mock.teardown();

          return response.status(204)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(responseData));
        });

      request = networksResource.createCustomer(requestData.stripeToken, networkId)
        .then(function (response) {

          expect(response).toBeDefined();
          expect(response.data).toBeDefined();
          expect(typeof response.headers).toBe('function');
          expect(response.statusCode).toEqual(204);

          done();

        }, function (error) {

          expect(error).not.toBeDefined();
          done();

        });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

  });

  describe('updateCustomer', function () {

    it('Should fail if networkId was not passed in as a string.', function (done) {

      var networkId = null;
      var cusId = 'cus_abcdefghijklmnopqrstuvwxyz';

      var promise = networksResource.updateCustomer(networkId, cusId).then(function (response) {

        expect(response).not.toBeDefined();
        done();

      }, function (error) {

        expect(error).toMatch(/requires `networkId` and `cusID` to be a string/);
        done();

      });

      // Ensure a promise was returned.
      expect(promise.then).toBeDefined();

    });

    it('Should fail if cusId was not passed in.', function (done) {

      var networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';
      var cusId = null;

      var promise = networksResource.updateCustomer(networkId, cusId).then(function (response) {

        expect(response).not.toBeDefined();
        done();

      }, function (error) {

        expect(error).toMatch(/requires `networkId` and `cusID` to be a string/);
        done();

      });

      // Ensure a promise was returned.
      expect(promise.then).toBeDefined();

    });

    it('Should fail if networkName and stripeToken were not given.', function (done) {

      var networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';
      var cusId = 'cus_abcdefghijklmnopqrstuvwxyz';

      var networkName = null;
      var stripeToken = null;

      var promise = networksResource.updateCustomer(networkId, cusId, networkName, stripeToken)
        .then(function (response) {

          expect(response).not.toBeDefined();
          done();

        }, function (error) {

          expect(error).toMatch(/either networkName or stripeToken passed as a string./);
          done();

        });

      // Ensure a promise was returned.
      expect(promise.then).toBeDefined();

    });

    it('Should successfully update the given customer network name and payment details.', function (done) {

      var networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';
      var cusId = 'cus_abcdefghijklmnopqrstuvwxyz';
      var networkName = 'My re-named network';
      var stripeToken = 'tok_notarealtoken';

      var responseData = {
        'networkID': networkId,
        'networkName': networkName,
        'stripeCustomerID': cusId
      };

      var request, url;

      // Mock the XHR object.
      mock.setup();

      url = api.config.host + '/networks/' + networkId + '/customers/' + cusId;

      // Mock the response from the REST API.
      mock.mock('PATCH', url, function (request, response) {
        // Restore the XHR object.
        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify(responseData));
      });

      request = networksResource.updateCustomer(networkId, cusId, networkName, stripeToken)
        .then(function (response) {

          expect(response).toBeDefined();
          expect(response.data).toBeDefined();
          expect(typeof response.headers).toBe('function');
          expect(response.statusCode).toEqual(200);

          expect(response.data.networkName).toEqual(networkName);

          done();

        }, function (error) {

          expect(error).not.toBeDefined();
          done();

        });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

  });

  describe('deleteCustomer', function () {

    describe('Should fail if one of the parameters are missing', function () {

      var testCases = [{
        'name': 'missing networkId',
        'args': [null, 'cus_abcdefghijklmnopqrstuvwxyz']
      }, {
        'name': 'missing cusId',
        'args': ['fed6e925-dee4-41cc-be4a-479cabc149a5', null]
      }];

      var testCasesLength = testCases.length;
      var i = 0;
      var testCase = null;

      for (i = 0; i < testCasesLength; i++) {
        testCase = testCases[i];

        it('Should fail if the function is ' + testCase.name, function (done) {
          var promise = networksResource.deleteCustomer.apply(networksResource, testCase.args)
            .then(function (response) {

              expect(response).not.toBeDefined();
              done();

            }, function (error) {

              expect(error).toMatch(/requires `networkId` and `cusId` to be strings./);
              done();

            });

          // Ensure a promise was returned.
          expect(promise.then).toBeDefined();
        });
      }
    });

    it('Should successfully delete the given customer for the given network.', function (done) {

      var networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';
      var cusId = 'cus_abcdefghijklmnopqrstuvwxyz';

      var request, url;

      // Mock the XHR object.
      mock.setup();

      url = api.config.host + '/networks/' + networkId + '/customers/' + cusId;

      // Mock the response from the REST API.
      mock.mock('DELETE', url, function (request, response) {
        // Restore the XHR object.
        mock.teardown();

        return response.status(202)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify(response));
      });

      request = networksResource.deleteCustomer(networkId, cusId)
        .then(function (response) {

          expect(response).toBeDefined();
          expect(response.data).toBeDefined();
          expect(typeof response.headers).toBe('function');
          expect(response.statusCode).toEqual(202);

          done();

        }, function (error) {

          expect(error).not.toBeDefined();
          done();

        });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

  });

  describe('getCustomerCardInformation', function () {

    it('Should fail if networkId was not passed in as a string.', function (done) {

      var networkId = null;
      var cusId = 'cus_abcdefghijklmnopqrstuvwxyz';

      var promise = networksResource.getCustomerCardInformation(networkId, cusId).then(function (response) {

        expect(response).not.toBeDefined();
        done();

      }, function (error) {

        expect(error).toMatch(/requires networkId and customerId to be strings/);
        done();

      });

      // Ensure a promise was returned.
      expect(promise.then).toBeDefined();

    });

    it('Should fail if cusId was not passed in.', function (done) {

      var networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';
      var cusId = null;

      var promise = networksResource.getCustomerCardInformation(networkId, cusId).then(function (response) {

        expect(response).not.toBeDefined();
        done();

      }, function (error) {

        expect(error).toMatch(/requires networkId and customerId to be strings/);
        done();

      });

      // Ensure a promise was returned.
      expect(promise.then).toBeDefined();

    });

    it('Should successfully return the customers payment details.', function (done) {

      var networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';
      var cusId = 'cus_abcdefghijklmnopqrstuvwxyz';

      var responseData = {
        'brand': 'Visa',
        'last4': '1234',
        'type': 'card'
      };

      var request, url;

      // Mock the XHR object.
      mock.setup();

      url = api.config.host + '/networks/' + networkId + '/customers/' + cusId + '/card';

      // Mock the response from the REST API.
      mock.mock('GET', url, function (request, response) {
        // Restore the XHR object.
        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify(responseData));
      });

      request = networksResource.getCustomerCardInformation(networkId, cusId)
        .then(function (response) {

          expect(response).toBeDefined();
          expect(response.data).toBeDefined();
          expect(typeof response.headers).toBe('function');
          expect(response.statusCode).toEqual(200);

          expect(response.data.brand).toEqual('Visa');
          expect(response.data.last4).toEqual('1234')
          expect(response.data.type).toEqual('card');

          done();

        }, function (error) {

          expect(error).not.toBeDefined();
          done();

        });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });
  });

  describe('deleteCustomerCard', function () {

    it('Should fail if networkId was not passed in as a string.', function (done) {

      var networkId = null;
      var cusId = 'cus_abcdefghijklmnopqrstuvwxyz';

      var promise = networksResource.deleteCustomerCard(networkId, cusId).then(function (response) {

        expect(response).not.toBeDefined();
        done();

      }, function (error) {

        expect(error).toMatch(/requires networkId and customerId to be strings/);
        done();

      });

      // Ensure a promise was returned.
      expect(promise.then).toBeDefined();

    });

    it('Should fail if cusId was not passed in.', function (done) {

      var networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';
      var cusId = null;

      var promise = networksResource.deleteCustomerCard(networkId, cusId).then(function (response) {

        expect(response).not.toBeDefined();
        done();

      }, function (error) {

        expect(error).toMatch(/requires networkId and customerId to be strings/);
        done();

      });

      // Ensure a promise was returned.
      expect(promise.then).toBeDefined();

    });

    it('Should successfully remove the customers payment method.', function (done) {

      var networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';
      var cusId = 'cus_abcdefghijklmnopqrstuvwxyz';
      var request, url;

      // Mock the XHR object.
      mock.setup();

      url = api.config.host + '/networks/' + networkId + '/customers/' + cusId + '/card';

      // Mock the response from the REST API.
      mock.mock('DELETE', url, function (request, response) {
        // Restore the XHR object.
        mock.teardown();

        return response.status(204)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify({}));
      });

      request = networksResource.deleteCustomerCard(networkId, cusId)
        .then(function (response) {

          expect(response).toBeDefined();
          expect(typeof response.headers).toBe('function');
          expect(response.statusCode).toEqual(204);
          done();

        }, function (error) {
          expect(error).not.toBeDefined();
          done();
        });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });
  });

  describe('getInvoices', function () {
    it('Should fail if networkId was not passed in as a string.', function (done) {

      var networkId = null;

      var promise = networksResource.getInvoices(networkId).then(function (response) {

        expect(response).not.toBeDefined();
        done();

      }, function (error) {

        expect(error).toMatch(/requires networkId to be a string/);
        done();

      });

      // Ensure a promise was returned.
      expect(promise.then).toBeDefined();

    });

    it('Should successfully return the networks invoices.', function (done) {

      var networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';
      var cusId = 'cus_abcdefghijklmnopqrstuvwxyz';

      var responseData = {}

      var request, url;

      // Mock the XHR object.
      mock.setup();

      url = api.config.host + '/networks/' + networkId + '/invoices';

      // Mock the response from the REST API.
      mock.mock('GET', url, function (request, response) {
        // Restore the XHR object.
        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify(responseData));
      });

      request = networksResource.getInvoices(networkId)
        .then(function (response) {

          expect(response).toBeDefined();
          expect(response.data).toBeDefined();
          expect(typeof response.headers).toBe('function');
          expect(response.statusCode).toEqual(200);

          done();

        }, function (error) {

          expect(error).not.toBeDefined();
          done();

        });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });
  });

  describe('getInvoiceById', function () {
    it('Should fail if networkId was not passed in as a string.', function (done) {

      var networkId = null;
      var invoiceId = 'abcdefghijklmnopqrstuvwxyz';

      var promise = networksResource.getInvoiceById(networkId, invoiceId).then(function (response) {

        expect(response).not.toBeDefined();
        done();

      }, function (error) {

        expect(error).toMatch(/requires networkId to be passed as a string/);
        done();

      });

      // Ensure a promise was returned.
      expect(promise.then).toBeDefined();

    });

    it('Should fail if invoiceId was not passed in as a string.', function (done) {

      var networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';
      var invoiceId = null;

      var promise = networksResource.getInvoiceById(networkId, invoiceId).then(function (response) {

        expect(response).not.toBeDefined();
        done();

      }, function (error) {

        expect(error).toMatch(/requires invoiceId to be passed as a string/);
        done();

      });

      // Ensure a promise was returned.
      expect(promise.then).toBeDefined();

    });

    it('Should successfully return the invoice requested.', function (done) {

      var networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';
      var invoiceId = 'abcdefghijklmnopqrstuvwxyz';

      var responseData = {}

      var request, url;

      // Mock the XHR object.
      mock.setup();

      url = api.config.host + '/networks/' + networkId + '/invoices/' + invoiceId;

      // Mock the response from the REST API.
      mock.mock('GET', url, function (request, response) {
        // Restore the XHR object.
        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify(responseData));
      });

      request = networksResource.getInvoiceById(networkId, invoiceId)
        .then(function (response) {

          expect(response).toBeDefined();
          expect(response.data).toBeDefined();
          expect(typeof response.headers).toBe('function');
          expect(response.statusCode).toEqual(200);

          done();

        }, function (error) {

          expect(error).not.toBeDefined();
          done();

        });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });
  });

  describe('getCurrentUsage', function () {
    it('Should fail if networkId was not passed in as a string.', function (done) {

      var networkId = null;
      var promise = networksResource.getCurrentUsage(networkId).then(function (response) {

        expect(response).not.toBeDefined();
        done();

      }, function (error) {

        expect(error).toMatch(/requires networkId to be passed as a string/);
        done();

      });

      // Ensure a promise was returned.
      expect(promise.then).toBeDefined();

    });

    it('Should successfully return the current usage requested.', function (done) {

      var networkId = 'fed6e925-dee4-41cc-be4a-479cabc149a5';
      var responseData = {};
      var request, url;

      // Mock the XHR object.
      mock.setup();

      url = api.config.host + '/networks/' + networkId + '/invoices?currentUsage=true';

      // Mock the response from the REST API.
      mock.mock('GET', url, function (request, response) {
        // Restore the XHR object.
        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify(responseData));
      });

      request = networksResource.getCurrentUsage(networkId)
        .then(function (response) {

          expect(response).toBeDefined();
          expect(response.data).toBeDefined();
          expect(typeof response.headers).toBe('function');
          expect(response.statusCode).toEqual(200);

          done();

        }, function (error) {

          expect(error).not.toBeDefined();
          done();

        });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });
  });

  describe('getPendingUsers', function () {

    it('Should fail if networkId was not passed as a string.', function (done) {

      var networkId, promise;

      networkId = null;

      promise = networksResource.getPendingUsers(networkId).then(function (response) {

        expect(response).not.toBeDefined();
        done();

      }, function (error) {

        expect(error).toMatch(/requires networkId to be passed as a string/);
        done();

      });

      // Ensure a promise was returned.
      expect(promise.then).toBeDefined();

    });

    it('Should successfully retrieve a list of pending users.', function (done) {

      var network, promise, url;

      network = {
        network_id: 'network-uuid',
        pending_members: []
      };

      // Mock the XHR object.
      mock.setup();

      url = api.config.host + '/networks/' + network.network_id + '?filter=pending';

      // Mock the response from the REST API.
      mock.mock('GET', url, function (request, response) {

        // Restore the XHR object.
        mock.teardown();

        return response
          .status(200)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify(network));
      });

      promise = networksResource.getPendingUsers(network.network_id).then(function (response) {

        expect(response).toBeDefined();
        expect(response.data).toEqual(network);
        expect(typeof response.headers).toBe('function');
        expect(response.statusCode).toBe(200);

        done();

      }, function (error) {

        expect(error).not.toBeDefined();
        done();

      });

      // Ensure a promise was returned.
      expect(promise.then).toBeDefined();

    });

  });

  describe('deletePendingUser', function () {

    it('Should fail if networkId was not passed in as a string.', function (done) {

      var networkId, pendingUserId, promise;

      networkId = null;
      pendingUserId = 'pending-user-uuid';

      promise = networksResource.deletePendingUser(networkId, pendingUserId).then(function (response) {

        expect(response).not.toBeDefined();
        done();

      }, function (error) {

        expect(error).toMatch(/requires networkId and pendingUserId to be passed as strings/);
        done();

      });

      // Ensure a promise was returned.
      expect(promise.then).toBeDefined();

    });

    it('Should fail if pendingUserId was not passed in as a string.', function (done) {

      var networkId, pendingUserId, promise;

      networkId = 'network-uuid';
      pendingUserId = null;

      promise = networksResource.deletePendingUser(networkId, pendingUserId).then(function (response) {

        expect(response).not.toBeDefined();
        done();

      }, function (error) {

        expect(error).toMatch(/requires networkId and pendingUserId to be passed as strings/);
        done();

      });

      // Ensure a promise was returned.
      expect(promise.then).toBeDefined();

    });

    it('Should successfully delete the pending user.', function (done) {

      var networkId, pendingUserId, promise, url;

      networkId = 'network-uuid';
      pendingUserId = 'pending-user-uuid';

      // Mock the XHR object.
      mock.setup();

      url = api.config.host + '/networks/' + networkId + '/pending-users/' + pendingUserId;

      // Mock the response from the REST API.
      mock.mock('DELETE', url, function (request, response) {

        // Restore the XHR object.
        mock.teardown();

        return response
          .status(204)
          .header('Content-Type', 'application/json');
      });

      promise = networksResource.deletePendingUser(networkId, pendingUserId).then(function (response) {

        expect(response).toBeDefined();
        expect(typeof response.headers).toBe('function');
        expect(response.statusCode).toBe(204);

        done();

      }, function (error) {

        expect(error).not.toBeDefined();
        done();

      });

      // Ensure a promise was returned.
      expect(promise.then).toBeDefined();

    });

  });


});
