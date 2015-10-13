var api;
// Token will need to be re-generated every 24 hours.
var access_token = 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovLyouaW5nZXN0LmlvIiwiY2lkIjoiSW5nZXN0RGV2IiwiZXhwIjoxNDQ0ODQ2ODcxLCJqdGkiOiJmMmQ0ZWE1Ni05NjYyLTQ4OGQtYWMwNy1hZDM0YmJmYThjYmUiLCJpYXQiOjE0NDQ3NjA0NzEsImlzcyI6Imh0dHBzOi8vbG9naW4uaW5nZXN0LmlvIiwibnR3IjoicmVkc3BhY2UiLCJzY29wZSI6eyJ1c2VyIjp7ImFjdGlvbnMiOm51bGx9fSwic3ViIjoiN2U2YTg0YWItN2Y5ZS00NzBlLTgyZTctNmRkM2Q5ZWM2MTJjIn0.YWdDFjGaHyULAEgURht9lHq9PQ2e3PeUGfe2FECdmy8pd3pcZtY-0cf40HBbeHsEgj683-g3ia8c3NK-xtVFQs1LlFQjgs-ffDgqhaNybMFPTKH3aVlJGDVwdKuhcM04W6eMI_sFPpACUbc1KM_U3eQzoBVcWLpe0CtxsGj2Z35oWxo3GdivD9q5Q3xpuOpzs07-U-qV0mRrYUGr5NXZMYnzeCn5lblF-Sg9FA2uhyLbsdAoUNlue0akxPbK4zzSVhSxhTAew4Liaye5i5XVW-NPy4QysHIBBQrbhEBPIA5N4Q0Bdoc11hRnzR438AYvBokuvCAqnUaq9eAAEX5f1A'; // eslint-disable-line
var validVideoId;
var createdVideo;

describe('Ingest API', function () {

  // Note : Jasmine uses beforeAll for this case.
  beforeAll(function () {
    api = new IngestAPI({token: access_token});
  });

  it('Should exist on the window object', function () {
    expect(IngestAPI).toBeDefined();
  });

  it('Should throw an error if no token is provided', function () {

    var localApi,
      error;

    try {
      localApi = new IngestAPI;
    } catch (e) {
      error = e;
    }

    expect(error).toBeDefined();

  });

  it('Should return the currently configured token', function () {

    var token = api.getToken();

    expect(token).toEqual(access_token);

  });

  describe('Ingest API : getVideos', function () {

    it('Should retrieve videos', function (done) {

      var request = api.getVideos().then(function (response) {
        expect(response).toBeDefined();

        validVideoId = response[0].id;

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

    it('Should fail if there is an invalid token is set.', function (done) {

      api.setToken('invalid-token');

      var request = api.getVideos().then(function (response) {
        expect(response).toBeUndefined();

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

    it('Should fail if there is no token is set.', function () {

      expect(api.setToken).toThrow();

    });

  });

  describe('Ingest API : getVideoById', function () {

    it('Should return a single video.', function (done) {

      var request = api.getVideoById(validVideoId).then(function (response) {

        expect(response).toBeDefined();
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

        // Store the video to use later with the delete test.
        createdVideo = response.id;

        done();

      }).catch(function (error) {

        expect(error).toBeUndefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
      expect(request.catch).toBeDefined();

    });

    it('Should fail if I only pass a string', function (done) {

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

});
