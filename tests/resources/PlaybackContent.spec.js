'use strict';

var IngestSDK = require('../../src/index');
var mock = require('xhr-mock');

var api = new IngestSDK();
var playbackContent;

var image = 'https://mango.blender.org/wp-content/gallery/4k-renders/02_dome.jpg?5421dd';

var thumbnail = {
  'thumbnail_id': '2eee6343-490e-49c5-9437-47fb09f27b7b',
  'thumbnail_url': 'https://www.someurl.com',
  'thumbnail_type': 'user'
};

describe('Ingest API : Resource : Videos', function () {

  beforeEach(function () {

    playbackContent = new api.playbackContent({
      host: api.config.host,
      resource: 'videos',
      tokenSource: api.getToken.bind(api)
    });

  });

  describe('getThumbnails', function () {

    it('Should fail if an id is not provided.', function (done) {

      var request = playbackContent.getThumbnails().then(function (response) {

        expect(response).toBeUndefined();
        done();

      }, function (error) {

        expect(error).toBeDefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

    it('Should return a list of thumbnails.', function (done) {

      // Mock the XHR object.
      mock.setup();

      var data = [
        {
          'thumbnail_id':'a7d6da39-5d2e-4ff7-a5a1-b6b5da0ba124',
          'thumbnail_url':'https://www.someurl.com/poster01.jpg',
          'thumbnail_type':'system'
        },
        {
          'thumbnail_id':'969620c5-ea68-4b54-bdec-3300242b5eeb',
          'thumbnail_url':'https://www.someurl.com/poster02.jpg',
          'thumbnail_type':'system'
        },
        {
          'thumbnail_id':'6f5dbf2f-f9e5-406c-8856-aaf6daa9947e',
          'thumbnail_url':'https://www.someurl.com/poster03.jpg',
          'thumbnail_type':'system'
        },
        {
          'thumbnail_id':'5bf0fddc-39dd-4630-913c-2e3582c781ad',
          'thumbnail_url':'https://www.someurl.com/poster04.jpg',
          'thumbnail_type':'system'
        }
      ];

      // Mock the response from the REST api.
      mock.mock('GET', api.config.host + '/videos/a-video-id/thumbnails',
        function (request, response) {

          // Restore the XHR object.
          mock.teardown();

          return response.status(200)
            .header('Content-Type', 'application/json')
            .header('Content-Length', 1)
            .body(JSON.stringify(data));

        });

      var request = playbackContent.getThumbnails('a-video-id').then(function (response) {

        expect(response).toBeDefined();
        expect(response.data.length).toEqual(4);
        done();

      }, function (error) {

        expect(error).toBeUndefined();
        done();

      });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();
    });

  });

  describe('addExternalThumbnails', function () {

    it('Should add the provided thumbnail to the video item.', function (done) {

      var url;

      // Mock the XHR
      mock.setup();

      url = api.utils.parseTokens(api.config.host + playbackContent.config.thumbnails, {
        resource: playbackContent.config.resource,
        id: 'test-id'
      });

      mock.mock('POST', url, function (request, response) {
        mock.teardown();
        return response.status(201).body(thumbnail);
      });

      playbackContent.addExternalThumbnails('test-id', image)
        .then(function (response) {
          expect(response).toBeDefined();
          done();
        }, function (error) {
          expect(error).not.toBeDefined();
          done();
        });

    });

    it('Should add the provided thumbnails[array] to the video item.', function (done) {

      var url;

      // Mock the XHR
      mock.setup();

      url = api.utils.parseTokens(api.config.host + playbackContent.config.thumbnails, {
        resource: playbackContent.config.resource,
        id: 'test-id'
      });

      mock.mock('POST', url, function (request, response) {
        mock.teardown();
        return response.status(201).body([thumbnail, thumbnail]);
      });

      playbackContent.addExternalThumbnails('test-id', [image, image])
        .then(function (response) {
          expect(response).toBeDefined();
          expect(response.data.length).toEqual(2);
          done();
        }, function (error) {
          expect(error).not.toBeDefined();
          done();
        });

    });

    it('Should fail if an id is not provided as a string', function (done) {

      playbackContent.addExternalThumbnails().then(function (response) {
        expect(response).not.toBeDefined();
        done();
      }, function (error) {
        expect(error).toBeDefined();
        done();
      });

    });

    it('Should fail if images are not provided as a string, or an array', function (done) {

      playbackContent.addExternalThumbnails('test-id', 1).then(function (response) {
        expect(response).not.toBeDefined();
        done();
      }, function (error) {
        expect(error).toBeDefined();
        done();
      });

    });

  });

  describe('uploadThumbnail', function () {

    it('Should fail if an id is not passed as a string.', function (done) {
      playbackContent.uploadThumbnail().then(function (response) {
        expect(response).not.toBeDefined();
        done();
      }, function (error) {
        expect(error).toBeDefined();
        done();
      });
    });

    it('Should fail without a proper image.', function (done) {

      var url;

      var file = new File([], 1000000);

      // Mock the XHR
      mock.setup();

      url = api.utils.parseTokens(api.config.host + playbackContent.config.thumbnail, {
        resource: playbackContent.config.resource,
        id: 'test-id'
      });

      mock.mock('POST', url, function (request, response) {
        mock.teardown();
        return response.status(201).body(thumbnail);
      });

      playbackContent.uploadThumbnail('test-id', file).then(function (response) {
        expect(response.data).not.toBeDefined();
        done();
      }, function (error) {
        expect(error).toBeDefined();
        done();
      });

    });

    it('Should upload an image.', function (done) {

      var url;

      var file = new File([], 1000000, {type: 'image/jpeg'});

      // Mock the XHR
      mock.setup();

      url = api.utils.parseTokens(api.config.host + playbackContent.config.thumbnail, {
        resource: playbackContent.config.resource,
        id: 'test-id'
      });

      mock.mock('POST', url, function (request, response) {
        mock.teardown();
        return response.status(201).body(thumbnail);
      });

      playbackContent.uploadThumbnail('test-id', file).then(function (response) {
        expect(response.data).toEqual(thumbnail);
        done();
      }, function (error) {
        expect(error).not.toBeDefined();
        done();
      });

    });

  });

  describe('deleteThumbnail', function () {

    it('Should fail if an ID is not passed as a string.', function (done) {
      playbackContent.deleteThumbnail().then(function (response) {
        expect(response).not.toBeDefined();
        done();
      }, function (error) {
        expect(error).toBeDefined();
        done();
      });
    });

    it('Should fail if a thumbnailId is not passed as a string.', function (done) {
      playbackContent.deleteThumbnail('test-id').then(function (response) {
        expect(response).not.toBeDefined();
        done();
      }, function (error) {
        expect(error).toBeDefined();
        done();
      });
    });

    it('Should call the api to delete the thumbnail', function (done) {

      var url;

      // Mock the XHR
      mock.setup();

      url = api.utils.parseTokens(api.config.host + playbackContent.config.deleteThumbnail, {
        resource: playbackContent.config.resource,
        id: 'test-id',
        thumbnailId: 'test-thumbnail-id'
      });

      mock.mock('DELETE', url, function (request, response) {
        mock.teardown();
        return response.status(200).body([]);
      });

      playbackContent.deleteThumbnail('test-id', 'test-thumbnail-id').then(function (response) {
        expect(response).toBeDefined();
        done();
      }, function (error) {
        expect(error).not.toBeDefined();
        done();
      });

    });

  });

});
