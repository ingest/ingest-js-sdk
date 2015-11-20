var api;

// Token will need to be re-generated every 24 hours.
var access_token = 'Bearer ' + window.token;

var mock = require('xhr-mock');
var Request;

describe('Ingest API : Request', function () {

  // Reset the auth token.
  beforeEach(function () {
    api = new IngestAPI({
      host: 'http://weasley.teamspace.ad:8080',
      token: access_token
    });

    Request = api.request;
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
    spyOn(api, 'getToken').and.returnValue(null);

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


  it('Should fail if the data object cannot be stringifyed.', function () {

    // The follow code sets up an object with a cyclical reference. This will
    // cause the JSON stringify to fail.
    var video = {};
    var cover = {};
    var result;

    video.cover = cover;
    cover.video = video;

    var request = new api.request({
      url: api.config.host + api.config.videos,
      token: api.getToken(),
      method: 'POST',
      data: {test: true}
    });

    spyOn(Request.prototype, 'makeRequest').and.returnValue(null);

    result = Request.prototype.preparePostData(video);

    expect(result.success).toEqual(false);

  });

  it('Should fail if bad data is passed to makeRequest', function (done) {

    spyOn(Request.prototype, 'preparePostData').and.callFake(function () {
      return {
        success: false,
        data: null
      };
    });

    var request = new Request({
      url: api.config.host + api.config.videos,
      token: api.getToken(),
      method: 'POST',
      data: {test: true}
    });

    request.then(function (response) {

      expect(response).toBeUndefined();
      done();

    }, function (error) {

      expect(error).toBeDefined();
      expect(Request.prototype.preparePostData).toHaveBeenCalled();

      done();

    });

    // Ensure a promise was returned.
    expect(request.then).toBeDefined();

  });

});
