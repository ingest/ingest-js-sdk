var api;
// Token will need to be re-generated every 24 hours.
var access_token = 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovLyouaW5nZXN0LmlvIiwiY2lkIjoiSW5nZXN0RGV2IiwiZXhwIjoxNDQ0NDA0NTM0LCJpYXQiOjE0NDQzMTgxMzQsImlzcyI6Imh0dHBzOi8vbG9naW4uaW5nZXN0LmlvIiwianRpIjoiMjcyYmIxYWUtMDJhOS00OGIyLTkxYzYtODdmODc4ZDZmNjhlIiwibnR3IjoicmVkc3BhY2UiLCJzdWIiOiI3ZTZhODRhYi03ZjllLTQ3MGUtODJlNy02ZGQzZDllYzYxMmMifQ.YLsbv1Q_40jtPmbyC7ubpJNF9Pt8yuhXkpXmFWoEiB9fJM9nidDfuqIfZ3EleGN3RNZ0WhBCyNCgMB8Dum_XOHXzfTqBWBi5xzu-nR7bPyqs8HjH74TNgj1AaMnHJGQrAnAaQo6Kvi3FP7y4nJVKc7C5OXgUYYFLCV0I_uJTViN4UuSVIZUmkOYqGBmCWOR6I3_LPp2sSmIEV0Wi7H82uR03AiRuT8FJZv6vK7TUSUff0rZ-WTP0YIemfMpTci08eqUqY_TuzfmyoaejO1sYrQYSBhJckjHiAcsPJJm8SGaUNvZIuwUVP3_gJQAWWvUd3Np5-EYdW66A9yoQlL3aHw'; // eslint-disable-line
var validVideoId;

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
        expect(respones).toBeUndefined();

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

    it('Should fail if there is no token is set.', function (done) {

      api.setToken('');

      var request = api.getVideos().then(function (response) {
        expect(respones).toBeUndefined();

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

});
