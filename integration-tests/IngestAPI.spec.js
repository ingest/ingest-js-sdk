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
      'signUploadBlob',
      'getNetworkSecureKeys',
      'addNetworkSecureKey',
      'getNetworkSecureKeyById',
      'updateNetworkSecureKey',
      'deleteNetworkSecureKeyById',
      'getInputs',
      'getInputsById',
      'addInputs',
      'deleteInput',
      'deleteInputs',
      'initializeInputUpload',
      'completeInputUpload',
      'abortInputUpload',
      'getCurrentUserInfo'
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
      expect(response.headers('Content-type')).toBe('application/json; charset=utf-8');

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

  describe('signUploadBlob', function () {

    it('Should return signing information from the api.', function (done) {

      // Mock the XHR object
      mock.setup();

      var url = api.utils.parseTokens
        .call(this, api.config.inputsUploadSign, {id: 'test-upload-input-id', method: ''});

      // Mock the response from the REST api.
      mock.post(api.config.host + url,
        function (request, response) {

          var data = {
            authHeader: 'AWS AKIAJGPE726GTYWESRYQ:6+Yn1E8SwsqNuySrLPJkHhllL2k=',
            dateHeader: 'Tue, 17 Nov 2015 15:06:20 +0000',
            url: 'https://s3.amazonaws.com/ingest-dev-uploads/redspace/91b26626-d592-4f01-ba6…7Rqhp.Zss030Z.gLsRpMCPnWUbVWWMu7wLRgJbnVVCxX6WQAU8yYEuQ7U2XhfyLMULLAf35Zsz' //eslint-disable-line
          };

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(data));

        });

      // Mock blob to sign.
      var data = {
        id: 'test-upload-input-id',
        key: 'redspace/4c97015a-922c-495e-929e-3c83ecd15f73/SampleVideo_1080x720_30mb.mp4',
        partNumber: 2,
        uploadId: 'zeFlDBXK2paCLDr1O0yZ0y1giq4YuJvoPelEWhfpa0QnAf2ldw8sFlOulkAX0h9tJNigd9sXOW.n4wm4gPBrSBAvA.xYTqcFdJtZ75OzhsAuMzrWgTuXAH4gwPFwyDyn', //eslint-disable-line
        method: true  // It *is* a multi part upload.
      };

      // Make the request to sign the blob.
      var request = api.signUploadBlob(data).then(function (response) {

        expect(response).toBeDefined();
        expect(response.data.authHeader).toBeDefined();
        expect(response.data.dateHeader).toBeDefined();
        expect(response.data.url).toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeUndefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should sign the upload with the singlepart method.', function (done) {
      // Mock the XHR object
      mock.setup();

      var url = api.utils.parseTokens
        .call(
          this, api.config.inputsUploadSign,
          {id: 'test-upload-input-id', method: '?type=amazon'}
        );

      // Mock the response from the REST api.
      mock.post(api.config.host + url,
        function (request, response) {

          var data = {
            authHeader: 'AWS AKIAJGPE726GTYWESRYQ:6+Yn1E8SwsqNuySrLPJkHhllL2k=',
            dateHeader: 'Tue, 17 Nov 2015 15:06:20 +0000',
            url: 'https://s3.amazonaws.com/ingest-dev-uploads/redspace/91b26626-d592-4f01-ba6…7Rqhp.Zss030Z.gLsRpMCPnWUbVWWMu7wLRgJbnVVCxX6WQAU8yYEuQ7U2XhfyLMULLAf35Zsz' //eslint-disable-line
          };

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(data));

        });

      // Mock blob to sign.
      var data = {
        id: 'test-upload-input-id',
        key: 'redspace/4c97015a-922c-495e-929e-3c83ecd15f73/SampleVideo_1080x720_30mb.mp4',
        partNumber: 2,
        uploadId: 'zeFlDBXK2paCLDr1O0yZ0y1giq4YuJvoPelEWhfpa0QnAf2ldw8sFlOulkAX0h9tJNigd9sXOW.n4wm4gPBrSBAvA.xYTqcFdJtZ75OzhsAuMzrWgTuXAH4gwPFwyDyn', //eslint-disable-line
        method: false  // It *is not* a multi part upload.
      };

      // Make the request to sign the blob.
      var request = api.signUploadBlob(data).then(function (response) {

        expect(response).toBeDefined();
        expect(response.data.authHeader).toBeDefined();
        expect(response.data.dateHeader).toBeDefined();
        expect(response.data.url).toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeUndefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

    it('Should fail if supplied data is not an object.', function (done) {

      var data = 'test';

      // Make the request to sign the blob.
      var request = api.signUploadBlob(data).then(function (response) {

        expect(response).toBeUndefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if id is not supplied.', function (done) {

      var data = {
        key: 'testkey',
        uploadId: 'testid',
        partNumber: 1,
        method: 'testmethod'
      };

      // Make the request to sign the blob.
      var request = api.signUploadBlob(data).then(function (response) {

        expect(response).toBeUndefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if key is not supplied.', function (done) {

      var data = {
        id: 'test',
        uploadId: 'testid',
        partNumber: 1,
        method: 'testmethod'
      };

      // Make the request to sign the blob.
      var request = api.signUploadBlob(data).then(function (response) {

        expect(response).toBeUndefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if uploadId is not supplied.', function (done) {

      var data = {
        id: 'test',
        key: 'testkey',
        partNumber: 1,
        method: 'testmethod'
      };

      // Make the request to sign the blob.
      var request = api.signUploadBlob(data).then(function (response) {

        expect(response).toBeUndefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if partNumber is not supplied.', function (done) {

      var data = {
        id: 'test',
        key: 'testkey',
        uploadId: 'testid',
        method: 'testmethod'
      };

      // Make the request to sign the blob.
      var request = api.signUploadBlob(data).then(function (response) {

        expect(response).toBeUndefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if method is not supplied.', function (done) {

      var data = {
        id: 'test',
        key: 'testKey',
        uploadId: 'test',
        partNumber: 1
      };

      var request = api.signUploadBlob(data).then(function (response) {

        expect(response).toBeUndefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should pass if the method is single part and the uploadId is not defined', function (done) {
      // Mock the XHR object
      mock.setup();

      var url = api.utils.parseTokens
        .call(this, api.config.inputsUploadSign, {id: 'test', method: '?type=amazon'});

      // Mock the response from the REST api.
      mock.post(api.config.host + url,
        function (request, response) {

          var data = {
            authHeader: 'AWS AKIAJGPE726GTYWESRYQ:6+Yn1E8SwsqNuySrLPJkHhllL2k=',
            dateHeader: 'Tue, 17 Nov 2015 15:06:20 +0000',
            url: 'https://s3.amazonaws.com/ingest-dev-uploads/redspace/91b26626-d592-4f01-ba6…7Rqhp.Zss030Z.gLsRpMCPnWUbVWWMu7wLRgJbnVVCxX6WQAU8yYEuQ7U2XhfyLMULLAf35Zsz' //eslint-disable-line
          };

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(data));

        });

      // Mock blob to sign.
      var data = {
        id: 'test',
        key: 'testKey',
        partNumber: 1,
        method: false
      };

      var request = api.signUploadBlob(data).then(function (response) {

        expect(response).toBeDefined();
        expect(response.data.authHeader).toBeDefined();
        expect(response.data.dateHeader).toBeDefined();
        expect(response.data.url).toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeUndefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

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

  describe('getInputs', function () {
    it('Should return a list of inputs.', function (done) {
      // Mock the XHR object.
      mock.setup();

      var data = [
        {
          'id': '1359545e-1108-4149-bf8a-8504576ab713',
          'filename': 'test-vid.avi',
          'type': 'video/avi',
          'path': 'redspace/1359545e-1108-4149-bf8a-8504576ab713/0db0e821-5c90-4070-a900-4aa0f7c3a',
          'size': 67301934,
          'network_id': 'fed6e925-dee4-41cc-be4a-479cabc149a5',
          'job_id': null
        }, {
          'id': '54f2f4e7-3468-4e11-ae8a-194cc516b42a',
          'filename': 'test_vid.mp4',
          'type': 'video/mp4',
          'path': 'redspace/54f2f4e7-3468-4e11-ae8a-194cc516b42a/43b02457-ed64-4d79-a102-c5f443b93',
          'size': 37992174,
          'network_id': 'fed6e925-dee4-41cc-be4a-479cabc149a5',
          'job_id': null
        },
      ];

      // Mock the response from the REST api.
      mock.mock('GET', api.config.host + api.config.inputs , function (request, response) {
        // Restore the XHR object.
        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify(data));

      });

      var request = api.getInputs().then(function (response) {

        expect(response).toBeDefined();
        expect(response.data.length).toEqual(2);
        done();

      }, function (error) {

        expect(error).toBeUndefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });
  });

  describe('getInputsById', function () {
    it('Should fail if an id is not provided.', function (done) {

      var request = api.getInputsById().then(function (response) {

        expect(response).toBeUndefined();
        done();

      }, function (error) {

        expect(error).toBeDefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should return a single input.', function (done) {

      // Mock the XHR object.
      mock.setup();

      var data = {
        'Body': [
          {
            'id': '1359545e-1108-4149-bf8a-8504576ab713',
            'filename': 'test-vid.avi',
            'type': 'video/avi',
            'path': 'redspace/1359545e-1108-4149-bf8a-8504576ab713/0db0e821-5c90-4070-a900-4aa0f7c3a',
            'size': 67301934,
            'network_id': 'fed6e925-dee4-41cc-be4a-479cabc149a5',
            'job_id': null
          }
        ]
      }

      var url = api.utils.parseTokens
        .call(this, api.config.inputsById, {id: '1359545e-1108-4149-bf8a-8504576ab713'});

      // Mock the response from the REST api.
      mock.mock('GET', api.config.host + url,
        function (request, response) {

        // Restore the XHR object.
        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify(data));
      });

      var request = api.getInputsById('1359545e-1108-4149-bf8a-8504576ab713').then(function (response) {
        expect(response).toBeDefined();
        expect(response.data.Body).toBeDefined();
        expect(response.data.Body[0].id).toBeDefined();
        expect(response.data.Body[0].filename).toBe('test-vid.avi');

        done();
      }, function (error) {

        expect(error).toBeUndefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });
  });

  describe('addInput', function () {
    it('Should fail if an array is not provided.', function (done) {

      var inputs = {
        'id': '1359545e-1108-4149-bf8a-8504576ab713',
        'filename': 'test-vid.avi',
        'type': 'video/avi',
        'path': 'redspace/1359545e-1108-4149-bf8a-8504576ab713/0db0e821-5c90-4070-a900-4aa0f7c3a',
        'size': 67301934,
        'network_id': 'fed6e925-dee4-41cc-be4a-479cabc149a5',
        'job_id': null
      };

      var request = api.addInputs(inputs).then(function (response) {

        expect(response).toBeUndefined();
        done();

      }, function (error) {

        expect(error).toBeDefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('should return the added input', function (done) {
      // Mock the XHR object.
      mock.setup();

      var addedInput = {
        'Body': [{
          'id': '1359545e-1108-4149-bf8a-8504576ab713',
          'filename': 'filename.mp4',
          'type': 'video/mp4',
          'path': 'redspace/1359545e-1108-4149-bf8a-8504576ab713/0db0e821-5c90-4070-a900-4aa0f7c3a',
          'size': 67301934,
          'network_id': 'fed6e925-dee4-41cc-be4a-479cabc149a5',
          'job_id': null
        }]
      }

      var toAdd = [{
        'type': 'video/mp4',
        'filename': 'filename.mp4',
        'size': 5242880 // 5MB
      }];

      // Mock the response from the REST api.
      mock.mock('POST', api.config.host + api.config.inputs, function (request, response) {
        // Restore the XHR object.
        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify(addedInput));
      });

      var request = api.addInputs(toAdd).then(function (response) {
        expect(response).toBeDefined();
        expect(response.data.Body).toBeDefined();
        expect(response.data.Body[0].id).toBeDefined();
        expect(response.data.Body[0].filename).toBe('filename.mp4');

        done();
      }, function (error) {
        expect(error).toBeUndefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });
  });

  describe('deleteInput', function () {
    it('should fail if the passed in id is not a string', function (done) {
      var id = 1234;

      var request = api.deleteInput(id).then(function (response) {

        expect(response).toBeUndefined();
        done();

      }, function (error) {

        expect(error).toBeDefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

    it('should return a status code of 202', function (done) {
      // Mock the XHR object.
      mock.setup();

      var input = {
        'id': '1359545e-1108-4149-bf8a-8504576ab713',
        'filename': 'filename.mp4',
        'type': 'video/mp4',
        'path': 'redspace/1359545e-1108-4149-bf8a-8504576ab713/0db0e821-5c90-4070-a900-4aa0f7c3a',
        'size': 67301934,
        'network_id': 'fed6e925-dee4-41cc-be4a-479cabc149a5',
        'job_id': null
      };

      var url = api.utils.parseTokens
        .call(this, api.config.inputsById, {id: input.id});

      // Mock the response from the REST api.
      mock.mock('DELETE', api.config.host + url, function (request, response) {
        // Restore the XHR object.
        mock.teardown();

        return response.status(202);
      });

      var request = api.deleteInput(input.id).then(function (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(202);

        done();
      }, function (error) {
        expect(error).toBeUndefined();

        done();
      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });
  });

  describe('deleteInputs', function () {
    it('should fail if the passed in inputs is not an array', function (done) {
      var inputs = {
        'id': '12345'
      };

      var request = api.deleteInputs(inputs).then(function (response) {

        expect(response).toBeUndefined();
        done();
      }, function (error) {

        expect(error).toBeDefined();
        done();
      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

    it('should return a status code of 202', function (done) {
      // Mock the XHR object.
      mock.setup();

      var inputs = [{
        'id': '1359545e-1108-4149-bf8a-8504576ab713',
        'filename': 'filename.mp4',
        'type': 'video/mp4',
        'path': 'redspace/1359545e-1108-4149-bf8a-8504576ab713/0db0e821-5c90-4070-a900-4aa0f7c3a',
        'size': 67301934,
        'network_id': 'fed6e925-dee4-41cc-be4a-479cabc149a5',
        'job_id': null
      }];

      // Mock the response from the REST api.
      mock.mock('DELETE', api.config.host + api.config.inputs, function (request, response) {
        // Restore the XHR object.
        mock.teardown();

        return response.status(202);
      });

      var request = api.deleteInputs(inputs).then(function (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(202);

        done();
      }, function (error) {
        expect(error).toBeUndefined();

        done();
      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });
  });

  describe('initializeInputUpload', function () {
    it('should fail if the passed in inputId is not a string', function (done) {
      var inputId = 1234;
      var data = {
        'type': 'video/mp4',
        'size': 67301934,
        'method': ''
      };

      var request = api.initializeInputUpload(inputId, data).then(function (response) {

        expect(response).toBeUndefined();
        done();

      }, function (error) {

        expect(error).toBeDefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

    it('should fail if data.type is not a string', function (done) {
      var inputId = '1234';
      var data = {
        'type': 1234,
        'size': 67301934,
        'method': ''
      };

      var request = api.initializeInputUpload(inputId, data).then(function (response) {

        expect(response).toBeUndefined();
        done();

      }, function (error) {

        expect(error).toBeDefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

    it('should fail if data.size is not a number', function (done) {
      var inputId = '1234';
      var data = {
        'type': 'video/mp4',
        'size': '67301934',
        'method': ''
      };

      var request = api.initializeInputUpload(inputId, data).then(function (response) {

        expect(response).toBeUndefined();
        done();

      }, function (error) {

        expect(error).toBeDefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

    it('should initialize a multipart upload for upload', function (done) {
      mock.setup();
      var inputId = '1234';
      var signing = '';

      var data = {
        'type': 'video/mp4',
        'size': 67301934,
        'method': true
      };

      var resp = {
        'key': 'redspace/1234',
        'pieceCount': 8,
        'pieceSize': 5242880,
        'uploadId': 'gfisdygfisuhiuh4253u4h5i3'
      }

      var url = api.utils.parseTokens
        .call(this, api.config.inputsUpload, {id: inputId, method: signing});

      // Mock the response from the REST api.
      mock.mock('POST', api.config.host + url, function (request, response) {
        // Restore the XHR object.
        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify(resp));
      });

      var request = api.initializeInputUpload(inputId, data).then(function (response) {
        expect(response).toBeDefined();
        expect(response.data.key).toBeDefined();
        expect(response.data.pieceCount).toBeDefined();
        expect(response.data.pieceSize).toBeDefined();
        expect(response.data.uploadId).toBeDefined();

        // If its not there it means it will be a multipart
        expect(url.indexOf('amazonMP')).toBe(-1);

        done();
      }, function (error) {
        expect(error).toBeUndefined();
        done();
      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

    it('should initialize a multipart upload for upload', function (done) {
      mock.setup();
      var inputId = '1234';
      var signing = '?type=amazon';

      var data = {
        'type': 'video/mp4',
        'size': 67301934,
        'method': false
      };

      var resp = {
        'key': 'redspace/1234',
        'pieceCount': 8,
        'pieceSize': 5242880,
        'uploadId': 'gfisdygfisuhiuh4253u4h5i3'
      }

      var url = api.utils.parseTokens
        .call(this, api.config.inputsUpload, {id: inputId, method: signing});

      // Mock the response from the REST api.
      mock.mock('POST', api.config.host + url, function (request, response) {
        // Restore the XHR object.
        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify(resp));
      });

      var request = api.initializeInputUpload(inputId, data).then(function (response) {
        expect(response).toBeDefined();
        expect(response.data.key).toBeDefined();
        expect(response.data.pieceCount).toBeDefined();
        expect(response.data.pieceSize).toBeDefined();
        expect(response.data.uploadId).toBeDefined();

        // If its not there it means it will be a multipart
        expect(url.indexOf('amazon')).not.toBe(-1);

        done();
      }, function (error) {
        expect(error).toBeUndefined();
        done();
      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });
  });

  describe('completeInputUpload', function () {
    it('should fail if the inputId is not a string', function (done) {
      var inputId = 1234;
      var data = {
        key: 'redspace/5df59845-3bfd-4ff7-b40c-cc4147b2edf1/3991421d-4270-4b45-8a1f-3d60890e5d93',
        uploadId: 'wBEm6Ik2ukEeb5wKNZS_Q0l9dV52s6spiRieDJo4JjmkHdlg4F4ok'
      };

      var url = api.utils.parseTokens
        .call(this, api.config.inputsUploadComplete, {id: inputId});

      var request = api.completeInputUpload(inputId, data).then(function (response) {
        expect(response).toBeUndefined();
        done();
      }, function (error) {
        expect(error).toBeDefined();
        done();
      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

    it('should fail if the key is not a string', function (done) {
      var inputId = '1234';
      var data = {
        key: 1234,
        uploadId: 'wBEm6Ik2ukEeb5wKNZS_Q0l9dV52s6spiRieDJo4JjmkHdlg4F4ok'
      };

      var url = api.utils.parseTokens
        .call(this, api.config.inputsUploadComplete, {id: inputId});

      var request = api.completeInputUpload(inputId, data).then(function (response) {
        expect(response).toBeUndefined();
        done();
      }, function (error) {
        expect(error).toBeDefined();
        done();
      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

    it('should fail if the uploadId is not a string', function (done) {
      var inputId = '1234';
      var data = {
        key: 'redspace/5df59845-3bfd-4ff7-b40c-cc4147b2edf1/3991421d-4270-4b45-8a1f-3d60890e5d93',
        uploadId: 1234
      };

      var url = api.utils.parseTokens
        .call(this, api.config.inputsUploadComplete, {id: inputId});

      var request = api.completeInputUpload(inputId, data).then(function (response) {
        expect(response).toBeUndefined();
        done();
      }, function (error) {
        expect(error).toBeDefined();
        done();
      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

    it('should have a response statusCode of 200', function (done) {
      mock.setup();

      var inputId = '1234';
      var data = {
        key: 'redspace/5df59845-3bfd-4ff7-b40c-cc4147b2edf1/3991421d-4270-4b45-8a1f-3d60890e5d93',
        uploadId: 'wBEm6Ik2ukEeb5wKNZS_Q0l9dV52s6spiRieDJo4JjmkHdlg4F4ok'
      };

      var url = api.utils.parseTokens
        .call(this, api.config.inputsUploadComplete, {id: inputId});

      // Mock the response from the REST api.
      mock.mock('POST', api.config.host + url, function (request, response) {
        // Restore the XHR object.
        mock.teardown();

        return response.status(200);
      });

      var request = api.completeInputUpload(inputId, data).then(function (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(200);
        done();
      }, function (error) {
        expect(error).toBeUndefined();
        done();
      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });
  });

  describe('abortInputUpload', function () {
    it('should fail if the inputId is not a string', function (done) {
      var inputId = 1234;
      var data = {
        key: 'redspace/5df59845-3bfd-4ff7-b40c-cc4147b2edf1/3991421d-4270-4b45-8a1f-3d60890e5d93',
        uploadId: 'wBEm6Ik2ukEeb5wKNZS_Q0l9dV52s6spiRieDJo4JjmkHdlg4F4ok'
      };

      var url = api.utils.parseTokens
        .call(this, api.config.inputsUploadAbort, {id: inputId});

      var request = api.abortInputUpload(inputId, data).then(function (response) {
        expect(response).toBeUndefined();
        done();
      }, function (error) {
        expect(error).toBeDefined();
        done();
      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

    it('should fail if the key is not a string', function (done) {
      var inputId = '1234';
      var data = {
        key: 1234,
        uploadId: 'wBEm6Ik2ukEeb5wKNZS_Q0l9dV52s6spiRieDJo4JjmkHdlg4F4ok'
      };

      var url = api.utils.parseTokens
        .call(this, api.config.inputsUploadAbort, {id: inputId});

      var request = api.abortInputUpload(inputId, data).then(function (response) {
        expect(response).toBeUndefined();
        done();
      }, function (error) {
        expect(error).toBeDefined();
        done();
      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

    it('should fail if the uploadId is not a string', function (done) {
      var inputId = '1234';
      var data = {
        key: 'redspace/5df59845-3bfd-4ff7-b40c-cc4147b2edf1/3991421d-4270-4b45-8a1f-3d60890e5d93',
        uploadId: 1234
      };

      var url = api.utils.parseTokens
        .call(this, api.config.inputsUploadAbort, {id: inputId});

      var request = api.abortInputUpload(inputId, data).then(function (response) {
        expect(response).toBeUndefined();
        done();
      }, function (error) {
        expect(error).toBeDefined();
        done();
      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

    it('should have a response statusCode of 200', function (done) {
      mock.setup();

      var inputId = '1234';
      var data = {
        key: 'redspace/5df59845-3bfd-4ff7-b40c-cc4147b2edf1/3991421d-4270-4b45-8a1f-3d60890e5d93',
        uploadId: 'wBEm6Ik2ukEeb5wKNZS_Q0l9dV52s6spiRieDJo4JjmkHdlg4F4ok'
      };

      var url = api.utils.parseTokens
        .call(this, api.config.inputsUploadAbort, {id: inputId});

      // Mock the response from the REST api.
      mock.mock('POST', api.config.host + url, function (request, response) {
        // Restore the XHR object.
        mock.teardown();

        return response.status(200);
      });

      var request = api.abortInputUpload(inputId, data).then(function (response) {
        expect(response).toBeDefined();
        expect(response.statusCode).toBe(200);
        done();
      }, function (error) {
        expect(error).toBeUndefined();
        done();
      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });
  });

  describe('getUserInfo', function () {
    it('Should retrieve user information.', function (done) {

      mock.setup();

      var user = {
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
      mock.mock('GET', api.config.host + api.config.currentUserInfo,
        function (request, response) {

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(user));

        });

      var request = api.getCurrentUserInfo().then(function (response) {
        expect(response).toBeDefined();
        expect(response.data.id).toEqual(user.id);
        done();
      }, function (error) {
        expect(error).toBeUndefined(0);
        done();
      });
    });
  });
});
