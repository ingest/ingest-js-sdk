var api;

// Token will need to be re-generated every 24 hours.
var access_token = 'Bearer ' + window.token;

var mock = require('xhr-mock');
var utils;
var Request;

var Uploader, file, upload;

describe('Ingest API : Uploader', function () {

  // Reset the auth token.
  beforeEach(function () {
    api = new IngestAPI({
      host: 'http://weasley.teamspace.ad:3000',
      token: access_token
    });

    utils = api.utils;

    Uploader = api.uploader;

    // Create a mock file.
    file = new File(["testfilewithsometestcontent"], "testfile", {
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

      upload.updateProgress();

      expect(test.progress).toHaveBeenCalled();

    });

    it('Should not fail if a progress function is not defined', function () {
      expect(upload.updateProgress.bind(upload)).not.toThrow();
    });
  });

  describe('save', function () {

    it('Should call the proper sequence of functions.', function (done) {

      spyOn(upload, 'create').and.callFake(function () {
        return utils.promisify(true, []);
      });

      spyOn(upload, 'initialize').and.callFake(function () {
        return utils.promisify(true, []);
      });

      spyOn(upload, 'prepareUpload').and.callFake(function () {
        return utils.promisify(true, []);
      });

      upload.save().then(function () {
        expect(upload.create).toHaveBeenCalled();
        expect(upload.initialize).toHaveBeenCalled();
        expect(upload.prepareUpload).toHaveBeenCalled();

        done();
      });

    });
  });

  describe('create', function () {

    it('Should create an input', function (done) {

      spyOn(api.inputs, 'add').and.callFake(function (record) {
        return utils.promisify(true, {
          data: [
            {id: 'test-id'}
          ]});
      });

      upload.create(upload.fileRecord).then(function (id) {
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

      expect(upload.create.bind(upload, upload.fileRecord)).not.toThrow();

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

      upload.initialize().then(function (response) {
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

      upload.initialize().then(function (response) {
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

    it('Should not try to initialize if the upload has been aborted', function () {

      upload.aborted = true;

      spyOn(utils, 'parseTokens');

      var result = upload.initialize();

      // The function should not have returned a promise.
      expect(result).not.toBeDefined();

      expect(utils.parseTokens).not.toHaveBeenCalled();

    });
  });

  describe('prepareUpload', function () {
    it('Should call uploadFile on single part uploads.', function () {
      spyOn(upload, 'uploadFile').and.callFake(function () {
        return utils.promisify(true, ['success']);
      });

      upload.fileRecord = {
        method: false
      };

      upload.prepareUpload();

      expect(upload.uploadFile).toHaveBeenCalled();

    });

    it('Should call createChunks on multipart uploads.', function () {
      spyOn(upload, 'createChunks').and.callFake(function () {
        return utils.promisify(true, ['success']);
      });

      upload.fileRecord = {
        method: true
      };

      upload.prepareUpload();

      expect(upload.createChunks).toHaveBeenCalled();
    });
  });

  describe('createChunks', function () {

    it('Should return a series of promises.', function () {

      spyOn(upload, 'uploadChunk').and.callFake(function () {
        return utils.promisify(true, ['success']);
      });

      upload.file.size = 1000000;
      upload.chunkSize = 50000;
      upload.chunkCount = 20;

      var result = upload.createChunks();

      expect(result.pause).toBeDefined();
      expect(result.resume).toBeDefined();
      expect(result.then).toBeDefined();

    });

    it('Should call abort if the upload is aborted.', function () {

      spyOn(upload, 'abort').and.returnValue(null);

      upload.aborted = true;

      upload.createChunks();

      expect(upload.abort).toHaveBeenCalled();

    });
  });

  describe('uploadChunk', function () {

    it('Should call the proper sequence of functions.', function (done) {

      spyOn(upload, 'signUpload').and.callFake(function () {
        return utils.promisify(true, []);
      });

      spyOn(upload, 'sendUpload').and.callFake(function () {
        return utils.promisify(true, []);
      });

      spyOn(upload, 'completeChunk').and.callFake(function () {
        return utils.promisify(true, []);
      });

      upload.uploadChunk().then(function () {
        expect(upload.signUpload).toHaveBeenCalled();
        expect(upload.sendUpload).toHaveBeenCalled();
        expect(upload.completeChunk).toHaveBeenCalled();

        done();
      }, function (error) {
        expect(error).not.toBeDefined();
        done();
      });

    });
  });

  describe('uploadFile', function () {
    it('Should call the proper sequence of functions.', function (done) {
      spyOn(upload, 'signUpload').and.callFake(function () {
        return utils.promisify(true, []);
      });

      spyOn(upload, 'sendUpload').and.callFake(function () {
        return utils.promisify(true, []);
      });

      spyOn(upload, 'updateProgress').and.callFake(function () {
        return utils.promisify(true, []);
      });

      upload.uploadFile().then(function () {
        expect(upload.signUpload).toHaveBeenCalled();
        expect(upload.sendUpload).toHaveBeenCalled();
        expect(upload.updateProgress).toHaveBeenCalled();

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

      upload.signUpload(chunk).then(function (response) {
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

      upload.signUpload(chunk).then(function (response) {
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

      mock.mock('PUT', 'http://test-server', function (request, response) {

        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify('uploaded'));

      });

      upload.sendUpload(chunk, response).then(function (response) {
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

      spyOn(upload, 'updateProgress').and.callFake(function (percent) {
        expect(percent).toEqual(50);
      });

      var chunk = {};

      upload.chunksComplete = 0;
      upload.chunkSize = 5000;
      upload.fileRecord.size = 10000;

      upload.completeChunk(chunk);

      expect(upload.updateProgress).toHaveBeenCalled();

    });
  });

  describe('completeUpload', function () {

    it('Should complete the upload and clear the current upload.', function (done) {

      upload.currentUpload = 'test-upload';
      upload.fileRecord.id = 'test-id';

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

      upload.completeUpload().then(function (response) {
        expect(response).toEqual('test-id');
        expect(upload.currentUpload).toEqual(null);
        done();
      }, function (error) {
        expect(error).not.toBeDefined();
        done();
      });

    });

    it('Should call abort if the upload was aborted before this point.', function () {

      spyOn(upload, 'abort').and.returnValue(null);
      spyOn(utils, 'parseTokens').and.returnValue(null);

      upload.aborted = true;
      upload.completeUpload();

      expect(upload.abort).toHaveBeenCalled();
      expect(utils.parseTokens).not.toHaveBeenCalled();

    });
  });

  describe('abort', function () {

    it('Should abort a single part upload.', function (done) {

      upload.currentUpload = {
        pause: function () {}
      };

      upload.fileRecord.id = 'test-id';
      upload.fileRecord.method = true;

      var url = utils.parseTokens(api.config.host + upload.config.uploadAbort, {
        id: 'test-id',
        signing: ''
      });

      mock.setup();

      mock.mock('POST', url, function (request, response) {

        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify('aborted'));

      });

      upload.abort().then(function (response) {
        expect(response.data).toEqual('aborted');
        done();
      }, function (error) {
        expect(error).not.toBeDefined();
        done();
      });

    });


    it('Should abort a multi part upload.', function (done) {


      upload.fileRecord.id = 'test-id';
      upload.fileRecord.method = false;

      var url = utils.parseTokens(api.config.host + upload.config.uploadAbort, {
        id: 'test-id',
        signing: '?type=amazon'
      });

      mock.setup();

      mock.mock('POST', url, function (request, response) {

        mock.teardown();

        return response.status(200)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify('aborted'));

      });

      upload.abort().then(function (response) {
        expect(response.data).toEqual('aborted');
        done();
      }, function (error) {
        expect(error).not.toBeDefined();
        done();
      });

    });
  });

  describe('pause', function () {
    it('Should pause the current upload.', function () {
      var called = false;

      upload.currentUpload = {
        pause: function () {
          called = true;
        }
      };

      upload.paused = false;

      upload.pause();

      expect(upload.paused).toEqual(true);
      expect(called).toEqual(true);
    });

    it('Should set the paused state.', function () {

      upload.paused = false;

      upload.pause();

      expect(upload.paused).toEqual(true);

    });
  });

  describe('resume', function () {
    it('Should resume the current upload.', function () {
      var called = false;

      upload.currentUpload = {
        resume: function () {
          called = true;
        }
      };

      upload.paused = true;

      upload.resume();

      expect(upload.paused).toEqual(false);
      expect(called).toEqual(true);
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

      expect(upload.checkMultipart(file)).toEqual(true);

    });

    it('Should return true for a single part file.', function () {

      var file = {
        size: 5242880
      };

      expect(upload.checkMultipart(file)).toEqual(false);

    });

    it('Should return undefined if a file is not passed.', function () {
      expect(upload.checkMultipart()).toEqual(undefined);
    });

  });

  describe('getSliceMethod', function () {

    it('Should return mozSlize when available.', function () {

      file.mozSlice = true;
      delete file.webkitSlice;
      delete file.slice;

      expect(upload.getSliceMethod(file)).toEqual('mozSlice');

    });

    it('Should return mozSlize when available.', function () {

      file.webkitSlice = true;
      delete file.mozSlice;
      delete file.slice;

      expect(upload.getSliceMethod(file)).toEqual('webkitSlice');

    });

  });

});
