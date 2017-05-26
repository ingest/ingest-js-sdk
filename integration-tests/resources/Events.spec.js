'use strict';

var access_token = 'Bearer ' + window.token;

var api = new IngestAPI({
  host: 'http://weasley.teamspace.ad:8080',
  token: access_token
});

var mock = require('xhr-mock');

var eventsResource;

describe('Ingest API : Resource : Events', function () {
  beforeEach(function () {
    eventsResource = new api.eventsResource({
      host: api.config.host,
      resource: 'events',
      tokenSource: api.getToken.bind(api),
      cache: api.cache
    });

    // Re-enable cache each time.
    eventsResource.cache.enabled = true;
  });

  describe('getFilteredEvents', function () {
    it('Should retrieve filtered results for the given params', function (done) {
      var request;

      // Mock the XHR Object.
      mock.setup();

      mock.mock('GET', api.config.host + '/events?filter=new',
        function (request, response) {

          var data = {
            called: true
          };

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(data));
        });

      request = eventsResource.filter('new').then(function (response) {

        expect(response).toBeDefined();
        expect(response.data.called).toEqual(true);
        done();

      }, function (error) {

        expect(error).not.toBeDefined();
        done();

      });

      // Ensure a promise is returned.
      expect(request.then).toBeDefined();
    });

  });

  describe('getFilteredEventsByType', function () {
    it('Should retrieve filtered results for the given params', function (done) {
      var request;

      // Mock the XHR Object.
      mock.setup();

      mock.mock('GET', api.config.host + '/events?resource=videos',
        function (request, response) {

          var data = {
            called: true
          };

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(data));
        });

      request = eventsResource.filterByType('videos').then(function (response) {

        expect(response).toBeDefined();
        expect(response.data.called).toEqual(true);
        done();

      }, function (error) {

        expect(error).not.toBeDefined();
        done();

      });

      // Ensure a promise is returned.
      expect(request.then).toBeDefined();
    });

  });

});
