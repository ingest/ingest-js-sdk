var access_token = 'Bearer ' + window.token;

var api = new IngestAPI({
  host: 'http://weasley.teamspace.ad:8080',
  token: access_token
});

var mock = require('xhr-mock');
var videosResource;

var playlists = [
  {
    "id": "08628e63-5b49-4870-9daa-9cd87366350f",
    "url": "http://weasley.teamspace.ad:8080/playlist/08628e63-5b49-4870-9daa-9cd87366350f",
    "title": "More than 50 Videos"
  },
  {
    "id": "e24d0457-a783-40a1-af57-7475d34d7381",
    "url": "http://weasley.teamspace.ad:8080/playlist/e24d0457-a783-40a1-af57-7475d34d7381",
    "title": "Example Search"
  },
  {
    "id": "5f76ff01-24e4-4188-86b1-a626eb893840",
    "url": "http://weasley.teamspace.ad:8080/playlist/5f76ff01-24e4-4188-86b1-a626eb893840",
    "title": "Example Playlist"
  },
  {
    "id": "74016323-37db-462a-9ff9-6898bb6cfe31",
    "url": "http://weasley.teamspace.ad:8080/playlist/74016323-37db-462a-9ff9-6898bb6cfe31",
    "title": "Another Example Playlist"
  }
];

var variants = [
  {
    "id": "b1ede429-c623-4713-8442-d73c66a963a4",
    "name": "low",
    "duration": 734.167,
    "type": "hls",
    "video_id": "cd74a0df-3177-4a3e-9eb5-c890a90bd3e3",
    "profile_id": "0519d89d-ac2e-4cd7-938a-89c32e764c8a"
  },
  {
    "id": "626abeac-5389-4c91-9b7b-1c39b16e3ada",
    "name": "medium",
    "duration": 734.167,
    "type": "hls",
    "video_id": "cd74a0df-3177-4a3e-9eb5-c890a90bd3e3",
    "profile_id": "0519d89d-ac2e-4cd7-938a-89c32e764c8a"
  }
];

describe('Ingest API : Resource : Videos', function () {

  beforeEach(function () {

    videosResource = new api.videosResource({
      host: api.config.host,
      resource: 'users',
      tokenSource: api.getToken.bind(api),
      cache: api.cache
    });

  });

  describe('getPlaylists', function () {

    it('Should retrieve the playlists that a video belongs to.', function (done) {
      var url;

      mock.setup();

      url = api.utils.parseTokens(api.config.host + videosResource.config.playlists, {
        resource: videosResource.config.resource,
        id: 'test-id'
      });

      mock.mock('GET', url,
        function (request, response) {

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(playlists));

        });

      videosResource.getPlaylists('test-id').then(function (response) {
        expect(response).toBeDefined();
        expect(response.data).toEqual(playlists);
        done();
      }, function (error) {
        expect(error).not.toBeDefined();
        done();
      });

    });

    it('Should fail if an id is not supplied.', function (done) {

      videosResource.getPlaylists().then(function (response) {
        expect(response).not.toBeDefined();
        done();
      }, function (error) {
        expect(error).toBeDefined();
        done();
      });

    });

  });

  describe('getVariants', function () {

    it('Should retrieve the variants for the provided video.', function (done) {
      var url;

      mock.setup();

      url = api.utils.parseTokens(api.config.host + videosResource.config.variants, {
        resource: videosResource.config.resource,
        id: 'test-id'
      });

      mock.mock('GET', url,
        function (request, response) {

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(variants));

        });

      videosResource.getVariants('test-id').then(function (response) {
        expect(response).toBeDefined();
        expect(response.data).toEqual(variants);
        done();
      }, function (error) {
        expect(error).not.toBeDefined();
        done();
      });

    });

    it('Should fail if an id is not supplied.', function (done) {

      videosResource.getVariants().then(function (response) {
        expect(response).not.toBeDefined();
        done();
      }, function (error) {
        expect(error).toBeDefined();
        done();
      });

    });

  });

});
