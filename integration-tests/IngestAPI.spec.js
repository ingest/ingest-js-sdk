var api;
// Token will need to be re-generated every 24 hours.
var access_token = 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovLyouaW5nZXN0LmlvIiwiY2lkIjoiSW5nZXN0RGV2IiwiZXhwIjoxNDQ1MzQ0MDI3LCJqdGkiOiJmMWMyNjA2OS1mMTA3LTRhNjItOTQxNy01MWU2ZWQ2NmQ5Y2QiLCJpYXQiOjE0NDUyNTc2MjcsImlzcyI6Imh0dHBzOi8vbG9naW4uaW5nZXN0LmlvIiwibnR3IjoicmVkc3BhY2UiLCJzY29wZSI6eyJ1c2VyIjp7ImFjdGlvbnMiOm51bGx9fSwic3ViIjoiN2U2YTg0YWItN2Y5ZS00NzBlLTgyZTctNmRkM2Q5ZWM2MTJjIn0.lgZ_T8m-VkpuH_G09iqrzNHihLAmdL8R_WIRSh_40w8UZoCO2GkvWresFDVkI1vKnzmnbNdtkwFfFbSSU8jkeTZ_MS7doV5LwdAAXahSw8a59ZBAWthmjr4_Bxie8ITn18R97sQXmvX3f5DRPDEokFiVEUNUwrRvnzTA9Mw2XPsj-HFMOkBKw1NWe4PlhxKf6pOYwvhQFhYN5757yHD8V59VOVhPfVbE-XSIThs2HKSLNJrBY-792TKh997w4vF8JcI6-RTHm5TNNPh_8UogkY8IETp3UEIBv78wL0RzLcWZYnK1y0CcU1oNa6C0nAH1-4HKl7hbSzR04KN_nCyvPA'; // eslint-disable-line
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

    it('Should fail if there is no token is set.', function (done) {

      api.setToken('');

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
