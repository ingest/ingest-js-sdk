var Request = require('./Request.js');
var Promise = require('pinkyswear');
var extend = require('extend');
var utils = require('./Utils.js');
var JWTUtils = require('./JWTUtils');

/**
 * Create a new upload wrapper.  Manages the entire upload of a file.
 * @class
 * @return {[type]} [description]
 */
function Upload (options) {

  this.defaults = {
    api: null,
    file: null,
    host: 'https://api.ingest.io',
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

  this.fileRecord = {
    filename: this.file.name,
    type: this.file.type,
    size: this.file.size,
    method: this.checkMultipart(this.file)
  };

};

/**
 * Register a function to execute when a chunk completes uploading.
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Upload.prototype.progress = function (callback) {
  this.config.progress = callback.bind(this);
};

/**
 * Register a function to execute when the upload is complete.
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
Upload.prototype.complete = function (callback) {
  this.config.complete = callback.bind(this);
};

// Start the upload process.
Upload.prototype.save = function () {
  this.create(this.fileRecord)
    .then(this.initialize.bind(this))
    .then(this.createChunks.bind(this))
    .then(this.uploadChunks.bind(this))
    .then(this.completeUpload.bind(this));
};

/**
 * Update the progress function with the provided values.
 * @param  {[type]} message [description]
 * @return {[type]}         [description]
 */
Upload.prototype.updateProgress = function (message, percent) {

  if (!this.config.progress) {
    return;
  }

  this.config.progress.call(this, message, percent);
};

Upload.prototype.completeUpload = function () {
  
  if (!this.config.complete) {
    return;
  }

  this.config.complete.call();
};  

/**
 * Create the input record.
 * @return {[type]} [description]
 */
Upload.prototype.create = function (record) {
  console.log('create');
  return this.api.inputs.add([record]).then(this._createSuccess.bind(this));
};

/**
 * Return the data object from the response.
 * @private
 * @param  {[type]} response [description]
 * @return {[type]}          [description]
 */
Upload.prototype._createSuccess = function (response) {
  this.updateProgress('Input Created.', 0);
  this.fileRecord.id = response.data[0].id;
  return this.fileRecord.id;
};

/**
 * Initializes an Input for upload
 * @param  {string}  inputId     An id for the input you wish to delete
 * @param  {object}  data        The object containing data for the upload initialization.
 * @param  {string}  data.type   The content type of the item you wish to upload
 * @param  {number}  data.size   The size of the item you wish to upload
 * @param  {boolean} data.method A boolean representing whether or not it is a multipart upload
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
Upload.prototype.initialize = function () {

  var url;
  var tokens;
  var signing = '';

  if (typeof this.fileRecord.id !== 'string') {
    return utils.promisify(false,
      'IngestAPI initializeUploadInput requires a valid input ID passed as a string.');
  }

  if (typeof this.fileRecord.type !== 'string') {
    return utils.promisify(false,
      'Missing or invalid property : type.');
  }

  if (typeof this.fileRecord.size !== 'number') {
    return utils.promisify(false,
      'Missing or invalid property : size');
  }

  if (!this.fileRecord.method) {
    signing = this.config.uploadMethods.param + this.config.uploadMethods.singlePart;
  }

  tokens = {
    id: this.fileRecord.id,
    method: signing
  };

  url = utils.parseTokens(this.config.host + this.config.upload, tokens);

  return new Request({
    url: url,
    token: this.api.getToken(),
    method: 'POST',
    data: this.fileRecord
  }).then(this._initializeComplete.bind(this));

};

/**
 * @private
 * @return {[type]} [description]
 */
Upload.prototype._initializeComplete = function (response) {
  console.log('Initialize response : ', response);
  this.fileRecord.key = response.data.key;
  this.fileRecord.uploadId = response.data.uploadId;
  this.chunkSize = response.data.pieceSize;
  this.chunkCount = response.data.pieceCount;
  this.updateProgress('Initialization Complete.', 0);
};

/**
 * Break the file into chunks for upload.
 * @return {[type]} [description]
 */
Upload.prototype.createChunks = function () {
  console.log('Create chunks.');

  var sliceMethod = this.getSliceMethod(this.file);
  var i, chunk;

  console.log('Slice Method : ', sliceMethod);
  console.log('Chunk count : ', this.chunkCount);
  console.log('Chunk Size : ', this.chunkSize);

  for (i = 0; i < this.chunkCount - 1; i++) {
    
    chunk = this.file[sliceMethod](i * this.chunkSize, (i + 1) * this.chunkSize);
    
    this.chunks.push({
      partNumber: i + 1,
      data: chunk
    });

  }
};

/**
 * Create a promise chain for each chunk to be uploaded.
 * @return {[type]} [description]
 */
Upload.prototype.uploadChunks = function () {

  console.log('Upload chunks here. ', this);

  var chunk = this.chunks[0];

  console.log('Chunk : ', chunk);
  console.log('Chunk Type : ', typeof chunk);

  return this.signChunk(this.chunks[0])
    .then(this.sendChunk.bind(this, this.chunks[0]));

};

/**
 * Make a request and sign the blob to be uploaded.
 * @param  {object}   data            File data used to sign the upload.
 * @param  {string}   data.id         The uuid in the ingest service that represents a video record,
 * @param  {string}   data.key        The key associated with the file on AWS.
 * @param  {string}   data.uploadId   An id provided by amazon s3 to track multi-part uploads.
 * @param  {string}   data.partNumber The part of the file being signed.
 * @param  {boolean}  data.method     Whether or not the file requires singlepart or multipart uploading.
 *
 * @return {Promise}                  A promise which resolves when the request is complete.
 */
Upload.prototype.signChunk = function (chunk, index) {

  // Set the part number for the current chunk.
  this.fileRecord.partNumber = chunk.partNumber;

  var checkObject = this.validFullUploadObject(this.fileRecord);
  var url;
  var signing = '';
  var headers = {};

  headers['Content-Type'] = 'multipart/form-data';

  // Make sure all the proper properties have been passed in.
  if (!checkObject.valid) {
    return utils.promisify(false, checkObject.message);
  }

  if (!this.fileRecord.method) {
    signing = this.config.uploadMethods.param + this.config.uploadMethods.singlePart;
  }

  url = utils.parseTokens(this.config.host + this.config.sign, {
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
 * Send the chunk to the server.
 * @return {[type]} [description]
 */
Upload.prototype.sendChunk = function (chunk, response) {

  var headers = {};

  var formData = new FormData();
  formData.append('file', chunk.data);

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
 * [validSimpleUploadObject description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
Upload.prototype.validSimpleUploadObject = function (data) {
  return this.validateUploadObject({
    key: 'string',
    uploadId: 'string'
  }, data);
};

/**
 * [validFullUploadObject description]
 * @param  {[type]} data [description]
 * @return {[type]}      [description]
 */
Upload.prototype.validFullUploadObject = function (data) {
  var result = this.validateUploadObject({
    key: 'string',
    uploadId: 'string',
    partNumber: 'number',
    method: 'boolean'
  }, data);

  // For the case of single part uploads, the uploadId is not required.
  if (data.hasOwnProperty('method') && !data.method && !data.uploadId) {
    result.valid = true;
    result.message = '';
  }

  return result;
};

/**
 * Validate the object supplying the upload data.
 * @param  {object}   data            File data used to sign the upload.
 * @param  {string}   data.id         The uuid in the ingest service that represents a video record,
 * @param  {string}   data.key        The key associated with the file on AWS.
 * @param  {string}   data.uploadId   An id provided by amazon s3 to track multi-part uploads.
 * @param  {string}   data.partNumber The part of the file being signed.
 * @param  {boolean}  data.method     Whether or not the file requires singlepart or multipart uploading.
 *
 * @return {boolean}  Boolean         Representing weather or not the object is valid.
 **/
Upload.prototype.validateUploadObject = function (validationObject, data) {

  var result = {
    valid: true,
    message: ''
  };

  var keys = Object.keys(validationObject);
  var i, keysLength, item, validation;
  keysLength = keys.length;

  for (i = 0; i < keysLength; i++) {

    validation = validationObject[keys[i]];

    if (typeof data[keys[i]] !== validation) {
      result.valid = false;
      result.message = 'The passed value for ' + keys[i] + ' was not of type ' + validation;

      break;
    }

  }

  return result;

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
Upload.prototype.completeUpload = function (inputId, data) {

  var url;
  var tokens;
  var checkObject = this.validSimpleUploadObject(data);

  if (typeof inputId !== 'string') {
    return utils.promisify(false,
      'IngestAPI initializeUploadInput requires a valid input ID passed as a string.');
  }

  // Make sure all the proper properties have been passed in.
  if (!checkObject.valid) {
    return utils.promisify(false, checkObject.message);
  }

  tokens = {
    id: inputId
  };

  url = utils.parseTokens(this.config.host + this.config.inputsUploadComplete, tokens);

  return new Request({
    url: url,
    token: this.api.getToken(),
    method: 'POST',
    data: data
  });

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
Upload.prototype.abortInputUpload = function (inputId, data) {

  var url;
  var tokens;
  var checkObject = this.validSimpleUploadObject(data);

  if (typeof inputId !== 'string') {
    return utils.promisify(false,
      'IngestAPI initializeUploadInput requires a valid input ID passed as a string.');
  }

  // Make sure all the proper properties have been passed in.
  if (!checkObject.valid) {
    return utils.promisify(false, checkObject.message);
  }

  tokens = {
    id: inputId
  };

  url = utils.parseTokens(this.config.host + this.config.inputsUploadAbort, tokens);

  return new Request({
    url: url,
    token: this.api.getToken(),
    method: 'POST',
    data: data
  });
};

/**
 * Check the file size to determine if it should be a multipart upload, returns false for singlepart uploads.
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
Upload.prototype.checkMultipart = function (file) {  
  if (!file) {
    return;
  }

  return (file.size <= (5 * 1024 * 1024) ? false : true);
};

/**
 * @description Function that determines the slice method to be used
 *
 * @param {object} file - The file object you wish to determine the slice method for
 *
 * @return {string} slice_method - The slice_method that is to be used
 */
Upload.prototype.getSliceMethod = function (file) {
  var slice_method;

  if ('mozSlice' in file) {
    slice_method = 'mozSlice';
  } else if ('webkitSlice' in file) {
    slice_method = 'webkitSlice';
  } else {
    slice_method = 'slice';
  }

  return slice_method;
};

module.exports = Upload;
