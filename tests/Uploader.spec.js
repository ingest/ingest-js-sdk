// TODO: Remove all usage of jasmine.Ajax

'use strict';

var IngestSDK = require('../src/index');
var mock = require('xhr-mock');
var jasmineAjax = require('jasmine-ajax');

var api, utils, Request;
var Uploader, file, upload;

describe('Ingest API : Uploader', function () {

  // Reset the auth token.
  beforeEach(function () {
    api = new IngestSDK();

    utils = api.utils;

    Uploader = api.uploader;

    // Create a mock file.
    file = new File(['testfilewithsometestcontent'], 'testfile', {
      type: 'video/mp4'
    });

    upload = new Uploader({
      file: file,
      api: api,
      host: api.config.host
    });

  });

  it('Should expose the required functions.', function () {

    var required = [
      'progress',
      'save',
      'abort'
    ];

    var requiredLength = required.length;
    var i, func;

    for (i = 0; i < requiredLength; i++) {
      func = required[i];
      expect(Uploader.prototype[func]).toBeDefined();
    }

  });

  it('Should populate the fileRecord.', function () {
    expect(upload.fileRecord.filename).toEqual('testfile');
    expect(upload.fileRecord.method).toEqual(false);
    expect(upload.fileRecord.size).toEqual(27);
    expect(upload.fileRecord.type).toEqual('video/mp4');
  });

  describe('progress', function () {
    it('Should set the callback function for progress', function () {

      var test = {
        progress: function () {}
      };

      spyOn(test, 'progress');

      upload.progress(test.progress);

      expect(upload.config.progress).toBeDefined();

      upload._updateProgress();

      expect(test.progress).toHaveBeenCalled();

    });

    it('Should not fail if a progress function is not defined', function () {
      expect(upload._updateProgress.bind(upload)).not.toThrow();
    });
  });

  describe('save', function () {

    it('Should call the proper sequence of functions.', function (done) {

      spyOn(upload, '_create').and.callFake(function () {
        return utils.promisify(true, []);
      });

      spyOn(upload, '_initialize').and.callFake(function () {
        return utils.promisify(true, []);
      });

      spyOn(upload, '_prepareUpload').and.callFake(function () {
        return utils.promisify(true, []);
      });

      upload.save().then(function () {
        expect(upload._create).toHaveBeenCalled();
        expect(upload._initialize).toHaveBeenCalled();
        expect(upload._prepareUpload).toHaveBeenCalled();

        done();
      }, function (error) {
        expect(error).toBeUndefined();
        done();
      });

    });
  });

  describe('create', function () {

    it('Should create an input', function (done) {

      spyOn(api.inputs, 'add').and.callFake(function (record) {
        return utils.promisify(true, {data: {id: 'test-id'}});
      });

      upload._create(upload.fileRecord).then(function (id) {
        expect(api.inputs.add).toHaveBeenCalled();
        expect(id).toEqual('test-id');
        done();
      }, function (error) {
        expect(error).not.toBeDefined();
        done();
      });

    });

    it('Should not create an input if the upload has been aborted', function () {

      spyOn(api.inputs, 'add');

      upload.aborted = true;

      expect(upload._create.bind(upload, upload.fileRecord)).not.toThrow();

      expect(api.inputs.add).not.toHaveBeenCalled();

    });

    it('Should not create an input if the input has already been created.', function () {
      spyOn(api.inputs, 'add');

      upload.created = true;

      expect(upload._create.bind(upload, upload.fileRecord)).not.toThrow();

      expect(api.inputs.add).not.toHaveBeenCalled();
    });
  });

  describe('initialize', function () {

    it('Should initialize a multipart upload', function (done) {

      // Mock a larger multipart file.
      upload.fileRecord.method = true;
      upload.fileRecord.size = 99999999;
      upload.fileRecord.id = 'test-id';

      mock.setup();

      var url = utils.parseTokens(api.config.host + upload.config.upload, {
        id: 'test-id',
        method: ''
      });

      mock.mock('POST', url, function (request, response) {

        mock.teardown();

        var data = JSON.stringify({
          key: 'testkey',
          uploadId: 'testuploadid',
          pieceSize: 5000,
          pieceCount: 10
        });

        return response.status(201)
          .header('Content-Type', 'application/json')
          .body(data);

      });

      spyOn(upload, '_initializeComplete').and.callThrough();

      upload._initialize().then(function (response) {
        expect(upload._initializeComplete).toHaveBeenCalled();

        expect(upload.chunkSize).toEqual(5000);
        expect(upload.chunkCount).toEqual(10);
        expect(upload.fileRecord.uploadId).toEqual('testuploadid');
        expect(upload.fileRecord.key).toEqual('testkey');

        done();
      }, function (error) {
        expect(error).not.toBeDefined();
        done();
      });

    });

    it('Should initialize a singlepart upload', function (done) {

      // Mock a larger multipart file.
      upload.fileRecord.method = false;
      upload.fileRecord.size = 500;
      upload.fileRecord.id = 'test-id';

      mock.setup();

      var url = utils.parseTokens(api.config.host + upload.config.upload, {
        id: 'test-id',
        method: '?type=amazon'
      });

      mock.mock('POST', url, function (request, response) {

        mock.teardown();

        var data = JSON.stringify({
          key: 'testkey',
          uploadId: 'testuploadid',
          pieceSize: 500
        });

        return response.status(201)
          .header('Content-Type', 'application/json')
          .body(data);

      });

      spyOn(upload, '_initializeComplete').and.callThrough();

      upload._initialize().then(function (response) {
        expect(upload._initializeComplete).toHaveBeenCalled();

        expect(upload.chunkSize).toEqual(500);
        expect(upload.fileRecord.uploadId).toEqual('testuploadid');
        expect(upload.fileRecord.key).toEqual('testkey');

        done();
      }, function (error) {
        expect(error).not.toBeDefined();
        done();
      });

    });

    it('Should not try to initialize if the upload has been aborted', function (done) {

      upload.aborted = true;

      spyOn(utils, 'parseTokens');

      var result = upload._initialize().then(function (result) {
        expect(result).not.toBeDefined();
        done();
      }, function (error) {
        expect(error).toBeDefined();
        expect(utils.parseTokens).not.toHaveBeenCalled();
        done();
      });

    });
  });

  describe('prepareUpload', function () {
    it('Should call uploadFile on single part uploads.', function () {
      spyOn(upload, '_uploadFile').and.callFake(function () {
        return utils.promisify(true, ['success']);
      });

      upload.fileRecord = {
        method: false
      };

      upload._prepareUpload();

      expect(upload._uploadFile).toHaveBeenCalled();

    });

    it('Should call createChunks on multipart uploads.', function () {
      spyOn(upload, '_createChunks').and.callFake(function () {
        return utils.promisify(true, ['success']);
      });

      spyOn(upload, '_completeUpload');

      upload.fileRecord = {
        method: true
      };

      upload._prepareUpload();

      expect(upload._createChunks).toHaveBeenCalled();
    });
  });

  describe('createChunks', function () {

    it('Should return a series of promises.', function () {

      spyOn(upload, '_uploadChunk').and.callFake(function () {
        return utils.promisify(true, ['success']);
      });

      upload.chunkSize = 50000;
      upload.chunkCount = 20;

      var result = upload._createChunks();

      expect(result.pause).toBeDefined();
      expect(result.resume).toBeDefined();
      expect(result.then).toBeDefined();

    });

    it('Should call abort if the upload is aborted.', function () {

      spyOn(upload, 'abort').and.returnValue(null);

      upload.aborted = true;

      upload._createChunks();

      expect(upload.abort).toHaveBeenCalled();

    });
  });

  describe('uploadChunk', function () {

    it('Should call the proper sequence of functions.', function (done) {

      spyOn(upload, '_signUpload').and.callFake(function () {
        return utils.promisify(true, []);
      });

      spyOn(upload, '_sendUpload').and.callFake(function () {
        return utils.promisify(true, []);
      });

      spyOn(upload, '_completeChunk').and.callFake(function (chunk, promise) {
        return promise(true, []);
      });

      upload._uploadChunk().then(function () {
        expect(upload._signUpload).toHaveBeenCalled();
        expect(upload._sendUpload).toHaveBeenCalled();
        expect(upload._completeChunk).toHaveBeenCalled();

        done();
      }, function (error) {
        expect(error).not.toBeDefined();
        done();
      });

    });

    it('Should set the uploadComplete flag when all chunks are complete.', function () {

      var chunk = {
        data: {
          size: 10
        }
      };

      upload.chunksComplete = 0;
      upload.chunkCount = 1;

      upload._completeChunk(chunk, function () {});

      expect(upload.uploadComplete).toEqual(true);

    });
  });

  describe('uploadFile', function () {
    it('Should call the proper sequence of functions.', function (done) {
      spyOn(upload, '_signUpload').and.callFake(function () {
        return utils.promisify(true, []);
      });

      spyOn(upload, '_sendUpload').and.callFake(function () {
        return utils.promisify(true, []);
      });

      spyOn(upload, '_updateProgress').and.callFake(function () {
        return utils.promisify(true, []);
      });

      upload._uploadFile().then(function () {
        expect(upload._signUpload).toHaveBeenCalled();
        expect(upload._sendUpload).toHaveBeenCalled();
        expect(upload._updateProgress).toHaveBeenCalled();

        done();
      });
    });
  });

  describe('signUpload', function () {

    it('Should sign an upload for a single part upload.', function (done) {
      var url;

      var chunk = {
        data: file,
        partNumber: 1
      };

      upload.fileRecord.id = 'test-id';
      upload.fileRecord.method = false;

      mock.setup();

      url = utils.parseTokens(api.config.host + upload.config.sign, {
        id: 'test-id',
        method: '?type=amazon'
      });

      mock.mock('POST', url, function (request, response) {

        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify('signed'));

      });

      upload._signUpload(chunk).then(function (response) {
        expect(response.data).toEqual('signed');
        done();
      }, function (error) {
        expect(error).not.toBeDefined();
        done();
      });
    });

    it('Should sign an upload for a multipart upload.', function (done) {
      var url;

      var chunk = {
        data: file
      };

      upload.fileRecord.id = 'test-id';
      upload.fileRecord.method = true;

      mock.setup();

      url = utils.parseTokens(api.config.host + upload.config.sign, {
        id: 'test-id',
        method: ''
      });

      mock.mock('POST', url, function (request, response) {

        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify('signed'));

      });

      upload._signUpload(chunk).then(function (response) {
        expect(response.data).toEqual('signed');
        done();
      }, function (error) {
        expect(error).not.toBeDefined();
        done();
      });
    });
  });

  describe('sendUpload', function () {

    it('Should send the file to the server.', function (done) {
      var chunk = {
        data: file,
        partNumber: 1
      };

      var response = {
        data: {
          authHeader: '1234auth',
          dateHeader: '1234date',
          url: 'http://test-server'
        }
      };

      mock.setup();
      // TODO(jstackhouse): Only required until xhr-mock v2 is out or xhr-mock@next has lib folder.
      window.XMLHttpRequest.prototype.upload = {
        onprogress: null
      }

      mock.mock('PUT', 'http://test-server', function (request, response) {

        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify('uploaded'));

      });

      upload._sendUpload(chunk, response).then(function (response) {
        expect(response.data).toEqual('uploaded');
        done();
      }, function (error) {
        expect(error).not.toBeDefined();
        done();
      });
    });
  });

  describe('completeChunk', function () {

    it('Should update the chunks complete and the current progress.', function () {
      var chunk = {
        data: {
          size: 5000
        },
        complete: false
      };

      upload.chunkCount = 2;
      upload.chunksComplete = 0;
      upload._completeChunk(chunk, function () {});
      expect(chunk.complete).toEqual(true);
      expect(upload.chunksComplete).toEqual(1);
    });
  });

  describe('completeUpload', function () {

    it('Should complete the upload and clear the current upload.', function (done) {

      upload.fileRecord.id = 'test-id';

      upload.singlePartPromise = true;
      upload.requestPromise = true;

      var url = utils.parseTokens(api.config.host + upload.config.uploadComplete, {
        id: 'test-id'
      });

      mock.setup();

      mock.mock('POST', url, function (request, response) {

        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify('complete'));

      });

      upload._completeUpload().then(function (response) {
        expect(response).toEqual('test-id');
        expect(upload.singlePartPromise).toEqual(null);
        expect(upload.requestPromise).toEqual(null);
        done();
      }, function (error) {
        expect(error).not.toBeDefined();
        done();
      });

    });

    it('Should return early if the upload was aborted before this point.', function () {

      spyOn(utils, 'parseTokens').and.returnValue(null);

      upload.aborted = true;
      upload._completeUpload();

      expect(utils.parseTokens).not.toHaveBeenCalled();

    });
  });

  describe('abort', function () {

    it('Should abort a single part upload.', function (done) {
      upload.created = true;
      upload.initialized = true;
      upload.singlePartPromise = true;
      upload.requestPromise = {
        cancel: function () {}
      };
      upload.fileRecord.id = 'test-id';
      upload.fileRecord.method = false;

      var url = utils.parseTokens(api.config.host + upload.config.uploadAbort, {
        id: 'test-id',
        method: '?type=amazon'
      });

      var deleteUrl = utils.parseTokens(api.config.host + api.inputs.config.byId, {
        id: 'test-id',
        resource: api.inputs.config.resource
      });

      mock.setup();

      mock.mock('DELETE', deleteUrl, function (request, response) {
        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify('deleted'));

      });

      upload.abort().then(function (response) {
        mock.teardown();
        expect(response.data).toEqual('deleted');
        done();
      }, function (error) {
        mock.teardown();
        expect(error).not.toBeDefined();
        done();
      });

    });


    it('Should abort a multi part upload.', function (done) {

      upload.created = true;
      upload.initialized = true;

      upload.fileRecord.id = 'test-id';
      upload.fileRecord.method = true;

      upload.singlePartPromise = false;

      upload.multiPartPromise = {
        cancel: function () {}
      };

      var url = utils.parseTokens(api.config.host + upload.config.uploadAbort, {
        id: 'test-id',
        method: ''
      });

      var deleteUrl = utils.parseTokens(api.config.host + api.inputs.config.byId, {
        id: 'test-id',
        resource: api.inputs.config.resource
      });

      mock.setup();

      mock.mock('POST', url, function (request, response) {

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify('aborted'));

      });

      mock.mock('DELETE', deleteUrl, function (request, response) {

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify('deleted'));

      });

      upload.abort(upload).then(function (response) {
        expect(response.data).toEqual('deleted');
        mock.teardown();
        done();
      }, function (error) {
        expect(error).not.toBeDefined();
        mock.teardown();
        done();
      });

    });

    it('Should attempt to delete the input when the upload isn\'t initialized', function (done) {

      upload.created = true;
      upload.initialized = false;
      upload.fileRecord.id = 'test-id';
      upload.fileRecord.method = false;

      spyOn(upload.api.inputs, 'delete').and.returnValue(api.utils.promisify(true, 'deleted'));

      upload.abort().then(function (response) {
        expect(upload.api.inputs.delete).toHaveBeenCalled();
        expect(response).toEqual('deleted');
        done();
      }, function (error) {
        expect(error).not.toBeDefined();
        done();
      });

    });

    it('Should silently resolve the promise if there is nothing to be done.', function (done) {
      upload.created = false;
      upload.initialized = false;
      upload.fileRecord.id = 'test-id';
      upload.fileRecord.method = false;

      spyOn(upload.api.inputs, 'delete').and.returnValue();

      upload.abort().then(function (response) {
        expect(upload.api.inputs.delete).not.toHaveBeenCalled();
        done();
      }, function (error) {
        expect(error).not.toBeDefined();
        done();
      });
    });

  });

  describe('abortSync', function () {

    it('Should abort a single part upload.', function () {
      var sync = false;

      upload.created = true;
      upload.initialized = true;
      upload.singlePartPromise = true;

      upload.requestPromise = {
        cancel: function () {}
      };

      upload.fileRecord.id = 'test-id';
      upload.fileRecord.method = false;

      var url = utils.parseTokens(api.config.host + upload.config.uploadAbort, {
        id: 'test-id',
        method: '?type=amazon'
      });

      var deleteUrl = utils.parseTokens(api.config.host + api.inputs.config.byId, {
        id: 'test-id',
        resource: api.inputs.config.resource
      });

      jasmine.Ajax.install();

      jasmine.Ajax.stubRequest(url, null, 'POST').andReturn({
        status: 200,
        contentType: 'application/json',
        responseText: JSON.stringify('aborted')
      });

      jasmine.Ajax.stubRequest(deleteUrl, null, 'DELETE').andReturn({
        status: 200,
        contentType: 'application/json',
        responseText: JSON.stringify('deleted')
      });

      upload.abortSync(function (error, response) {
        expect(error).toEqual(null);
        expect(response.data).toEqual('deleted');
        sync = true;
      });

      expect(sync).toEqual(true);

      jasmine.Ajax.uninstall();

    });

    it('Should abort a multi part upload.', function () {
      var sync = false;

      upload.created = true;
      upload.initialized = true;

      upload.fileRecord.id = 'test-id';
      upload.fileRecord.method = true;

      upload.singlePartPromise = false;

      upload.multiPartPromise = {
        cancel: function () {}
      };

      var url = utils.parseTokens(api.config.host + upload.config.uploadAbort, {
        id: 'test-id',
        method: ''
      });

      var deleteUrl = utils.parseTokens(api.config.host + api.inputs.config.byId, {
        id: 'test-id',
        resource: api.inputs.config.resource
      });

      jasmine.Ajax.install();

      jasmine.Ajax.stubRequest(url, null, 'POST').andReturn({
        status: 200,
        contentType: 'application/json',
        responseText: JSON.stringify('aborted')
      });

      jasmine.Ajax.stubRequest(deleteUrl, null, 'DELETE').andReturn({
        status: 200,
        contentType: 'application/json',
        responseText: JSON.stringify('deleted')
      });

      upload.abortSync(function (error, response) {
        expect(response.data).toEqual('deleted');
        sync = true;
      });

      expect(sync).toEqual(true);

      jasmine.Ajax.uninstall();

    });

    it('Should call the callback if the abort fails.', function () {
      var sync = false;

      upload.created = true;
      upload.initialized = true;

      upload.fileRecord.id = 'test-id';
      upload.fileRecord.method = true;

      upload.singlePartPromise = false;

      upload.multiPartPromise = {
        cancel: function () {}
      };

      var url = utils.parseTokens(api.config.host + upload.config.uploadAbort, {
        id: 'test-id',
        method: ''
      });

      jasmine.Ajax.install();

      jasmine.Ajax.stubRequest(url, null, 'POST').andReturn({
        status: 500,
        contentType: 'application/json',
        responseText: JSON.stringify('aborted')
      });

      upload.abortSync(function (error, response) {
        expect(error).not.toEqual(null);
        sync = true;
      });

      expect(sync).toEqual(true);

      jasmine.Ajax.uninstall();

    });

    it('Should throw if the abort fails and a callback isn\'t provided.', function () {

      upload.created = true;
      upload.initialized = true;

      upload.fileRecord.id = 'test-id';
      upload.fileRecord.method = true;

      upload.singlePartPromise = false;

      upload.multiPartPromise = {
        cancel: function () {}
      };

      var url = utils.parseTokens(api.config.host + upload.config.uploadAbort, {
        id: 'test-id',
        method: ''
      });

      jasmine.Ajax.install();

      jasmine.Ajax.stubRequest(url, null, 'POST').andReturn({
        status: 500,
        contentType: 'application/json',
        responseText: JSON.stringify('aborted')
      });

      expect(function () {
        upload.abortSync();
      }).toThrow();

      jasmine.Ajax.uninstall();

    });

    it('Should attempt to delete the input when the upload isn\'t initialized', function () {
      var sync = false;

      upload.created = true;
      upload.initialized = false;
      upload.fileRecord.id = 'test-id';
      upload.fileRecord.method = false;

      spyOn(upload.api.inputs, 'deleteSync').and.callFake(function (id, callback) {
        callback(null, 'deleted');
      });

      upload.abortSync(function (error, response) {
        expect(error).toEqual(null);
        expect(response).toEqual('deleted');
        sync = true;
      });

      expect(sync).toEqual(true);

    });

    it('Should call the callback with a null response if there is nothing to be done.', function () {
      var sync = false;

      upload.created = false;
      upload.initialized = false;
      upload.fileRecord.id = 'test-id';
      upload.fileRecord.method = false;

      spyOn(upload.api.inputs, 'delete').and.returnValue();

      upload.abortSync(function (error, response) {

        expect(error).toEqual(null);
        expect(upload.api.inputs.delete).not.toHaveBeenCalled();

        sync = true;

      });

      expect(sync).toEqual(true);
    });

  });


  describe('pause', function () {
    it('Should pause the current upload.', function () {
      var called = false;

      upload.requestPromise = {
        cancel: function () {
          called = true;
        }
      };

      upload.paused = false;

      upload.pause();

      expect(upload.paused).toEqual(true);
      expect(called).toEqual(true);
    });

    it('Should pause a singlepart upload.', function () {
      var called = false;

      spyOn(upload, '_uploadFile');

      upload.requestPromise = {
        cancel: function () {
          called = true;
        }
      };

      upload.paused = false;

      upload.pause();

      expect(upload.paused).toEqual(true);
      expect(called).toEqual(true);
    });

    it('Should pause a multipart upload.', function () {

      var cancelCalled = false;
      var pauseCalled = false;

      upload.requestPromise = {
        cancel: function () {
          cancelCalled = true;
        }
      };

      upload.multiPartPromise = {
        pause: function () {
          pauseCalled = true;
        }
      };

      upload.paused = false;

      upload.pause();

      expect(upload.paused).toEqual(true);
      expect(cancelCalled).toEqual(true);
      expect(pauseCalled).toEqual(true);

    });

    it('Should set the paused state.', function () {

      upload.paused = false;

      upload.pause();

      expect(upload.paused).toEqual(true);

    });

    it('Should return early if the upload is already complete.', function () {

      upload.uploadComplete = true;

      upload.pause();

      expect(upload.paused).toEqual(false);

    });
  });

  describe('resume', function () {
    it('Should resume the current upload.', function () {
      var called = false;

      upload.multiPartPromise = {
        resume: function () {
          called = true;
        }
      };

      upload.paused = true;

      upload.resume();

      expect(upload.paused).toEqual(false);
      expect(called).toEqual(true);
    });

    it('Should resume a single part upload.', function () {

      upload.requestPromise = true;
      upload.singlePartPromise = true;

      spyOn(upload, '_uploadFile').and.callThrough();

      upload.requestPromise = true;
      upload.paused = true;

      upload.resume();

      expect(upload.paused).toEqual(false);
      expect(upload._uploadFile).toHaveBeenCalled();
    });

    it('Should set the paused state.', function () {

      upload.paused = true;

      upload.resume();

      expect(upload.paused).toEqual(false);

    });
  });

  describe('checkMultipart', function () {

    it('Should return true for a multipart file.', function () {

      var file = {
        size: 10485760
      };

      expect(upload._checkMultipart(file)).toEqual(true);

    });

    it('Should return true for a single part file.', function () {

      var file = {
        size: 5242880
      };

      expect(upload._checkMultipart(file)).toEqual(false);

    });

    it('Should throw an error if a file is not passed.', function () {
      var fn = upload._checkMultipart.bind(upload);

      expect(fn).toThrow();
    });

  });

  describe('getSliceMethod', function () {

    it('Should return mozSlize when available.', function () {

      file.mozSlice = true;
      delete file.webkitSlice;
      delete file.slice;

      expect(upload._getSliceMethod(file)).toEqual('mozSlice');

    });

    it('Should return webkitSlice when available.', function () {

      file.webkitSlice = true;
      delete file.mozSlice;
      delete file.slice;

      expect(upload._getSliceMethod(file)).toEqual('webkitSlice');

    });

  });

});
