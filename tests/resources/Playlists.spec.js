'use strict';

var IngestAPI = require('../../src/index');

var access_token = 'Bearer ' + window.token;

var api = new IngestAPI({
  host: 'http://weasley.teamspace.ad:8080',
  token: access_token
});

var mock = require('xhr-mock');
var playlistsResource;

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

  describe('getById', function () {

    it('Should return a single playlist.', function (done) {
      var request;

      mock.setup();

      // Mock the response from the REST api.
      mock.mock('GET', api.config.host + '/playlists/12345', function (request, response) {
        // Restore the XHR object.
        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify({data: playlists[0]}));

      });

      request = playlistsResource.getById('12345').then(function (response) {

        expect(response).toBeDefined();
        expect(response.data).toBeDefined();

        done();

      }, function (error) {

        expect(error).toBeUndefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should fail if no ID is provided.', function (done) {
      var request = playlistsResource.getById('').then(function (response) {

        expect(response).toBeUndefined();
        done();

      }, function (error) {

        expect(error).toBeDefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('should fail if the passed in ID is not a string', function (done) {
      var request = playlistsResource.getById(1234).then(function (response) {

        expect(response).toBeUndefined();
        done();

      }, function (error) {

        expect(error).toBeDefined();
        done();

      });

      expect(request.then).toBeDefined();
    });

    it('Should retrieve all playlists with a specific video status', function (done) {

      var url, request;

      mock.setup();

      // Mock the response from the REST api.
      mock.mock('GET', api.config.host + '/playlists/12345?video.status=all',
        function (request, response) {
          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .body(JSON.stringify(playlists[0]));
        });

      request = playlistsResource.getById('12345', 'all').then(function (response) {
        expect(response).toBeDefined();
        expect(response.data).toBeDefined();
        expect(response.headers).toBeDefined();
        expect(typeof response.headers).toBe('function');
        expect(response.statusCode).toBeDefined();

        done();
      }, function (error) {
        expect(error).toBeUndefined();
        done();
      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should error if it has a status that is not a string', function () {
      var request = playlistsResource.getById('12345', true).then(function (response) {
        expect(response).not.toBeDefined();
        done();
      }, function (error) {
        expect(error).toBeDefined();
        done();
      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

  });

  describe('addVideos', function () {

    it('Should fail if "playlistId" is not supplied as a string.', function (done) {

      var playlistId, videoId;

      playlistId = null;
      videoId = [videos[0].id];

      playlistsResource.addVideos(playlistId, videoId).then(function (response) {

        expect(response).not.toBeDefined();
        done();

      }, function (error) {

        expect(error).toBeDefined();
        expect(error).toMatch(/addVideo requires "playlistId" be a string./);
        done();

      });

    });

    it('Should fail if "videoId" is not supplied as an array.', function (done) {

      var playlistId, videoId;

      playlistId = playlists[0].id;
      videoId = null;

      playlistsResource.addVideos(playlistId, videoId).then(function (response) {

        expect(response).not.toBeDefined();
        done();

      }, function (error) {

        expect(error).toBeDefined();
        expect(error).toMatch(/addVideo requires "videoId" be an array of videoIds./);
        done();

      });

    });

    it('Should add the given video if the optional "position" parameter is not supplied as a number.', function (done) {

      var playlistId, videoId, requestURL, position;

      playlistId = playlists[0].id;
      videoId = [videos[0].id];
      position = null;

      requestURL = api.utils.parseTokens(api.config.host + playlistsResource.config.playlistAddRemove, {
        resource: playlistsResource.config.resource,
        playlistId: playlistId
      });

      mock.setup();

      mock.mock('POST', requestURL, function (request, response) {
        var body;

        mock.teardown();

        // A position value should *not* have been sent.
        body = JSON.parse(request._body);
        expect(body.position).not.toBeDefined();

        return response
          .status(201)
          .body(playlists[0]);

      });

      playlistsResource.addVideos(playlistId, videoId, position).then(function (response) {

        expect(response).toBeDefined();
        expect(response.statusCode).toEqual(201);
        done();

      }, function (error) {

        expect(error).not.toBeDefined();
        done();

      });

    });

    it('Should add the given video to the given playlist at the given position.', function (done) {

      var playlistId, videoId, requestURL, position;

      playlistId = playlists[0].id;
      videoId = [videos[0].id];
      position = 3;

      requestURL = api.utils.parseTokens(api.config.host + playlistsResource.config.playlistAddRemove, {
        resource: playlistsResource.config.resource,
        playlistId: playlistId
      });

      mock.setup();

      mock.mock('POST', requestURL, function (request, response) {
        var body;

        mock.teardown();

        // A position value should have been sent in the request body.
        body = JSON.parse(request._body);
        expect(body.position).toEqual(position);

        return response
          .status(201)
          .body(playlists[0]);

      });

      playlistsResource.addVideos(playlistId, videoId, position).then(function (response) {

        expect(response).toBeDefined();
        expect(response.statusCode).toEqual(201);
        done();

      }, function (error) {

        expect(error).not.toBeDefined();
        done();

      });

    });

  });

  describe('removeVideo', function () {

    it('Should fail if "playlistId" is not supplied as a string.', function (done) {

      var playlistId, videoId, position;

      playlistId = null;
      videoId = videos[0].id;
      position = 3;

      playlistsResource.removeVideos(playlistId, videoId, position).then(function (response) {

        expect(response).not.toBeDefined();
        done();

      }, function (error) {

        expect(error).toBeDefined();
        expect(error).toMatch(/removeVideo requires "playlistId" to be a string./);
        done();

      });

    });

    it('Should fail if "videoId" is not supplied as an array.', function (done) {

      var playlistId, videoId, position;

      playlistId = playlists[0].id;
      videoId = null;
      position = 3;

      playlistsResource.removeVideos(playlistId, videoId, position).then(function (response) {

        expect(response).not.toBeDefined();
        done();

      }, function (error) {

        expect(error).toBeDefined();
        expect(error).toMatch(/removeVideo requires "videos" be an array of video objects./);
        done();

      });

    });

    it('Should successfully remove the given video from the given playlist at the given position.', function (done) {

      var playlistId, videoId, position, requestURL;

      playlistId = playlists[0].id;
      videoId = [videos[0].id];
      position = 3;

      requestURL = api.utils.parseTokens(api.config.host + playlistsResource.config.playlistAddRemove, {
        resource: playlistsResource.config.resource,
        playlistId: playlistId
      });

      mock.setup();

      mock.mock('DELETE', requestURL, function (request, response) {
        var body;

        mock.teardown();

        return response.status(200);

      });

      playlistsResource.removeVideos(playlistId, videoId).then(function (response) {

        expect(response).toBeDefined();
        expect(response.statusCode).toEqual(200);
        done();

      }, function (error) {

        expect(error).not.toBeDefined();
        done();

      });

    });

  });

  describe('reorderVideo', function () {

    it('Should fail if "playlistId" is not supplied as a string.', function (done) {

      var playlistId, videoId, oldPosition, newPosition;

      playlistId = null;
      videoId = 'test';
      oldPosition = 3;
      newPosition = 4;

      playlistsResource.reorderVideo(playlistId, videoId, oldPosition, newPosition).then(function (response) {

        expect(response).not.toBeDefined();
        done();

      }, function (error) {

        expect(error).toBeDefined();
        expect(error).toMatch(/reorderVideo requires "playlistId" to be a string/);
        done();

      });

    });

    it('Should fail if "videoId" is not supplied as a string.', function (done) {

      var playlistId, videoId, oldPosition, newPosition;

      playlistId = playlists[0].id;
      videoId = null;
      oldPosition = 3;
      newPosition = 4;

      playlistsResource.reorderVideo(playlistId, videoId, oldPosition, newPosition).then(function (response) {

        expect(response).not.toBeDefined();
        done();

      }, function (error) {

        expect(error).toBeDefined();
        expect(error).toMatch(/reorderVideo requires "videoId" to be a string/);
        done();

      });

    });

    it('Should fail if "oldPosition" is not supplied as a number.', function (done) {

      var playlistId, videoId, oldPosition, newPosition;

      playlistId = playlists[0].id;
      videoId = 'test';
      oldPosition = null;
      newPosition = 4;

      playlistsResource.reorderVideo(playlistId, videoId, oldPosition, newPosition).then(function (response) {

        expect(response).not.toBeDefined();
        done();

      }, function (error) {

        expect(error).toBeDefined();
        expect(error).toMatch(/reorderVideo requires "oldPosition" and "newPosition" to be numbers/);
        done();

      });

    });

    it('Should fail if "newPosition" is not supplied as a number.', function (done) {

      var playlistId, videoId, oldPosition, newPosition;

      playlistId = playlists[0].id;
      videoId = 'test';
      oldPosition = 3;
      newPosition = null;

      playlistsResource.reorderVideo(playlistId, videoId, oldPosition, newPosition).then(function (response) {

        expect(response).not.toBeDefined();
        done();

      }, function (error) {

        expect(error).toBeDefined();
        expect(error).toMatch(/reorderVideo requires "oldPosition" and "newPosition" to be numbers/);
        done();

      });

    });

    it('Should successfully re-order the given playlist based on the given positions.', function (done) {

      var playlistId, videoId, oldPosition, newPosition, requestURL;

      playlistId = playlists[0].id;
      videoId = 'test';
      oldPosition = 3;
      newPosition = 4;

      requestURL = api.utils.parseTokens(api.config.host + playlistsResource.config.playlistReorder, {
        resource: playlistsResource.config.resource,
        playlistId: playlistId,
        videoId: videoId
      });

      mock.setup();

      mock.mock('PUT', requestURL, function (request, response) {
        var body;

        mock.teardown();

        // Expect new and old positions in the request body.
        body = JSON.parse(request._body);

        expect(body).toEqual({
          old_position: oldPosition,
          new_position: newPosition
        });

        return response.status(200);

      });

      playlistsResource.reorderVideo(playlistId, videoId, oldPosition, newPosition).then(function (response) {

        expect(response).toBeDefined();
        expect(response.statusCode).toEqual(200);
        done();

      }, function (error) {

        expect(error).not.toBeDefined();
        done();

      });

    });

  });

});
