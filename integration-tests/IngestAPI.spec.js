var api;
// Token will need to be re-generated every 24 hours.
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
      'getVideos',
      'getVideoById',
      'addVideo',
      'deleteVideo',
      'getVideosCount',
      'getTrashedVideos',
      'getTrashedVideosCount',
      'parseTokens',
      'signUploadBlob',
      'updateVideo',
      'searchVideos',
      'getNetworkSecureKeys',
      'addNetworkSecureKey',
      'getNetworkSecureKeyById',
      'updateNetworkSecureKey',
      'deleteNetworkSecureKeyById',
      'getVideoThumbnails'
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
    var result = IngestAPI.prototype.parseTokens.call(this, '<%=id%>', {id: 'testid'});
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

  it('Should return access to the responeHeaders.', function (done) {
    var request = api.getVideos().then(function (response) {

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
    var request = api.getVideos().then(function (response) {

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

  describe('Ingest API : getVideos', function () {

    it('Should retrieve videos.', function (done) {

      var request = api.getVideos().then(function (response) {

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

    it('Should retrieve the next page of videos.', function (done) {

      var request = api.getVideos({
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

      var request = api.getVideos().then(function (response) {
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

    it('Should fail if there is no token set.', function () {

      expect(api.setToken).toThrow();

    });

  });

  describe('Ingest API : getVideoById', function () {

    it('Should return a single video.', function (done) {

      var request = api.getVideoById(validVideoId).then(function (response) {

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

    it('Should fail if no ID is provided.', function (done) {
      var request = api.getVideoById('').then(function (response) {

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
      var request = api.getVideoById('invalid-id').then(function (response) {

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

  describe('Ingest API : addVideo', function () {

    it('Should add a video.', function (done) {

      var video = {
        "title": "an-example.mkve.mkv",
        "size": 0,
        "description": "Test video."
      };

      var request = api.addVideo(video).then(function (response) {

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

    it('Should fail if only a string is passed.', function (done) {

      var video = 'test video';

      var request = api.addVideo(video).then(function (response) {

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

  describe('Ingest API : updateVideo', function () {

    it('Should update a video record.', function (done) {

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

      var request = api.updateVideo(video).then(function (response) {

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

    it('Should fail to update a video if something other than an object is passed',
      function (done) {

        var request = api.updateVideo('video').then(function (response) {

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

  describe('Ingest API : deleteVideo', function () {

    it('Should delete a video.', function (done) {

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

      var request = api.deleteVideo('1234').then(function (response) {

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

    it('Should fail if the videoId is not a string', function (done) {

      var request = api.deleteVideo({test: true}).then(function (response) {

        expect(response).toBeUndefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it ('Should permanently delete a video', function (done) {

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

      var request = api.permanentlyDeleteVideo('1234').then(function (response) {

        expect(response).toBeDefined();
        expect(response.data.ok).toEqual(true);
        done();

      }, function (error) {

        expect(error).toBeUndefined();
        done();

      });

    });

  });

  describe('Ingest API : searchVideos', function () {

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

      var request = api.searchVideos('videos', 'test').then(function (response) {

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

    it('Should fail if a resource is not supplied', function (done) {

      var request = api.searchVideos(null, 'test').then(function (response) {

        expect(response).toBeUndefined();
        done();

      }, function (error) {

        expect(error).toBeDefined();
        done();

      });

      // Ensure a promise is returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if search input is not supplied', function (done) {

      var request = api.searchVideos('videos').then(function (response) {

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

  describe('Ingest API : getVideosCount', function () {

    it('Should retrieve a count of all the videos', function (done) {

      var request = api.getVideosCount().then(function (response) {

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

  describe('Ingest API : getTrashedVideos', function () {

    it('Should retrieve trashed videos.', function (done) {

      var data = ['video1', 'video2', 'video3'];

      mock.setup();

      mock.mock('GET', api.config.host + api.config.trash,
        function (request, response) {

          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(data))

        });

      var request = api.getTrashedVideos().then(function (response) {

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

    it('Should retrieve the next page of trashed videos.', function (done) {

      var data = ['video4', 'video5', 'video6'];

      mock.setup();

      mock.mock('GET', api.config.host + api.config.trash,
        function (request, response) {

          mock.teardown();

          expect(request._headers.range).toEqual('12345');

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(data));

        });

      var request = api.getTrashedVideos({
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

  describe('Ingest API : getTrashedVideosCount', function () {

    it('Should return the count of trashed videos.', function (done) {

      var request = api.getTrashedVideosCount().then(function (response) {

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

  describe('Ingest API : signUploadBlob', function () {

    it('Should return signing information from the api.', function (done) {

      // Mock the XHR object
      mock.setup();

      // Mock the response from the REST api.
      mock.post(api.config.host + '/videos/test-upload-video-id/upload/sign',
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
        id: 'test-upload-video-id',
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

      // Mock the response from the REST api.
      mock.post(api.config.host + '/videos/test-upload-video-id/upload/sign?type=amazon',
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
        id: 'test-upload-video-id',
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

      // Mock the response from the REST api.
      mock.post(api.config.host + '/videos/test/upload/sign?type=amazon',
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

  describe('Ingest API : getNetworkSecureKeys', function () {

    it('Should retrieve all network secure keys from the current network.', function (done) {
      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST api.
      mock.get(api.config.host + api.config.networksKeys,
        function (request, response) {

          var data = [
            {
              "id": "801d46e7-8cc8-4b2c-b064-770a0a046bd8",
              "title": "Network Secure Key",
              "key": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0....",
              "created_at": "2014-10-10 11:20:38.022191",
              "updated_at": "2014-10-10 11:20:38.022191",
              "author_id": "7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c",
              "updater_id": "7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c"
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

  describe('Ingest API : addNetworkSecureKey', function () {

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
            "id": "801d46e7-8cc8-4b2c-b064-770a0a046bd8",
            "title": "Default Key Title",
            "key": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0....",
            "created_at": "2014-10-10 11:20:38.022191",
            "updated_at": "2014-10-10 11:20:38.022191",
            "author_id": "7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c",
            "updater_id": "7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c"
          };

          // Restore the XHR object.
          mock.teardown();

          return response.status(201)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(data));

        });

      // Mock the request data
      data = {
        title: [{"name": "Taylor Swift"}],
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

  describe('Ingest API : getNetworkSecureKeyById', function () {

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
            "id": id,
            "title": "Secure Key Entry #1",
            "key": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0....",
            "created_at": "2014-10-10 11:20:38.022191",
            "updated_at": "2014-10-10 11:20:38.022191",
            "author_id": "7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c",
            "updater_id": "7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c"
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

  describe('Ingest API : updateNetworkSecureKey', function () {

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
            "id": id,
            "title": "Default Key Title",
            "key": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0....",
            "created_at": "2014-10-10 11:20:38.022191",
            "updated_at": "2014-10-10 11:20:38.022191",
            "author_id": "7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c",
            "updater_id": "7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c"
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
            "id": id,
            "title": "This is a new key.",
            "key": "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0....",
            "created_at": "2014-10-10 11:20:38.022191",
            "updated_at": "2014-10-10 11:20:38.022191",
            "author_id": "7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c",
            "updater_id": "7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c"
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

  describe('Ingest API : deleteNetworkSecureKeyById', function () {

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

  describe('Ingest API : updateVideos', function () {

    it('Should fail if no videos are passed in.', function (done) {

      var request = api.updateVideos().then(function (response) {

        expect(response).toBeUndefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should send a request with an array of video objects.', function (done) {

      var data, request;

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST api.
      mock.mock('PATCH', api.config.host + api.config.videos,
        function (request, response) {

          var data = {
            "Body": [
              {
                "id": "3fc358b0-630e-43f2-85f9-69195b346312",
                "url": "http://weasley.teamspace.ad:8080/videos/3fc358b0-630e-43f2-85f9-69195b346312",
                "title": "an-exampleMODIFIED.mkve.mkv",
                "description": "Test video.2",
                "playback_url": null,
                "status": 0,
                "size": 0,
                "created_at": "2015-12-08T17:54:48.437471Z",
                "updated_at": "2015-12-16T17:29:48.108036Z",
                "deleted_at": null,
                "published_at": null,
                "schedule_start": null,
                "schedule_end": null,
                "private": false,
                "tags": null,
                "poster": null,
                "author": {
                  "id": "7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c",
                  "url": "http://weasley.teamspace.ad:8080/users/7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c",
                  "email": "jamie.stackhouse@redspace.com",
                  "profile": {
                    "display_name": "Jamie Stackhouse",
                    "title": "Super Geek"
                  },
                  "timezone": "America/Halifax",
                  "deleted_at": null,
                  "first_time_user": true
                },
                "updater": {
                  "id": "7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c",
                  "url": "http://weasley.teamspace.ad:8080/users/7e6a84ab-7f9e-470e-82e7-6dd3d9ec612c",
                  "email": "jamie.stackhouse@redspace.com",
                  "profile": {
                    "display_name": "Jamie Stackhouse",
                    "title": "Super Geek"
                  },
                  "timezone": "America/Halifax",
                  "deleted_at": null,
                  "first_time_user": true
                }
              }
            ],
            "Errors": null
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
          "id": "3fc358b0-630e-43f2-85f9-69195b346312",
          "title": "an-exampleMODIFIED.mkve.mkv"
        }
      ];

      request = api.updateVideos(data).then(function (response) {

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

  });

  describe('Ingest API : deleteVideos', function () {

    it('Should fail if no videos are passed in.', function (done) {

      var request = api.deleteVideos().then(function (response) {

        expect(response).toBeUndefined();

        done();

      }, function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should soft-delete all videos inside the passed in array.', function (done) {

      var data, request;

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST api.
      mock.mock('DELETE', api.config.host + api.config.videos,
        function (request, response) {

          // Restore the XHR object.
          mock.teardown();

          return response.status(202);

        });

      // Mock request data.
      data = [
        {
          "id": "3fc358b0-630e-43f2-85f9-69195b346312"
        }
      ];

      request = api.deleteVideos(data).then(function (response) {

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

  });

  describe('Ingest API : permanentlyDeleteVideos', function () {

    it('Should permanently delete all videos inside the passed in array.', function (done) {

      var data, request;

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST api.
      mock.mock('DELETE', api.config.host + api.config.videos + api.config.deleteMethods.permanent,
        function (request, response) {

          // Restore the XHR object.
          mock.teardown();

          return response.status(202);

        });

      // Mock request data.
      data = [
        {
          "id": "3fc358b0-630e-43f2-85f9-69195b346312"
        }
      ];

      request = api.permanentlyDeleteVideos(data, true).then(function (response) {

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

  });

  describe('Ingest API : getVideoThumbnails', function () {

    it('Should fail if an id is not provided.', function (done) {

      var request = api.getVideoThumbnails().then(function (response) {

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
          "thumbnail_id":"a7d6da39-5d2e-4ff7-a5a1-b6b5da0ba124",
          "thumbnail_url":"https://play-dev.ingest.io/redspace/065764b6-093c-4c2d-b347-4b37e73320dd/poster01.jpg",
          "thumbnail_type":"system"
        },
        {
          "thumbnail_id":"969620c5-ea68-4b54-bdec-3300242b5eeb",
          "thumbnail_url":"https://play-dev.ingest.io/redspace/065764b6-093c-4c2d-b347-4b37e73320dd/poster02.jpg",
          "thumbnail_type":"system"
        },
        {
          "thumbnail_id":"6f5dbf2f-f9e5-406c-8856-aaf6daa9947e",
          "thumbnail_url":"https://play-dev.ingest.io/redspace/065764b6-093c-4c2d-b347-4b37e73320dd/poster03.jpg",
          "thumbnail_type":"system"
        },
        {
          "thumbnail_id":"5bf0fddc-39dd-4630-913c-2e3582c781ad",
          "thumbnail_url":"https://play-dev.ingest.io/redspace/065764b6-093c-4c2d-b347-4b37e73320dd/poster04.jpg",
          "thumbnail_type":"system"
        }
      ];

      var url = IngestAPI.prototype.parseTokens
        .call(this, api.config.thumbnails, {id: 'a-video-id'});

      // Mock the response from the REST api.
      mock.mock('GET', api.config.host + url,
        function (request, response) {

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(data));

        });

      var request = api.getVideoThumbnails('a-video-id').then(function (response) {

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
