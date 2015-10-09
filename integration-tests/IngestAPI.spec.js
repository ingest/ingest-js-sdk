var api;
// Token will need to be re-generated every 24 hours.
var access_token = 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovLyouaW5nZXN0LmlvIiwiY2lkIjoiSW5nZXN0RGV2IiwiZXhwIjoxNDQ0NTAxOTk0LCJpYXQiOjE0NDQ0MTU1OTQsImlzcyI6Imh0dHBzOi8vbG9naW4uaW5nZXN0LmlvIiwianRpIjoiMzE4ZjRjMmUtNmFhOS00YmRiLWE3ZTYtZTk2YTBlN2I3Njg4IiwibnR3IjoicmVkc3BhY2UiLCJzdWIiOiI3ZTZhODRhYi03ZjllLTQ3MGUtODJlNy02ZGQzZDllYzYxMmMifQ.EGjuG_8ltopY4R8wwSPXqLzelInNpP79XIyQlAgzLPhL2C-w_eWdfyLyhBB0L4MQ7ILZmZLvhJotBUJP41VDGKuDUKSlLM5oVBf6x8ASyVnn84SE_dGTvcfQGuxoP0Y5v5USC20uXt5CobXm5Y-aYQht-JisAYq-r7z85jfRgQz73FPXkQfLRj4i_4JAIGHYeQC8swJsYFJ79U10-oq-JiQRJMaObsERUI-NxselKI-oYLlzRLTtoU55pXSpk2u6g7wTq4NgS11bs57S79m5r72eYd0FlNCJmnnRSL6ZLRPxP_cg2T82VVQwLaAEFbzGmHGeYmzL6FheEY_cYciTCg'; // eslint-disable-line
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
