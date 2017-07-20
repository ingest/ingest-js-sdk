'use strict';

var IngestSDK = require('../../src/index');
var mock = require('xhr-mock');

var api = new IngestSDK();
var jobsResource;

describe('Ingest API : Resource : Jobs', function () {

  beforeEach(function () {

    jobsResource = new api.jobsResource({
      host: api.config.host,
      resource: 'encoding/jobs',
      tokenSource: api.getToken.bind(api)
    });
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
        'inputs': [
          '4844c970-c1a9-4fd6-9948-031229ef7e68'
        ],
        'profile': 'a5c71711-8c60-440a-9878-3cdf32ce3676'
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

      var request = jobsResource.add(jobRequest).then(function (response) {

        expect(response).toBeDefined();
        done();

      }, function (error) {

        expect(error).not.toBeDefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should add a new job.', function (done) {

      var jobRequest = {
        'video': '7539e3c0-9aec-4ee4-bcec-f11efc9b95ba',
        'inputs': [
          '4844c970-c1a9-4fd6-9948-031229ef7e68'
        ],
        'profile': 'a5c71711-8c60-440a-9878-3cdf32ce3676'
      };

      var jobResponse = {
        'id': '99b2ff4b-30e5-49df-87a7-e6f6899e8755',
        'url': 'https://www.someurl.com',
        'status': 0,
        'progress': 0,
        'profile': {
          'id': 'a5c71711-8c60-440a-9878-3cdf32ce3676',
          'url': 'https://www.someurl.com',
          'name': 'New Valid Profile for meeee-copy',
          'text_tracks': [],
          'data': {
            'playlists': [
              {
                'name': 'low',
                'version': 3,
                'byte_range': true,
                'renditions': [1, 2],
                'iframe_playlist': true
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

      var request = jobsResource.add(jobRequest).then(function (response) {

        expect(response).toBeDefined();
        expect(response.data).toBeDefined();
        expect(response.headers).toBeDefined();
        expect(typeof response.headers).toBe('function');
        expect(response.statusCode).toBeDefined();
        done();

      }, function (error) {

        expect(error).not.toBeDefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

  });

  describe('progress', function () {
    it('Should fail if a job id is not provided.', function (done) {
      jobsResource.progress().then(function (response) {
        expect(response).not.toBeDefined();
        done();
      }, function (error) {
        expect(error).toBeDefined();
        done();
      });
    });

    it('Should get a progress update', function (done) {
      var progressResponse, url;

      progressResponse = {
        'job_id': '6a928bac-d108-41f9-a0ee-e34181ac6119',
        'status': 'CREATED',
        'progress': 58
      }

      mock.setup();

      url = api.utils.parseTokens(api.config.host + jobsResource.config.progress, {
        resource: jobsResource.config.resource,
        id: '6a928bac-d108-41f9-a0ee-e34181ac6119'
      });

      // Mock the response from the REST api.
      mock.mock('GET', url, function (request, response) {
        // Restore the XHR object.
        mock.teardown();

        return response.status(200)
          .body(progressResponse);

      });

      var request = jobsResource.progress('6a928bac-d108-41f9-a0ee-e34181ac6119').then(function (response) {

        expect(response).toBeDefined();
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
