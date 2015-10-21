var api;
// Token will need to be re-generated every 24 hours.
var access_token = 'Bearer ' + window.token;

var validVideoId;
var createdVideo;
var nextRange;

describe('Ingest API', function () {

  // Note : Jasmine uses beforeAll for this case.
  beforeAll(function () {
    api = new IngestAPI({token: access_token});
  });

  it('Should exist on the window object.', function () {
    expect(IngestAPI).toBeDefined();
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
    }).catch(function (error) {

      expect(error).toBeUndefined();

      done();
    });

    // Ensure a promise was returned.
    expect(request.then).toBeDefined();
    expect(request.catch).toBeDefined();
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
    }).catch(function (error) {

      expect(error).toBeUndefined();

      done();
    });

    // Ensure a promise was returned.
    expect(request.then).toBeDefined();
    expect(request.catch).toBeDefined();
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
      }).catch(function (error) {

        expect(error).toBeUndefined();

        done();
      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
      expect(request.catch).toBeDefined();

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

      }).catch(function (error) {

        expect(error).toBeUndefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
      expect(request.catch).toBeDefined();

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
      }).catch(function (error) {

        expect(error).toBeDefined();

        // Reset the token;
        api.setToken(access_token);

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
      expect(request.catch).toBeDefined();

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

      }).catch(function (error) {

        expect(error).toBeUndefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
      expect(request.catch).toBeDefined();

    });

    it('Should fail if no ID is provided.', function (done) {
      var request = api.getVideoById('').then(function (response) {

        expect(response).toBeUndefined();
        done();

      }).catch(function (error) {

        expect(error).toBeDefined();
        done();

      });

      expect(request.catch).toBeDefined();
    });

    it('Should fail if an invalid ID is provided.', function (done) {
      var request = api.getVideoById('invalid-id').then(function (response) {

        expect(response).toBeUndefined();
        done();

      }).catch(function (error) {

        expect(error).toBeDefined();
        done();

      });

      expect(request.catch).toBeDefined();
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

      }).catch(function (error) {

        expect(error).toBeUndefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
      expect(request.catch).toBeDefined();

    });

    it('Should fail if only a string is passed.', function (done) {

      var video = 'test video';

      var request = api.addVideo(video).then(function (response) {

        expect(response).toBeUndefined();

        done();

      }).catch(function (error) {

        expect(error).toBeDefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
      expect(request.catch).toBeDefined();

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

      }).catch(function (error) {

        expect(error).toBeUndefined();

        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
      expect(request.catch).toBeDefined();

    });

  });

});
