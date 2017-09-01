'use strict';

var extend = require('extend');
var Request = require('./Request');
var Promise = require('pinkyswear');
var utils = require('./Utils');

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
    uploadAbort: '/encoding/inputs/<%=id%>/upload/abort<%=method%>',
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
  this.uploadedBytes = 0;

  this.aborted = false;
  this.paused = false;
  this.created = false;
  this.initialized = false;

  // Set to true when all the chunks are uploaded, but before the complete call is made.
  this.uploadComplete = false;

  this.fileRecord = {
    filename: this.file.name,
    type: this.file.type,
    size: this.file.size,
    method: this._checkMultipart(this.file),
    contentType: 'application/octet-stream'
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
  return this._create(this.fileRecord)
    .then(this._initialize.bind(this))
    .then(this._prepareUpload.bind(this));
};

/**
 * Call the progress callback and pass the current progress percentage.
 * @private
 * @param  {number} message Current progress percentage.
 */
Upload.prototype._updateProgress = function (percent, chunkSize) {

  if (!this.config.progress) {
    return;
  }

  this.config.progress.call(this, percent, chunkSize);
};

/**
 * Create a new input record.
 * @private
 * @param   {object}  record  A JSON object representing the input record to create.
 * @return  {Promise}         A promise which resolves when the new input record is created.
 */
Upload.prototype._create = function (record) {

  if (this.created) {
    return utils.promisify(true, this.fileRecord.id);
  }

  if (this.aborted) {
    return utils.promisify(false, 'upload aborted');
  }

  return this.api.inputs.add(record).then(this._createSuccess.bind(this));
};

/**
 * Return the data object from the response.
 * @private
 * @param  {JSON}   response  JSON response containing the new input record id.
 * @return {string}           new input record id.
 */
Upload.prototype._createSuccess = function (response) {

  this.created = true;

  this._updateProgress(0, 0);

  // Store the input record.
  this.input = response.data;

  this.fileRecord.id = response.data.id;

  return this.fileRecord.id;
};

/**
 * Initializes an Input for upload
 * @private
 * @return {Promise} A promise which resolves when the request is complete.
 */
Upload.prototype._initialize = function () {
  var url;
  var tokens;
  var signing = '';
  var request;

  if (this.aborted) {
    return utils.promisify(false, 'upload aborted');
  }

  if (!this.fileRecord.method) {
    signing = this.config.uploadMethods.param + this.config.uploadMethods.singlePart;
  }

  tokens = {
    id: this.fileRecord.id,
    method: signing
  };

  url = utils.parseTokens(this.api.config.host + this.config.upload, tokens);

  request = new Request({
    url: url,
    token: this.api.getToken(),
    method: 'POST',
    data: this.fileRecord
  });

  return request.send()
          .then(this._initializeComplete.bind(this));

};

/**
 * Store the information returned from the initialize request.
 * @private
 */
Upload.prototype._initializeComplete = function (response) {
  this.initialized = true;
  this.fileRecord.key = response.data.key;
  this.fileRecord.uploadId = response.data.uploadId;
  this.chunkSize = response.data.pieceSize;
  this.chunkCount = response.data.pieceCount;
};

/**
 * Setup the upload depending on its type, single or multi part.
 * @return {Promise} A promise which resolves when all of the pieces have completed uploading.
 */
Upload.prototype._prepareUpload = function () {
  if (!this.fileRecord.method) {
    // Singlepart.
    return this._uploadFile()
      .then(this._onCompleteUpload.bind(this));
  }

  // Multipart.
  return this._createChunks()
    .then(this._completeUpload.bind(this));
};

/**
 * Break a file into blobs and create a chunk object for each piece.
 * @private
 * @return {Promise} A promise which resolves when all of the pieces have completed uploading.
 */
Upload.prototype._createChunks = function () {
  var sliceMethod = this._getSliceMethod(this.file);
  var i, blob, chunk, start, end,
    chunkPromises = [];

  if (this.aborted) {
    this.abort();
    return utils.promisify(false, 'upload aborted');
  }

  for (i = 0; i < this.chunkCount; i++) {

    start = i * this.chunkSize;
    // Choose the smaller value, so that we don't go over the filesize.
    end = Math.min((i + 1) * this.chunkSize, this.fileRecord.size);

    blob = this.file[sliceMethod](start, end);

    chunk = {
      partNumber: i + 1,
      data: blob
    };

    this.chunks.push(chunk);

    chunkPromises.push(this._uploadChunk.bind(this, chunk));

  }

  // Store a reference for pausing and resuming.
  this.multiPartPromise = utils.series(chunkPromises, this.paused);

  return this.multiPartPromise;
};

/**
 * Create a promise chain for each chunk to be uploaded.
 * @private
 * @return {Promise} A promise which resolves when the request is complete.
 */
Upload.prototype._uploadChunk = function (chunk) {
  var promise = Promise();

  // Break the promise chain.
  this._signUpload(chunk)
    .then(this._sendUpload.bind(this, chunk))
    .then(this._completeChunk.bind(this, chunk, promise));

  return promise;
};

/**
 * Create a promise chain for a single part file upload.
 * @param  {file}   file    A file reference to upload.
 * @return {Promise} A promise which resolves when the request is complete.
 */
Upload.prototype._uploadFile = function () {
  var chunk = {
    data: this.file
  };

  // Create a new promise if one doesn't exist.
  if (!this.singlePartPromise) {
    this.singlePartPromise = Promise();
  }

  // Broken off the chain, this will allow us to cancel single part uploads without breaking the
  // initial chain.
  this._signUpload(chunk)
    .then(this._sendUpload.bind(this, chunk))
    .then(this._sendSinglepartComplete.bind(this))
    .then(this._updateProgress.bind(this, 100, this.fileRecord.size))
    .then(this._uploadFileComplete.bind(this));

  return this.singlePartPromise;
};

/**
 *  Resolve the single part upload promise;
 */
Upload.prototype._uploadFileComplete = function () {
  this.singlePartPromise(true, []);
};

/**
 * Make a request and sign the chunk to be uploaded.
 * @private
 * @param  {object}   chunk           Information about the chunk to be uploaded.
 * @return {Promise}                  A promise which resolves when the request is complete.
 */
Upload.prototype._signUpload = function (chunk) {
  var url;
  var signing = '';
  var headers = {};
  var request;

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

  request = new Request({
    url: url,
    token: this.api.getToken(),
    method: 'POST',
    headers: headers,
    data: this.fileRecord
  });

  return request.send();
};

/**
 * Send the upload to the server.
 * @private
 * @param   {object} upload  An object representing the upload to send to the server.
 * @return  {Promise}       A promise which resolves when the request is complete.
 */
Upload.prototype._sendUpload = function (upload, response) {
  var headers = {};
  var request;

  // Set the proper headers to send with the file.
  headers['Content-Type'] = this.fileRecord.contentType;

  headers.authorization = response.data.authHeader;
  headers['x-amz-date'] = response.data.dateHeader;
  headers['x-amz-security-token'] = response.data.securityToken;

  request = new Request({
    url: response.data.url,
    method: 'PUT',
    headers: headers,
    data: upload.data,
    ignoreAcceptHeader: true,
    requestProgress: this._requestProgress.bind(this),
  });

  this.requestPromise = request;

  return request.send();
};

/**
 * Update the progress of requestProgress
 */
Upload.prototype._requestProgress = function (uploadedBytes, totalBytes) {
  var progress;

  // BUGWATCH: if we change this to upload multiple chunks at once this will have to be written
  // other chunks completed data + the current chunk in the request
  progress = (this.uploadedBytes + uploadedBytes) / this.fileRecord.size;
  progress *= 99;
  progress = Math.round(progress);

  this._updateProgress(progress, totalBytes);
};

/**
 * Update the upload bytes value when a single part file is uploaded.
 */
Upload.prototype._sendSinglepartComplete = function () {
  this.uploadComplete = true;
  this.uploadedBytes = this.fileRecord.size;
};

/**
 *  Executed when a chunk is finished uploading.
 *  @private
 *  @param {object}   chunk   The current chunk that was uploaded.
 *  @param {Promise}  promise The promise to resolve when the chunk is complete.
 */
Upload.prototype._completeChunk = function (chunk, promise) {
  this.chunksComplete++;
  chunk.complete = true;
  this.uploadedBytes += chunk.data.size;

  // Upload is complete.
  if (this.chunksComplete === this.chunkCount) {
    this.uploadComplete = true;
  }

  // Resolve the promise.
  promise(true, []);
};

/**
 * Notify the server that the upload is complete.
 *
 * @private
 * @return  {Promise} A promise which resolves when the request is complete.
 */
Upload.prototype._completeUpload = function () {
  var url;
  var tokens;
  var request;

  // Early return so we don't process any of the complete information on an aborted upload.
  if (this.aborted) {
    return utils.promisify(false, 'Upload Aborted.');
  }

  tokens = {
    id: this.fileRecord.id
  };

  url = utils.parseTokens(this.api.config.host + this.config.uploadComplete, tokens);

  request = new Request({
    url: url,
    token: this.api.getToken(),
    method: 'POST',
    data: this.fileRecord
  });

  return request.send()
          .then(this._onCompleteUpload.bind(this));
};

/**
 * Return the id for the current file record.
 * @private
 * @return {string} ID for the input record that was created.
 */
Upload.prototype._onCompleteUpload = function () {
  // Send the final progress update once the upload is actually complete.
  this._updateProgress(100);

  this.uploadComplete = true;
  this.multiPartPromise = null;
  this.requestPromise = null;
  this.singlePartPromise = null;
  return this.fileRecord.id;
};

/**
 * Aborts an input upload
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
Upload.prototype.abort = function () {
  var url;
  var tokens;
  var request;

  this.aborted = true;

  // If initialize hasn't been called yet there is no need to abort the upload as it doesn't
  // exist yet.
  if (!this.initialized) {

    if (this.created) {
      // If the input has been created simply return early with a
      // promise to delete the created input record.
      return this.api.inputs.delete(this.fileRecord.id);
    }

    // Resolve as a successful promise. This case would be fulfilled when an upload
    // has been created but save() hasn't yet been called.
    return utils.promisify(true);

  }

  // Cancel the current request.
  if (this.requestPromise) {
    this.requestPromise.cancel();
    this.requestPromise = null;
  }

  if (this.singlePartPromise) {
    this.singlePartPromise = null;
    // Return here because there is no need to abort a single part upload.
    return this._abortComplete();
  }

  if (this.multiPartPromise) {
    this.multiPartPromise.cancel();
    this.multiPartPromise = null;
  }

  tokens = {
    id: this.fileRecord.id,
    method: ''
  };

  url = utils.parseTokens(this.api.config.host + this.config.uploadAbort, tokens);

  request = new Request({
    url: url,
    token: this.api.getToken(),
    method: 'POST',
    data: this.fileRecord
  });

  return request.send()
    .then(this._abortComplete.bind(this));

};

/**
 * Aborts an input upload
 * @param {function} callback Callback executed when the request is complete, or an error occurs.
 */
Upload.prototype.abortSync = function (callback) {
  var url;
  var tokens;
  var request;

  this.aborted = true;

  // If initialize hasn't been called yet there is no need to abort the upload as it doesn't
  // exist yet.
  if (!this.initialized) {

    if (this.created) {
      // If the input has been created simply return early and delete the input.
      this.api.inputs.deleteSync(this.fileRecord.id, callback);
      return;
    }

    // Resolve as a successful promise. This case would be fulfilled when an upload
    // has been created but save() hasn't yet been called.
    callback(null);
    return;

  }

  // Cancel the current request.
  if (this.requestPromise) {
    this.requestPromise.cancel();
    this.requestPromise = null;
  }

  if (this.singlePartPromise) {
    this.singlePartPromise = null;
    // Return here because there is no need to abort a single part upload.
    this.api.inputs.deleteSync(this.fileRecord.id, callback);
    return;
  }

  // If we have a multi part promise we need to cancel it
  if (this.multiPartPromise) {
    this.multiPartPromise.cancel();
    this.multiPartPromise = null;
  }

  tokens = {
    id: this.fileRecord.id,
    method: ''
  };

  url = utils.parseTokens(this.api.config.host + this.config.uploadAbort, tokens);

  request = new Request({
    url: url,
    async: false,
    token: this.api.getToken(),
    method: 'POST',
    data: this.fileRecord
  });

  request.sendSync(this.abortSyncComplete.bind(this, callback));
};

/**
 * Delete the input when the abort call completes and then execute the callback.
 *
 * @param {Function} callback - Synchronous callback
 * @param {object}   error    - Error from abort call.
 */
Upload.prototype.abortSyncComplete = function (callback, error) {

  if (!error) {
    this.api.inputs.deleteSync(this.fileRecord.id, callback);
  } else if (typeof callback === 'function') {
    callback(error);
  } else {
    throw error;
  }

};

/**
 * Delete the input that was created.
 * @private
 * @return {Promise} A promise which resolves when the request is complete.
 */
Upload.prototype._abortComplete = function () {
  return this.api.inputs.delete(this.fileRecord.id);
};

/**
 * Pause the current upload.
 */
Upload.prototype.pause = function () {
  // Return early if the upload portion is complete.
  // The work is done by now so we might as well fire the
  // complete call.
  if (this.uploadComplete) {
    return;
  }

  this.paused = true;

  // Is there a multipart upload
  if (this.multiPartPromise) {
    // Pause the series if its a multipart upload.
    this.multiPartPromise.pause();
  }

  // Abort the upload if its a singlepart upload and cancel the request if it is a multipart promise
  if (this.requestPromise) {
    this.requestPromise.cancel();
  }
};

/**
 * Resume the current upload.
 */
Upload.prototype.resume = function () {
  this.paused = false;

  if (this.multiPartPromise) {
    // Resume the series if it's multipart.
    this.multiPartPromise.resume();
  } else if (this.requestPromise) {
    // Restart the file upload.
    this._uploadFile();
  }

};

/**
 * Check the file size to determine if it should be a multipart upload, returns false for singlepart uploads.
 * @private
 *
 * @param {File} file - The file to evaluate.
 *
 * @return {boolean} - True if the file will be uploading using mutlipart upload.
 */
Upload.prototype._checkMultipart = function (file) {
  if (!file) {
    throw new Error('Upload::_checkMultipart - A file object is required.');
  }

  return file.size > (5 * 1024 * 1024);
};

/**
 * Function that determines the slice method to be used
 * @private
 * @param {object} file - The file object you wish to determine the slice method for
 * @return {string} sliceMethod - The slice method to use.
 */
Upload.prototype._getSliceMethod = function (file) {
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
