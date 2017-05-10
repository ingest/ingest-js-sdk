'use strict';

var access_token = 'Bearer ' + window.token;

var api = new IngestAPI({
  host: 'http://weasley.teamspace.ad:8080',
  token: access_token
});

var mock = require('xhr-mock');
var inputsResource;

describe('Ingest API : Resource : Events', function () {
  beforeEach(function () {

    eventsResource = new api.eventsResource({
      host: api.config.host,
      resource: '/events',
      tokenSource: api.getToken.bind(api),
      cache: api.cache
    });

    // Re-enable cache each time.
    eventsResource.cache.enabled = true;
  });
});
