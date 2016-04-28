var access_token = 'Bearer ' + window.token;

var api = new IngestAPI({
  host: 'http://weasley.teamspace.ad:8080',
  token: access_token
});

var mock = require('xhr-mock');
var videosResource;

var playlists = [
  {
    'id': '5f76ff01-24e4-4188-86b1-a626eb893840',
    'url': 'http://weasley.teamspace.ad:8080/playlist/08628e63-5b49-4870-9daa-9cd87366350f',
    'title': 'More than 50 Videos'
  },
  {
    'id': 'e24d0457-a783-40a1-af57-7475d34d7381',
    'url': 'http://weasley.teamspace.ad:8080/playlist/e24d0457-a783-40a1-af57-7475d34d7381',
    'title': 'Example Search'
  },
  {
    'id': '5f76ff01-24e4-4188-86b1-a626eb893840',
    'url': 'http://weasley.teamspace.ad:8080/playlist/5f76ff01-24e4-4188-86b1-a626eb893840',
    'title': 'Example Playlist'
  },
  {
    'id': '74016323-37db-462a-9ff9-6898bb6cfe31',
    'url': 'http://weasley.teamspace.ad:8080/playlist/74016323-37db-462a-9ff9-6898bb6cfe31',
    'title': 'Another Example Playlist'
  }
];

var videos = [
  {
    'id': 'bc627c5f-34d4-4acc-9307-499c7f51f8a8',
    'poster': {},
    'author': {},
    'updater': {},
    'variants': [
      {
        'id': 'ee5fe60d-bf11-4e21-9bbc-52ffb6c20826',
        'name': 'low',
        'duration': 734.167,
        'type': 'hls',
        'video_id': 'a0e28c29-8c66-4588-8353-e37d003d1065',
        'profile_id': '403c508c-b556-48dc-89e5-d234a4e1e383'
      },
      {
        'id': 'df44105c-16e9-4557-8ff4-0fdf5ce3d194',
        'name': 'medium',
        'duration': 734.167,
        'type': 'hls',
        'video_id': 'a0e28c29-8c66-4588-8353-e37d003d1065',
        'profile_id': '403c508c-b556-48dc-89e5-d234a4e1e383'
      }
    ]
  },
  {
    'id': 'cd74a0df-3177-4a3e-9eb5-c890a90bd3e3',
    'poster': {},
    'author': {},
    'updater': {},
    'variants': [
      {
        'id': 'b1ede429-c623-4713-8442-d73c66a963a4',
        'name': 'low',
        'duration': 734.167,
        'type': 'hls',
        'video_id': 'cd74a0df-3177-4a3e-9eb5-c890a90bd3e3',
        'profile_id': '0519d89d-ac2e-4cd7-938a-89c32e764c8a'
      },
      {
        'id': '626abeac-5389-4c91-9b7b-1c39b16e3ada',
        'name': 'medium',
        'duration': 734.167,
        'type': 'hls',
        'video_id': 'cd74a0df-3177-4a3e-9eb5-c890a90bd3e3',
        'profile_id': '0519d89d-ac2e-4cd7-938a-89c32e764c8a'
      }
    ]
  }
];

describe('Ingest API : Resource : Playlists', function () {

  beforeEach(function () {

    playlistsResource = new api.playlistsResource({
      host: api.config.host,
      resource: 'playlists',
      tokenSource: api.getToken.bind(api),
      cache: api.cache
    });

  });

  describe('link', function () {

    it('Should link a single video to a playlist.', function (done) {

      var url = api.utils.parseTokens(api.config.host + playlistsResource.config.byId, {
        resource: playlistsResource.config.resource,
        id: playlists[0].id
      });

      mock.setup();

      mock.mock('LINK', url, function (request, response) {

        mock.teardown();

        return response
          .status(200)
          .body("");

      });

      playlistsResource.link(playlists[0].id, videos[0]).then(function (response) {
        expect(response).toBeDefined();
        done();
      }, function (error) {
        expect(error).not.toBeDefined();
        done();
      });

    });

    it('Should link an array of videos to a playlist.', function (done) {

      var url = api.utils.parseTokens(api.config.host + playlistsResource.config.byId, {
        resource: playlistsResource.config.resource,
        id: playlists[0].id
      });

      mock.setup();

      mock.mock('LINK', url, function (request, response) {

        mock.teardown();

        return response
          .status(200)
          .body(JSON.stringify(""));

      });

      playlistsResource.link(playlists[0].id, videos).then(function (response) {
        expect(response).toBeDefined();
        done();
      }, function (error) {
        expect(error).not.toBeDefined();
        done();
      });

    });

  });

  describe('unlink', function () {

    it('Should unlink a single video from a playlist.', function (done) {

      var url = api.utils.parseTokens(api.config.host + playlistsResource.config.byId, {
        resource: playlistsResource.config.resource,
        id: playlists[0].id
      });

      mock.setup();

      mock.mock('UNLINK', url, function (request, response) {

        mock.teardown();

        return response
          .status(200)
          .body("");

      });

      playlistsResource.unlink(playlists[0].id, videos[0]).then(function (response) {
        expect(response).toBeDefined();
        done();
      }, function (error) {
        expect(error).not.toBeDefined();
        done();
      });

    });

    it('Should unlink an array of videos from a playlist.', function (done) {

      var url = api.utils.parseTokens(api.config.host + playlistsResource.config.byId, {
        resource: playlistsResource.config.resource,
        id: playlists[0].id
      });

      mock.setup();

      mock.mock('UNLINK', url, function (request, response) {

        mock.teardown();

        return response
          .status(200)
          .body(JSON.stringify(""));

      });

      playlistsResource.unlink(playlists[0].id, videos).then(function (response) {
        expect(response).toBeDefined();
        done();
      }, function (error) {
        expect(error).not.toBeDefined();
        done();
      });

    });

  });

  describe('_linkVideos', function () {

    it('Should fail if a link value is not provided.', function (done) {

      playlistsResource._linkVideos().then(function (response) {
        expect(response).not.toBeDefined();
        done();
      }, function (error) {
        expect(error).toBeDefined();
        expect(error).toEqual('IngestAPI Playlists link requires a valid link flag passed as a boolean.'); // eslint-disable-line
        done();
      });

    });

    it('Should fail if a playlistId is not provided.', function (done) {

      playlistsResource._linkVideos(true).then(function (response) {
        expect(response).not.toBeDefined();
        done();
      }, function (error) {
        expect(error).toBeDefined();
        expect(error).toEqual('IngestAPI Playlists link requires a valid playlistId passed as a string.'); // eslint-disable-line
        done();
      });

    });

    it('Should fail if videos are not provided.', function (done) {

      playlistsResource._linkVideos(true, 'test-id').then(function (response) {
        expect(response).not.toBeDefined();
        done();
      }, function (error) {
        expect(error).toBeDefined();
        expect(error).toEqual('IngestAPI Playlists link requires a valid video passed as a valid object or array.'); // eslint-disable-line
        done();
      });

    });

    it('Should fail if videos are null.', function (done) {

      playlistsResource._linkVideos(true, 'test-id', null).then(function (response) {
        expect(response).not.toBeDefined();
        done();
      }, function (error) {
        expect(error).toBeDefined();
        expect(error).toEqual('IngestAPI Playlists link requires a valid video passed as a valid object or array.'); // eslint-disable-line
        done();
      });

    });

    it('Should fail if videos are of the wrong type.', function (done) {

      playlistsResource._linkVideos(true, 'test-id', 1).then(function (response) {
        expect(response).not.toBeDefined();
        done();
      }, function (error) {
        expect(error).toBeDefined();
        expect(error).toEqual('IngestAPI Playlists link requires a valid video passed as a valid object or array.'); // eslint-disable-line
        done();
      });

    });

    it('Should fail if an empty array of is provided.', function (done) {

      playlistsResource._linkVideos(true, 'test-id', []).then(function (response) {
        expect(response).not.toBeDefined();
        done();
      }, function (error) {
        expect(error).toBeDefined();
        expect(error).toEqual('IngestAPI Playlists link requires at least one video to link.');
        done();
      });

    });

  });

});
