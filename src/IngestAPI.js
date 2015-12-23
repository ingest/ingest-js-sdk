var Request = require('./Request.js');
var Promise = require('pinkyswear');
var extend = require('extend');
var JWTUtils = require('./JWTUtils');
var utils = require('./Utils');
var Resource = require('./Resource');

/**
 * IngestAPI Object
 * @class
 * @param {object}  options        Options to override the default.
 * @param {string}  options.host   Override the default live host.
 * @param {string}  options.token  Auth token to use for requests.
 */
function IngestAPI (options) {

  this.defaults = {
    'host': 'https://api.ingest.io',
    'videos': '/videos',
    'videoById': '/videos/<%=id%>',
    'thumbnails': '/videos/<%=id%>/thumbnails',
    'trash': '/videos?filter=trashed',
    'networks': '/networks',
    'networksKeys': '/networks/keys',
    'networksKeysById': '/networks/keys/<%=id%>',
    'inputs': '/encoding/inputs',
    'inputsById' : '/encoding/inputs/<%=id%>',
    'inputsUpload': '/encoding/inputs/<%=id%>/upload<%=method%>',
    'inputsUploadSign': '/encoding/inputs/<%=id%>/upload/sign<%=method%>',
    'inputsUploadComplete': '/encoding/inputs/<%=id%>/upload/complete',
    'inputsUploadAbort': '/encoding/inputs/<%=id%>/upload/abort',
    'uploadMethods': {
      'param': '?type=',
      'singlePart': 'amazon',
      'multiPart': 'amazonMP'
    },
    'deleteMethods': {
      'permanent': '?permanent=1'
    },
    'search': '/<%=resource%>?search=<%=input%>',
    'currentUserInfo': '/users/me'
  };

  // Create a config object by extending the defaults with the pass options.
  this.config = extend(true, {}, this.defaults, options);

  this.token = null;

  if (this.config.token) {
    // Store the token for future use.
    this.setToken(this.config.token);
  }

  this.request = Request;
  this.JWTUtils = JWTUtils;
  this.utils = utils;

  this.videos = new Resource({
    host: this.config.host,
    resource: 'videos',
    tokenSource: this.getToken.bind(this)
  });

  this.playlists = new Resource({
    host: this.config.host,
    resource: 'playlists',
    tokenSource: this.getToken.bind(this)
  });

}
/** Token **/
/**
 * Set the auth token to use.
 * @param   {String}        token Auth token to use.
 */
IngestAPI.prototype.setToken = function (token) {

  // Make sure a valid value is passed.
  if (typeof token !== 'string') {
    throw new Error('IngestAPI requires an authentication token passed as a string.');
  }

  this.token = token;
};

/**
 * Return the current auth token.
 * @return  {String}        Current auth token, or null if a token has not been set.
 */
IngestAPI.prototype.getToken = function () {
  return this.token;
};

/** Uploads **/

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
IngestAPI.prototype.signUploadBlob = function (data) {

  var checkObject = this.validateUploadObject(data);
  var url;
  var tokens;
  var signing = '';

  // Make sure all the proper properties have been passed in.
  if (!checkObject.valid) {
    return utils.promisify(false, checkObject.message);
  }

  if (!data.method) {
    signing = this.config.uploadMethods.param + this.config.uploadMethods.singlePart;
  }

  // Replacing <%=id%> with data.id
  // Replacing <%=method%> with '?type=amazon' or ''
  tokens = {
    id: data.id,
    method: signing
  };

  url = utils.parseTokens(this.config.host + this.config.inputsUploadSign, tokens);

  return new Request({
    url: url,
    token: this.getToken(),
    method: 'POST',
    data: data
  });
};

/**
 * Validate the object supplying the upload key and uploadId.
 * @private
 *
 * @param  {object}   data            File data used to sign the upload.
 * @param  {string}   data.key        The key associated with the file on AWS.
 * @param  {string}   data.uploadId   An id provided by amazon s3 to track multi-part uploads.
 *
 * @return {boolean}  Boolean         Representing weather or not the object is valid.
 **/
IngestAPI.prototype._validateUploadIds = function (data) {

  var result = {
    valid: true,
    message: ''
  };

  if (typeof data !== 'object') {
    result.valid = false;
    result.message = 'The passed value was not an object.';
  }

  if (typeof data.key !== 'string') {
    result.valid = false;
    result.message = 'Missing or invalid property : key.';
  }

  if (typeof data.uploadId !== 'string') {
    result.valid = false;
    result.message = 'Missing or invalid property : uploadId';
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
IngestAPI.prototype.validateUploadObject = function (data) {

  var validIds = this._validateUploadIds(data);
  var result = {
    valid: true,
    message: ''
  };

  if (typeof data !== 'object') {
    result.valid = false;
    result.message = 'The passed value was not an object.';
  }

  // Make sure all the proper properties have been passed in.
  if (!validIds.valid) {
    result = validIds;
  }

  if (typeof data.id !== 'string') {
    result.valid = false;
    result.message = 'Missing or invalid property : id.';
  }

  if (typeof data.partNumber !== 'number') {
    result.valid = false;
    result.message = 'Missing or invalid property : partNumber';
  }

  if (!data.hasOwnProperty('method') || typeof data.method !== 'boolean') {
    result.valid = false;
    result.message = 'Missing or invalid property : method';
  }

  // For the case of single part uploads, the uploadId is not required.
  if (data.hasOwnProperty('method') && !data.method && !data.uploadId) {
    result.valid = true;
    result.message = '';
  }

  return result;
};

/**
 * Return a list of inputs for the current user and network.
 * @param  {object}  headers Javascript object representing headers to apply to the call.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
IngestAPI.prototype.getInputs = function (headers) {

  return new Request({
    url: this.config.host + this.config.inputs,
    token: this.getToken(),
    headers: headers
  });
};

/**
 * Return an input that matches the supplied id.
 * @param  {string}  inputId ID for the requested video.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
IngestAPI.prototype.getInputsById = function (inputId) {

  var url;
  var tokens;

  if (typeof inputId !== 'string') {
    // Wrap the error in a promise so the user is still catching the errors.
    return utils.promisify(false,
      'IngestAPI getInputsById requires a valid inputId as a string.');
  }

  tokens = {
    id: inputId
  };

  url = utils.parseTokens(this.config.host + this.config.inputsById, tokens);

  return new Request({
    url: url,
    token: this.getToken()
  });
};

/**
 * Add a new input.
 * @param  {array}  inputObject An object representing the input to add.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
IngestAPI.prototype.addInputs = function (inputs) {

  // Validate the object being passed in.
  if (!Array.isArray(inputs)) {
    // Wrap the error in a promise.
    return utils.promisify(false,
      'IngestAPI addInput requires an array of input objects.');
  }

  // Return the promise from the request.
  return new Request({
    url: this.config.host + this.config.inputs,
    token: this.getToken(),
    method: 'POST',
    data: inputs
  });
};

/**
 * Delete a single input
 * @param  {string}  inputId An id for the input you wish to delete
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
IngestAPI.prototype.deleteInput = function (inputId) {

  var url;
  var tokens;

  if (typeof inputId !== 'string') {
    return utils.promisify(false,
      'IngestAPI deleteInput requires a video ID passed as a string.');
  }

  tokens = {
    id: inputId
  };

  url = utils.parseTokens(this.config.host + this.config.inputsById, tokens);

  return new Request({
    url: url,
    token: this.getToken(),
    method: 'DELETE'
  });
};

/**
 * Delete many inputs
 * @param  {array}   inputs An array of inputs to be deleted
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
IngestAPI.prototype.deleteInputs = function (inputs) {

  var url;

  if (!Array.isArray(inputs)) {
    return utils.promisify(false,
      'IngestAPI deleteInputs requires an array of input Ids');
  }

  url = this.config.host + this.config.inputs;

  return new Request({
    url: url,
    token: this.getToken(),
    method: 'DELETE',
    data: inputs
  });
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
IngestAPI.prototype.initializeInputUpload = function (inputId, data) {

  var url;
  var tokens;
  var signing = '';

  if (typeof inputId !== 'string') {
    return utils.promisify(false,
      'IngestAPI initializeUploadInput requires a valid input ID passed as a string.');
  }

  if (typeof data.type !== 'string') {
    return utils.promisify(false,
      'Missing or invalid property : type.');
  }

  if (typeof data.size !== 'number') {
    return utils.promisify(false,
      'Missing or invalid property : size');
  }

  if (!data.method) {
    signing = this.config.uploadMethods.param + this.config.uploadMethods.singlePart;
  }

  tokens = {
    id: inputId,
    method: signing
  };

  url = utils.parseTokens(this.config.host + this.config.inputsUpload, tokens);

  return new Request({
    url: url,
    token: this.getToken(),
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
IngestAPI.prototype.completeInputUpload = function (inputId, data) {

  var url;
  var tokens;
  var checkObject = this._validateUploadIds(data);

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
    token: this.getToken(),
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
IngestAPI.prototype.abortInputUpload = function (inputId, data) {

  var url;
  var tokens;
  var checkObject = this._validateUploadIds(data);

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
    token: this.getToken(),
    method: 'POST',
    data: data
  });
};

/** Network Information **/

/**
 * Get the current network primary key in RSA format.
 * @return {Promise} Promise/A+ spec which resolves with the primary network key.
 */
IngestAPI.prototype.getNetworkSecureKeys = function () {
  return new Request({
    url: this.config.host + this.config.networksKeys,
    token: this.getToken()
  });
};

/**
 * Adds a new secure key to the current network.
 * @param {object}  data        The object containing data for the secure key entry.
 * @param {string}  data.title  Optional. The title of the secure key. Will default to "Default Key Title"
 * @param {string}  data.key    The public key in RSA format.
 *
 * @return {Promise}          A promise which resolves when the request is complete.
 */
IngestAPI.prototype.addNetworkSecureKey = function (data) {
  if (typeof data !== 'object') {
    return utils.promisify(false,
      'IngestAPI addNetworkSecureKey requires data to be passed as an object.');
  }

  // The title must be a string.
  if (typeof data.title !== 'string') {
    data.title = '';
  }

  if (typeof data.key !== 'string') {
    return utils.promisify(false,
      'IngestAPI addNetworkSecureKey requires that the key be a string in RSA public key format.');
  }

  return new Request({
    url: this.config.host + this.config.networksKeys,
    token: this.getToken(),
    method: 'POST',
    data: data
  });
};

/**
 * Retrieves a single network secure key entry based on the UUID given.
 * @param {string}  id  The UUID of the secure key entry.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
IngestAPI.prototype.getNetworkSecureKeyById = function (id) {
  var tokens, url;

  if (typeof id !== 'string') {
    return utils.promisify(false,
      'IngestAPI getNetworkSecureKeyById requires an id to be passed as a string.');
  }

  tokens = {
    id: id
  };

  url = utils.parseTokens(this.config.host + this.config.networksKeysById, tokens);

  return new Request({
    url: url,
    token: this.getToken()
  });
};

/**
 * Updates an individual secure key entry in the current network.
 * @param {object}  data        The object containing data for the secure key entry.
 * @param {string}  data.title  The title for the current network.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
IngestAPI.prototype.updateNetworkSecureKey = function (data) {
  var tokens, url;

  if (typeof data !== 'object') {
    return utils.promisify(false,
      'IngestAPI updateNetworkSecureKeyById requires data to be passed as an object.');
  }

  if (typeof data.id !== 'string') {
    return utils.promisify(false,
      'IngestAPI updateNetworkSecureKeyById requires a param "id" to be a string.');
  }

  if (typeof data.title !== 'string') {
    data.title = '';
  }

  tokens = {
    id: data.id
  };

  url = utils.parseTokens(this.config.host + this.config.networksKeysById, tokens);

  return new Request({
    url: url,
    token: this.getToken(),
    method: 'PATCH',
    data: data
  });
};

/**
 * Deletes a single network secure key entry based on the UUID given.
 * @param {string}  id  The UUID of the secure key entry.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
IngestAPI.prototype.deleteNetworkSecureKeyById = function (id) {
  var tokens, url;

  if (typeof id !== 'string') {
    return utils.promisify(false,
      'IngestAPI deleteNetworkSecureKeyById requires an id to be passed as a string.');
  }

  tokens = {
    id: id
  };

  url = utils.parseTokens(this.config.host + this.config.networksKeysById, tokens);

  return new Request({
    url: url,
    token: this.getToken(),
    method: 'DELETE'
  });
};

/** User Information **/

/*
 * Retrieve information for the current user.
 * @return {object} A data object representing the user.
 */
IngestAPI.prototype.getCurrentUserInfo = function () {
  return new Request({
    url: this.config.host + this.config.currentUserInfo,
    token: this.getToken()
  });
};

module.exports = IngestAPI;
