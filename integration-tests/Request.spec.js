var api;

// Token will need to be re-generated every 24 hours.
var access_token = 'Bearer ' + window.token;

var mock = require('xhr-mock');
var Request;

describe('Ingest API : Request', function () {

  // Reset the auth token.
  beforeEach(function () {
    api = new IngestAPI({
      host: 'http://weasley.teamspace.ad:3000',
      token: access_token
    });

    Request = api.request;
  });

  it('Should reject the promise if the response is not valid JSON.', function (done) {

    mock.setup();

    var data = '"1';

    mock.get(api.config.host + '/videos',
      function (request, response) {

        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(data);
      });

    var request = api.videos.getAll().then(function (response) {

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

    api.videos.config.host = null;
    api.videos.config.all = null;

    var request = api.videos.getAll().then(function (response) {

      expect(response).toBeUndefined();
      done();

    }, function (error) {

      expect(error).toBeDefined();

      done();

    });

    // Ensure a promise was returned.
    expect(request.then).toBeDefined();

  });

  it('Should make a request even if a token is missing.', function (done) {

    api.token = null;

    // Mock the XHR object
    mock.setup();

    // Mock the response from the REST api.
    mock.get(api.config.host + '/videos',
      function (request, response) {

        // Restore the XHR object.
        mock.teardown();

        return response.status(200);

      });

    // Mock the call to getToken.
    spyOn(api, 'getToken').and.returnValue(null);

    var request = api.videos.getAll().then(function (response) {

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

    spyOn(Request.prototype, 'makeRequest').and.returnValue(null);

    result = Request.prototype.preparePostData(video);

    expect(result.success).toEqual(false);

  });

  it('Should fail if bad data is passed to makeRequest', function (done) {

    var request = new Request({
      url: api.config.host + '/videos',
      token: api.getToken(),
      method: 'POST',
      data: {test: true}
    });

    spyOn(request, 'preparePostData').and.callFake(function () {
      return {
        success: false,
        data: null
      };
    });

    request.send().then(function (response) {

      expect(response).toBeUndefined();
      done();

    }, function (error) {

      expect(error).toBeDefined();
      expect(request.preparePostData).toHaveBeenCalled();

      done();

    });

  });

  it('Should not stringify the postData if is passed as FormData', function () {
    var result;
    var formData = new FormData();
    formData.append('test', 'test-value');

    result = Request.prototype.preparePostData(formData);

    expect(result.success).toEqual(true);
    expect(result.type).toEqual('FormData');
    expect(result.data).toEqual(formData);
  });

  it('Should abort a request when cancel is called.', function () {

    // Mock the response from the REST api.
    mock.mock('POST', '/test' , function (request, response) {
      // Restore the XHR object.
      mock.teardown();
      return response.timeout(2000);
    });

    var request = new Request({
      url: '/test',
      method: 'POST'
    });

    spyOn(request, 'requestComplete');

    request.send().then(function (response) {
      expect(response).not.toBeDefined();
      done();
    }, function (error) {
      expect(error).toBeDefined();
      expect(request.requestComplete).not.toHaveBeenCalled();
      done();
    });

    request.cancel();

  });

});
