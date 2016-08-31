'use strict';

var access_token = 'Bearer ' + window.token;

var api = new IngestAPI({
  host: 'http://weasley.teamspace.ad:8080',
  token: access_token
});

var mock = require('xhr-mock');
var jobsResource;

describe('Ingest API : Resource : Jobs', function () {

  beforeEach(function () {

    jobsResource = new api.jobsResource({
      host: api.config.host,
      resource: 'encoding/jobs',
      tokenSource: api.getToken.bind(api),
      cache: api.cache
    });

    // Re-enable cache each time.
    jobsResource.cache.enabled = true;
  });

  describe('add', function () {

    it('Should fail if a resource is not provided.', function (done) {
      jobsResource.add().then(function (response) {
        expect(response).not.toBeDefined();
        done();
      }, function (error) {
        expect(error).toBeDefined();
        done();
      });
    });

    it('Should add a new job.', function (done) {
      var jobRequest = {
        "inputs": [
          "4844c970-c1a9-4fd6-9948-031229ef7e68"
        ],
        "profile": "a5c71711-8c60-440a-9878-3cdf32ce3676"
      };

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST api.
      mock.mock('POST', api.config.host + '/encoding/jobs' , function (request, response) {
        // Restore the XHR object.
        mock.teardown();

        return response.status(200)
          .body([]);

      });

      spyOn(jobsResource, '_deleteCachedResource');

      var request = jobsResource.add(jobRequest).then(function (response) {

        expect(response).toBeDefined();
        expect(jobsResource._deleteCachedResource).not.toHaveBeenCalled();

        done();

      }, function (error) {

        expect(error).not.toBeDefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should remove cached version of linked video and add a new job.', function (done) {

      var jobRequest = {
        "video": "7539e3c0-9aec-4ee4-bcec-f11efc9b95ba",
        "inputs": [
          "4844c970-c1a9-4fd6-9948-031229ef7e68"
        ],
        "profile": "a5c71711-8c60-440a-9878-3cdf32ce3676"
      };

      var jobResponse = {
        "id": "99b2ff4b-30e5-49df-87a7-e6f6899e8755",
        "url": "http://weasley.teamspace.ad:8080/encoding/jobs/99b2ff4b-30e5-49df-87a7-e6f6899e8755",
        "status": 0,
        "progress": 0,
        "profile": {
          "id": "a5c71711-8c60-440a-9878-3cdf32ce3676",
          "url": "http://weasley.teamspace.ad:8080/encoding/profiles/a5c71711-8c60-440a-9878-3cdf32ce3676",
          "name": "New Valid Profile for meeee-copy",
          "text_tracks": [],
          "data": {
            "playlists": [
              {
                "name": "low",
                "version": 3,
                "byte_range": true,
                "renditions": [1, 2],
                "iframe_playlist": true
              }
            ]
          }
        }
      };

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST api.
      mock.mock('POST', api.config.host + '/encoding/jobs' , function (request, response) {
        // Restore the XHR object.
        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify(jobResponse));

      });

      spyOn(jobsResource, '_deleteCachedResource');

      var request = jobsResource.add(jobRequest).then(function (response) {

        expect(response).toBeDefined();
        expect(response.data).toBeDefined();
        expect(response.headers).toBeDefined();
        expect(typeof response.headers).toBe('function');
        expect(response.statusCode).toBeDefined();

        expect(jobsResource._deleteCachedResource).toHaveBeenCalledWith(jobRequest.video);

        done();

      }, function (error) {

        expect(error).not.toBeDefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

  });

});
