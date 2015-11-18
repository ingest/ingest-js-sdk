var api;

// Token will need to be re-generated every 24 hours.
var access_token = 'Bearer ' + window.token;

var mock = require('xhr-mock');

describe('Ingest API : Request', function () {

  // Reset the auth token.
  beforeEach(function () {
    api = new IngestAPI({
      host: 'http://weasley.teamspace.ad:8080',
      token: access_token
    });
  });

  it('Should reject the promise if the response is not valid JSON.', function (done) {

    mock.setup();

    var data = '"1';

    mock.get(api.config.host + api.config.videos,
      function (request, response) {

        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(data);
      });


    var request = api.getVideos().then(function (response) {

      expect(response).toBeUnDefined();

      done();

    }, function (error) {

      expect(error).toBeDefined();

      done();

    });

    // Ensure a promise was returned.
    expect(request.then).toBeDefined();

  });

  it('Should reject the promise if the url is not defined.', function (done) {

    api.config.host = null;
    api.config.videos = null;

    var request = api.getVideos().then(function (response) {

      expect(response).toBeUndefined();
      done();

    }, function (error) {

      expect(error).toBeDefined();

      done();

    });

    // Ensure a promise was returned.
    expect(request.then).toBeDefined();

  });

  it('Should make a request even if a token is missing.', function () {

    api.token = null;

    // Mock the call to getToken.
    api.getToken = function () {
      return null;
    };

    var request = api.getVideos().then(function (response) {

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
