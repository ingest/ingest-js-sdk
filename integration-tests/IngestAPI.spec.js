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
      'getTrashedVideosCount',
      'parseTokens',
      'signUploadBlob',
      'updateVideo',
      'searchVideos',
      'getNetworkKey',
      'setNetworkKey'
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

          // Restore the XHR Object
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(video));

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

      var request = api.searchVideos('videos').then(function () {

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

    it('Should pass if the method is single part and the uploadId is not defined', function () {

      var data = {
        id: 'test',
        key: 'testKey',
        partNumber: 1,
        method: false
      };

      var request = api.signUploadBlob(data).then(function (response) {

        expect(response).toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeUndefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

  });

  describe('Ingest API : getNetworkKey', function () {

    it('Should return the current primary key from the network', function (done) {
      // Mock the XHR object
      mock.setup();

      // Mock the response from the REST api.
      mock.get(api.config.host + api.config.networksKey,
        function (request, response) {

          var data = {
            key: 'RSA-PUBLIC-KEY'
          };

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(data));

        });

      // Make the request to get the network key.
      var request = api.getNetworkKey().then(function (response) {

        expect(response).toBe('RSA-PUBLIC-KEY');

        done();

      }, function (error) {

        expect(error).toBeUndefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

  });

  describe('Ingest API : setNetworkKey', function () {

    it('Should add a new key to the current network', function (done) {
      // Mock the XHR object
      mock.setup();

      // Mock the response from the REST api.
      mock.post(api.config.host + api.config.networksKey,
        function (request, response) {

          // Restore the XHR object.
          mock.teardown();

          return response.status(200);

        });

      // Mock blob to sign.
      var data = {
        key: 'NEW-RSA-PUBLIC-KEY'
      };

      // Make the request to add a new key to the network
      var request = api.setNetworkKey(data.key).then(function (response) {

        expect(response).toBeDefined();
        expect(response.data).toBeFalsy();

        done();

      }, function (error) {

        expect(error).toBeUndefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

    it('Should update the existing primary key on the current network', function (done) {
      // Mock the XHR object
      mock.setup();

      // Mock the response from the REST api.
      mock.mock('PATCH', api.config.host + api.config.networksKey,
        function (request, response) {

          // Restore the XHR object.
          mock.teardown();

          return response.status(200);

        });

      // Mock blob to sign.
      var data = {
        key: 'UPDATED-RSA-PUBLIC-KEY'
      };

      // Make the request to update the existing primary key on the current network.
      var request = api.setNetworkKey(data.key, true).then(function (response) {

        expect(response).toBeDefined();
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

  it('Should return an error if no key is provided', function () {
    var request = api.setNetworkKey().then(function (response) {

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
