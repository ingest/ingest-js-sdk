var api;
// Token will need to be re-generated every 24 hours.
var access_token = 'Bearer ' + window.token;

var validVideoId;
var createdVideo;
var nextRange;

describe('Ingest API', function () {

  // Note : Jasmine uses beforeAll for this case.
  beforeAll(function () {
    api = new IngestAPI({
      host: 'http://weasley.teamspace.ad:8080',
      token: access_token
    });
  });

  // Reset the auth token.
  beforeEach(function () {
    api.setToken(access_token);
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
      'parseId'
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

  it('Should parse the id out of a template string', function () {
    var result = IngestAPI.prototype.parseId.call(this, '<%=id%>', 'testid');
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

  it('Should return access to the responeHeaders.', function (done) {
    var request = api.getVideos().then(function (response) {

      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      expect(response.headers).toBeDefined();
      expect(typeof response.headers).toBe('function');
      expect(response.statusCode).toBeDefined();

      // Validate that we can retrive the response headers.
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
        "title": "blow-300.rise.of.an.empire.720p.bluray.x264-sample.mkve.mkv",
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

  describe('Ingest API : deleteVideo', function () {

    it('Should delete a video.', function (done) {

      var request = api.deleteVideo(createdVideo).then(function (response) {

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

});
