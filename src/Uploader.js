var Request = require('./Request.js');
var Promise = require('pinkyswear');
var extend = require('extend');
var utils = require('./Utils.js');
var JWTUtils = require('./JWTUtils');

/**
 * Create a new upload wrapper.  Manages the entire upload of a file.
 * @class
 * @param   {object}  options                   Configuration options to override the defaults.
 * @param   {object}  options.api               A reference to the parent API instance.
 * @param   {object}  options.file              The file to upload.
 * @param   {object}  options.upload            REST endpoint for creating an input.
 * @param   {object}  options.sign              REST endpoint for signing a blob before upload.
 * @param   {object}  options.uploadComplete    REST endpoint to notify the API that the upload is complete.
 * @param   {object}  options.uploadAbort       REST endpoint to abort the upload.
 */
function Upload (options) {

  this.defaults = {
    api: null,
    file: null,
    upload: '/encoding/inputs/<%=id%>/upload<%=method%>',
    sign: '/encoding/inputs/<%=id%>/upload/sign<%=method%>',
    uploadComplete: '/encoding/inputs/<%=id%>/upload/complete',
    uploadAbort: '/encoding/inputs/<%=id%>/upload/abort',
    uploadMethods: {
      param: '?type=',
      singlePart: 'amazon',
      multiPart: 'amazonMP'
    }
  };

  // Create a config object by extending the defaults with the pass options.
  this.config = extend(true, {}, this.defaults, options);

  this.api = this.config.api;
  this.file = this.config.file;

  this.chunks = [];
  this.chunkSize = 0;
  this.chunkCount = 0;
  this.chunksComplete = 0;

  this.aborted = false;
  this.paused = false;

  this.fileRecord = {
    filename: this.file.name,
    type: this.file.type,
    size: this.file.size,
    method: this.checkMultipart(this.file)
  };

};

/**
 * Register a function to execute when a chunk completes uploading.
 * @param  {Function} callback A callback to execute when progress is made.
 */
Upload.prototype.progress = function (callback) {
  this.config.progress = callback.bind(this);
};

/**
 * Create a new input record and upload the files to amazon.
 * @return  {Promise}         A promise which resolves when the new input record is created and uploaded.
 */
Upload.prototype.save = function () {
  return this.create(this.fileRecord)
    .then(this.initialize.bind(this))
    .then(this.prepareUpload.bind(this));
};

/**
 * Call the progress callback and pass the current progress percentage.
 * @private
 * @param  {number} message Current progress percentage.
 */
Upload.prototype.updateProgress = function (percent) {

  if (!this.config.progress) {
    return;
  }

  this.config.progress.call(this, percent);
};

/**
 * Create a new input record.
 * @private
 * @param   {object}  record  A JSON object representing the input record to create.
 * @return  {Promise}         A promise which resolves when the new input record is created.
 */
Upload.prototype.create = function (record) {

  if (this.aborted) {
    return;
  }

  return this.api.inputs.add([record]).then(this._createSuccess.bind(this));
};

/**
 * Return the data object from the response.
 * @private
 * @param  {JSON}   response  JSON response containing the new input record id.
 * @return {string}           new input record id.
 */
Upload.prototype._createSuccess = function (response) {

  this.updateProgress(0);
  this.fileRecord.id = response.data[0].id;

  return this.fileRecord.id;
};

/**
 * Initializes an Input for upload
 * @private
 * @return {Promise} A promise which resolves when the request is complete.
 */
Upload.prototype.initialize = function () {

  var url;
  var tokens;
  var signing = '';

  if (this.aborted) {
    return;
  }

  if (!this.fileRecord.method) {
    signing = this.config.uploadMethods.param + this.config.uploadMethods.singlePart;
  }

  tokens = {
    id: this.fileRecord.id,
    method: signing
  };

  url = utils.parseTokens(this.api.config.host + this.config.upload, tokens);

  return new Request({
    url: url,
    token: this.api.getToken(),
    method: 'POST',
    data: this.fileRecord
  }).then(this._initializeComplete.bind(this));

};

/**
 * Store the information returned from the initialize request.
 * @private
 */
Upload.prototype._initializeComplete = function (response) {
  this.fileRecord.key = response.data.key;
  this.fileRecord.uploadId = response.data.uploadId;
  this.chunkSize = response.data.pieceSize;
  this.chunkCount = response.data.pieceCount;
};

/**
 * Setup the upload depending on its type, single or multi part.
 * @return {Promise} A promise which resolves when all of the pieces have completed uploading.
 */
Upload.prototype.prepareUpload = function () {
  if (!this.fileRecord.method) {
    // Singlepart.
    return this.uploadFile()
      .then(this._completeUpload.bind(this));
  } else {
    // Multipart.
    return this.createChunks()
      .then(this.completeUpload.bind(this));
  }
};

/**
 * Break a file into blobs and create a chunk object for each piece.
 * @private
 * @return {Promise} A promise which resolves when all of the pieces have completed uploading.
 */
Upload.prototype.createChunks = function () {
  var sliceMethod = this.getSliceMethod(this.file);
  var i, blob, chunk,
    chunkPromises = [];

  if (this.aborted) {
    this.abort();
    return;
  }

  for (i = 0; i < this.chunkCount - 1; i++) {

    blob = this.file[sliceMethod](i * this.chunkSize, (i + 1) * this.chunkSize);

    chunk = {
      partNumber: i + 1,
      data: blob
    };

    this.chunks.push(chunk);

    chunkPromises.push(this.uploadChunk.bind(this, chunk));

  }

  // Store a reference for pausing and resuming.
  this.currentUpload = utils.series(chunkPromises, this.paused);

  return this.currentUpload;
};

/**
 * Create a promise chain for each chunk to be uploaded.
 * @private
 * @return {Promise} A promise which resolves when the request is complete.
 */
Upload.prototype.uploadChunk = function (chunk) {
  return this.signUpload(chunk)
    .then(this.sendUpload.bind(this, chunk))
    .then(this.completeChunk.bind(this, chunk));
};

/**
 * Create a promise chain for a single part file upload.
 * @param  {file}   file    A file reference to upload.
 * @return {Promise} A promise which resolves when the request is complete.
 */
Upload.prototype.uploadFile = function () {
  var chunk = {
    data: this.file
  };

  return this.signUpload(chunk)
    .then(this.sendUpload.bind(this, chunk))
    .then(this.updateProgress.bind(this, 100));
};

/**
 * Make a request and sign the chunk to be uploaded.
 * @private
 * @param  {object}   chunk           Information about the chunk to be uploaded.
 * @return {Promise}                  A promise which resolves when the request is complete.
 */
Upload.prototype.signUpload = function (chunk) {
  var url;
  var signing = '';
  var headers = {};

  // Set the part number for the current chunk.
  if (chunk.partNumber) {
    this.fileRecord.partNumber = chunk.partNumber;
  }

  headers['Content-Type'] = 'multipart/form-data';

  if (!this.fileRecord.method) {
    signing = this.config.uploadMethods.param + this.config.uploadMethods.singlePart;
  }

  url = utils.parseTokens(this.api.config.host + this.config.sign, {
    id: this.fileRecord.id,
    method: signing
  });

  return new Request({
    url: url,
    token: this.api.getToken(),
    method: 'POST',
    headers: headers,
    data: this.fileRecord
  });
};

/**
 * Send the upload to the server.
 * @private
 * @param   {object} upload  An object representing the upload to send to the server.
 * @return  {Promise}       A promise which resolves when the request is complete.
 */
Upload.prototype.sendUpload = function (upload, response) {
  var headers = {};

  var formData = new FormData();
  formData.append('file', upload.data);

  // Set the proper headers to send with the file.
  headers['Content-Type'] = 'multipart/form-data';
  headers['Authorization'] = response.data.authHeader;
  headers['x-amz-date'] = response.data.dateHeader;

  return new Request({
    url: response.data.url,
    method: 'PUT',
    headers: headers,
    data: formData
  });
};

/**
 *  Executed when a chunk is finished uploading.
 *  @private
 */
Upload.prototype.completeChunk = function (chunk) {
  var progress;

  this.chunksComplete++;
  chunk.complete = true;

  progress = this.chunksComplete * this.chunkSize;
  progress = progress / this.fileRecord.size;
  progress = progress * 100;
  progress = Math.round(progress);

  this.updateProgress(progress);
};

/**
 * Notify the server that the upload is complete.
 *
 * @private
 * @return {Promise} A promise which resolves when the request is complete.
 */
Upload.prototype.completeUpload = function () {
  var url;
  var tokens;

  if (this.aborted) {
    this.abort();
    return;
  }

  tokens = {
    id: this.fileRecord.id
  };

  url = utils.parseTokens(this.api.config.host + this.config.uploadComplete, tokens);

  return new Request({
    url: url,
    token: this.api.getToken(),
    method: 'POST',
    data: this.fileRecord
  }).then(this._completeUpload.bind(this));
};

/**
 * Return the id for the current file record.
 * @private
 * @return {string} ID for the input record that was created.
 */
Upload.prototype._completeUpload = function () {
  this.currentUpload = null;
  return this.fileRecord.id;
};

/**
 * Completes an input upload
 * @param  {string}  inputId        An id for the input you wish to delete
 * @param  {object}  data           The object containing data for the upload completion.
 * @param  {string}  data.uploadId  The uploadId you wish to complete the upload for
 * @param  {number}  data.key       The key of the upload you wish to complete
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
Upload.prototype.abort = function () {
  var url;
  var tokens;
  var signing = '';

  if (this.currentUpload) {
    this.currentUpload.pause();
    this.currentUpload = null;
  }

  if (!this.fileRecord.method) {
    signing = this.config.uploadMethods.param + this.config.uploadMethods.singlePart;
  }

  tokens = {
    id: this.fileRecord.id,
    method: signing
  };

  url = utils.parseTokens(this.api.config.host + this.config.uploadAbort, tokens);

  return new Request({
    url: url,
    token: this.api.getToken(),
    method: 'POST',
    data: this.fileRecord
  });
};

/**
 * Pause the current upload.
 */
Upload.prototype.pause = function () {
  this.paused = true;
  if (this.currentUpload) {
    this.currentUpload.pause();
  }
};

/**
 * Resume the current upload.
 */
Upload.prototype.resume = function () {
  this.paused = false;
  if (this.currentUpload) {
    this.currentUpload.resume();
  }
};

/**
 * Check the file size to determine if it should be a multipart upload, returns false for singlepart uploads.
 * @private
 * @param  {file}   file  The file to evaluate.
 * @return {boolean}      True if the file will be uploading using mutlipart upload.
 */
Upload.prototype.checkMultipart = function (file) {
  if (!file) {
    return;
  }

  return (file.size <= (5 * 1024 * 1024) ? false : true);
};

/**
 * Function that determines the slice method to be used
 * @private
 * @param {object} file - The file object you wish to determine the slice method for
 * @return {string} sliceMethod - The slice method to use.
 */
Upload.prototype.getSliceMethod = function (file) {
  var sliceMethod;

  if ('mozSlice' in file) {
    sliceMethod = 'mozSlice';
  } else if ('webkitSlice' in file) {
    sliceMethod = 'webkitSlice';
  } else {
    sliceMethod = 'slice';
  }

  return sliceMethod;
};

module.exports = Upload;
