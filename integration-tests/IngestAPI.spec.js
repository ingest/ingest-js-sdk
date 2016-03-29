var api;

var access_token = 'Bearer ' + window.token;

var validVideoId;
var createdVideo;
var nextRange;

var mock = require('xhr-mock');

describe('Ingest API', function () {

  // Reset the auth token.
  beforeEach(function () {
    api = new IngestAPI({
      host: 'http://weasley.teamspace.ad:8080',
      token: access_token
    });
  });

  it('Should exist on the window object.', function () {
    expect(IngestAPI).toBeDefined();
  });

  it('Should expose the required functions.', function () {

    var required = [
      'setToken',
      'getToken',
      'getNetworkSecureKeys',
      'addNetworkSecureKey',
      'getNetworkSecureKeyById',
      'updateNetworkSecureKey',
      'deleteNetworkSecureKeyById',
      'upload'
    ];

    var requiredLength = required.length;
    var i, func;

    for (i = 0; i < requiredLength; i++) {
      func = required[i];
      expect(IngestAPI.prototype[func]).toBeDefined();
    }

  });

  it('Should expose the config object.', function () {
    expect(api.config).toBeDefined();
    expect(api.config.host).toBeDefined();
  });

  it('Should be able to create it without a token.', function () {

    var testAPI;

    try {
      testAPI = new IngestAPI();
    } catch (error) {
      expect(error).toBeUndefined();
    }

    expect(testAPI instanceof IngestAPI).toBe(true);

  });

  it('Should parse the id out of a template string', function () {
    var result = api.utils.parseTokens.call(this, '<%=id%>', {id: 'testid'});
    expect(result).toEqual('testid');
  });

  it('Should override the default config object values.', function () {
    expect(api.config.host).not.toEqual(api.defaults.host);
  });

  it('Should set the auth token.', function () {
    api.setToken('test-token');
    expect(api.token).toBeDefined();
    expect(api.token).toEqual('test-token');
  });

  it('Should return the token.', function () {
    var token = api.getToken(api);
    expect(token).toBeDefined();
    expect(token).toEqual(access_token);
  });

  it('Should return the currently configured token.', function () {

    var token = api.getToken();

    expect(token).toEqual(access_token);

  });

  it('Should throw an error if no token is set.', function () {

    api.token = null;

    try {
      api.getToken();
    } catch (error) {
      expect(error).toBeDefined();
    }

  });

  it('Should fail if there is no token set.', function () {
    expect(api.setToken).toThrow();
  });

  it('Should return access to the responseHeaders.', function (done) {
    var request = api.videos.getAll().then(function (response) {

      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      expect(response.headers).toBeDefined();
      expect(typeof response.headers).toBe('function');
      expect(response.statusCode).toBeDefined();

      // Validate that we can retrieve the response headers.
      expect(response.headers('Content-type').indexOf('json')).not.toBe(-1);

      done();
    }, function (error) {

      expect(error).toBeUndefined();

      done();
    });

    // Ensure a promise was returned.
    expect(request.then).toBeDefined();

  });

  it('Should return http status code.', function (done) {
    var request = api.videos.getAll().then(function (response) {

      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      expect(response.headers).toBeDefined();
      expect(typeof response.headers).toBe('function');
      expect(response.statusCode).toBeDefined();

      // Validate that we can retrive the response status code.
      expect(response.statusCode).toBe(200);

      done();
    }, function (error) {

      expect(error).toBeUndefined();

      done();
    });

    // Ensure a promise was returned.
    expect(request.then).toBeDefined();

  });

  describe('getNetworkSecureKeys', function () {

    it('Should retrieve all network secure keys from the current network.', function (done) {
      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST api.
      mock.get(api.config.host + api.config.networksKeys,
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

      var request = api.getNetworkSecureKeys().then(function (response) {

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

        expect(error).toBeUndefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });
  });

  describe('addNetworkSecureKey', function () {
    it('Should fail if no data is passed in', function (done) {

      var request = api.addNetworkSecureKey().then(function (response) {

        expect(response).toBeUndefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if data was passed in but not as an object', function () {

      var request = api.addNetworkSecureKey('data!').then(function (response) {

        expect(response).toBeUndefined();

        done();

      }, function () {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should remove the title if it is the wrong type.', function (done) {
      var data, request;

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST api.
      mock.post(api.config.host + api.config.networksKeys,
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

      request = api.addNetworkSecureKey(data).then(function (response) {

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

        expect(error).toBeUndefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

    it('Should fail if the supplied key is not a string.', function (done) {

      var data, request;

      data = {
        title: 'This is a secure key.',
        key: []
      };

      request = api.addNetworkSecureKey(data).then(function (response) {

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

  describe('getNetworkSecureKeyById', function () {
    it('Should fail if no id is supplied.', function (done) {

      var request = api.getNetworkSecureKeyById(null).then(function (response) {

        expect(response).toBeUndefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if the id supplied is not a string.', function (done) {

      var id, request;

      id = ['Totally not a string.'];

      request = api.getNetworkSecureKeyById(id).then(function (response) {

        expect(response).toBeUndefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

    it('Should retrieve a valid network secure key entry when given a valid ID', function (done) {
      var request, id;

      id = '801d46e7-8cc8-4b2c-b064-770a0a046bd8';

      // Mock the XHR object
      mock.setup();

      // Mock the response from the REST api.
      mock.get(api.config.host + api.config.networksKeys + '/' + id,
        function (request, response) {

          var data = {
            'id': id,
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

      request = api.getNetworkSecureKeyById(id).then(function (response) {

        expect(response).toBeDefined();
        expect(response.data.id).toBe(id);
        expect(response.data.title).toBeDefined();
        expect(response.data.key).toBeDefined();
        expect(response.data.created_at).toBeDefined();
        expect(response.data.updated_at).toBeDefined();
        expect(response.data.author_id).toBeDefined();
        expect(response.data.updater_id).toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeUndefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });
  });

  describe('updateNetworkSecureKey', function () {
    it('Should fail if no data is supplied.', function (done) {

      var request = api.updateNetworkSecureKey().then(function (response) {

        expect(response).toBeUndefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if the data supplied is not an object.', function (done) {

      var data, request;

      data = 'Totally not an object.';

      request = api.updateNetworkSecureKey(data).then(function (response) {

        expect(response).toBeUndefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if the given ID is not a string.', function (done) {

      var data, request;

      data = {
        id: ['Totally not a string']
      };

      request = api.updateNetworkSecureKey(data).then(function (response) {

        expect(response).toBeUndefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should remove the given title if it is not a string.', function (done) {

      var data, id, request;

      id = '801d46e7-8cc8-4b2c-b064-770a0a046bd8';

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST api.
      mock.mock('PATCH', api.config.host + api.config.networksKeys + '/' + id,
        function (request, response) {

          var data = {
            'id': id,
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
        id: id,
        title: ['Totally not a string.']
      };

      request = api.updateNetworkSecureKey(data).then(function (response) {

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

        expect(error).toBeUndefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

    it('Should update the secure key entry under normal conditions.', function (done) {

      var data, id, request;

      id = '801d46e7-8cc8-4b2c-b064-770a0a046bd8';

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST api.
      mock.mock('PATCH', api.config.host + api.config.networksKeys + '/' + id,
        function (request, response) {

          var data = {
            'id': id,
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
        id: id,
        title: 'This is a new key.'
      };

      request = api.updateNetworkSecureKey(data).then(function (response) {

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

        expect(error).toBeUndefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });
  });

  describe('deleteNetworkSecureKeyById', function () {
    it('Should fail if no id is given.', function (done) {

      var request = api.deleteNetworkSecureKeyById(null).then(function (response) {

        expect(response).toBeUndefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if the id given is not a string.', function (done) {

      var request, id;

      id = ['Totally not a string.'];

      request = api.deleteNetworkSecureKeyById(id).then(function (response) {

        expect(response).toBeUndefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned;
      expect(request.then).toBeDefined();

    });

    it('Should delete the secure key entry when given a proper ID.', function (done) {

      var request, id;

      id = '801d46e7-8cc8-4b2c-b064-770a0a046bd8';

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST api.
      mock.mock('DELETE', api.config.host + api.config.networksKeys + '/' + id,
        function (request, response) {

          // Restore the XHR object.
          mock.teardown();

          return response.status(204);

        });

      // Make the request.
      request = api.deleteNetworkSecureKeyById(id).then(function (response) {

        expect(response).toBeDefined();

        // Should be no response body on a 204 Accepted.
        expect(response.data).toBeFalsy();

        done();

      }, function (error) {

        expect(error).toBeUndefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });
  });

  describe('upload', function () {
    it('Should return an upload object', function () {

      var file = new File([""], "testfile");

      var upload = api.upload(file);

      var instanceCheck = upload instanceof api.uploader;

      expect(instanceCheck).toEqual(true);

    });
  });

});
