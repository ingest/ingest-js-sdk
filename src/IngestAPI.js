var Request = require('./Request.js');
var Promise = require('pinkyswear');
var extend = require('extend');

/**
 * IngestAPI Object
 * @param {object}  options        Options to override the default.
 * @param {string}  options.host   Override the default live host.
 * @param {string}  options.token  Auth token to use for requests.
 */
function IngestAPI (options) {

  this.defaults = {
    'host': 'https://api.ingest.io',
    'videos': '/videos',
    'videoById': '/videos/<%=id%>',
    'uploadSign': '/videos/<%=id%>/upload/sign<%=method%>',
    'trash': '/videos?filter=trashed',
    'uploadMethods': {
      'param': '?type=',
      'singlePart': 'amazon',
      'multiPart': 'amazonMP'
    }
  };

  // Create a config object by extending the defaults with the pass options.
  this.config = extend(true, {}, this.defaults, options);

  if (this.config.token) {
    // Store the token for future use.
    this.setToken(this.config.token);
  }

  this.request = Request;

}

/**
 * Set the auth token to use.
 * @param   {String}        token Auth token to use.
 */
IngestAPI.prototype.setToken = function (token) {

  // Make sure a valid value is passed.
  if (!token || typeof token !== 'string') {
    throw new Error('IngestAPI requires an authentication token passed as a string.');
  }

  this.token = token;

};

/**
 * Return the current auth token.
 * @return  {String}        Current auth token.
 */
IngestAPI.prototype.getToken = function () {

  if (!this.token) {
    throw new Error('IngestAPI requires a token to be set.');
  }

  return this.token;

};

/**
 * Return a list of videos for the current user and network.
 * @param {object} headers Javascript object representing headers to apply to the call.
 * @return  {JSON}          A JSON object representing the videos.
 */
IngestAPI.prototype.getVideos = function (headers) {

  return new Request({
    url: this.config.host + this.config.videos,
    token: this.getToken(),
    headers: headers
  });

};

/**
 * Return a video match the supplied id.
 * @param   {String}       videoId ID for the requested video.
 * @return  {JSON}         JSON object representing the requested video.
 */
IngestAPI.prototype.getVideoById = function (videoId) {

  var url;
  var tokens;

  if (!videoId || typeof videoId !== 'string') {
    // Wrap the error in a promise so the user is still catching the errors.
    return this.promisify(false,
      'IngestAPI getVideoById requires a valid videoId as a string.');
  }

  tokens = {
    id: videoId
  };

  url = this.parseTokens(this.config.host + this.config.videoById, tokens);

  return new Request({
    url: url,
    token: this.getToken()
  });

};

/**
 * Add a new video.
 * @param   {object}  videoObject An object representing the video to add.
 */
IngestAPI.prototype.addVideo = function (videoObject) {

  // Validate the object being passed in.
  if (!videoObject || typeof videoObject !== 'object') {
    // Wrap the error in a promise.
    return this.promisify(false,
      'IngestAPI addVideo requires a video object.');
  }

  // Return the promise from the request.
  return new Request({
    url: this.config.host + this.config.videos,
    token: this.getToken(),
    method: 'POST',
    data: videoObject
  });

};

/**
 * Delete a video.
 * @param  {string}   videoId   ID for the video to delete.
 */
IngestAPI.prototype.deleteVideo = function (videoId) {

  var url;
  var tokens;

  if (!videoId || typeof videoId !== 'string') {
    return this.promisify(false,
      'IngestAPI deleteVideo requires a video ID passed as a string.');
  }

  tokens = {
    id: videoId
  };

  url = this.parseTokens(this.config.host + this.config.videoById, tokens);

  return new Request({
    url: url,
    token: this.getToken(),
    method: 'DELETE'
  });

};

/**
 * Get the total count of videos.
 * @return {number} The number of videos in the current network.
 */
IngestAPI.prototype.getVideosCount = function () {

  return new Request({
    url: this.config.host + this.config.videos,
    token: this.getToken(),
    method: 'HEAD'
  }).then(this.getCountResponse.bind(this));

};

/**
 * Get a count of the current videos in the trash.
 * @return {Promise} Promise/A+ spec which resolves with the trashed video count.
 */
IngestAPI.prototype.getTrashedVideosCount = function () {

  return new Request({
    url: this.config.host + this.config.trash,
    token: this.getToken(),
    method: 'HEAD'
  }).then(this.getCountResponse.bind(this));

};

/**
 * Handle the response from the retrieving video counts.
 * @param  {object} response  Request response object.
 * @return {number}           The resource count from the response.
 */
IngestAPI.prototype.getCountResponse = function (response) {

  return parseInt(response.headers('Resource-Count'), 10);

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
 * @return {Promise}                  Promise/A+ spec which resolves with the signed token object.
 */
IngestAPI.prototype.signUploadBlob = function (data) {

  var checkObject = this.validateUploadObject(data);
  var url;
  var tokens;
  var signing = '';

  // Make sure all the proper properties have been passed in.
  if (!checkObject.valid) {
    return this.promisify(false, checkObject.message);
  }

  if (data.method === true) {
    signing = this.config.uploadMethods.param + this.config.uploadMethods.singlePart;
  }

  // Replacing <%=id%> with data.id
  // Replacing <%=method%> with '?type=amazon' or ''
  tokens = {
    id: data.id,
    method: signing
  };

  url = this.parseTokens(this.config.host + this.config.uploadSign, tokens);

  return new Request({
    url: url,
    token: this.getToken(),
    method: 'POST',
    data: data
  });

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

  var result = {
    valid: true,
    message: ''
  };

  if (!data || typeof data !== 'object') {
    result.valid = false;
    result.message = 'The passed value was not an object.';
  }

  if (!data.id || typeof data.id !== 'string') {
    result.valid = false;
    result.message = 'Missing or invalid property : id.';
  }

  if (!data.key || typeof data.key !== 'string') {
    result.valid = false;
    result.message = 'Missing or invalid property : key.';
  }

  if (!data.uploadId || typeof data.uploadId !== 'string') {
    result.valid = false;
    result.message = 'Missing or invalid property : uploadId';
  }

  if (!data.partNumber || typeof data.partNumber !== 'number') {
    result.valid = false;
    result.message = 'Missing or invalid property : partNumber';
  }

  if (!data.hasOwnProperty('method') || typeof data.method !== 'boolean') {
    result.valid = false;
    result.message = 'Missing or invalid property : method';
  }

  return result;
};

/**
 * Replace all tokens within a given template based on the given key/value pair.
 * @param  {string}     template    Template for the url.
 * @param  {object}     hash        Key/Value pair for replacing tokens in the template.
 *
 * @example
 * var tokens = {
 *  keyInTemplate: 'replacedWith'
 * };
 *
 * var template = '<%=keyInTemplate%>';
 *
 * var result = parseTokens(template, tokens);  // 'replacedWith'
 *
 * @return {string}                 Parsed string.
 */
IngestAPI.prototype.parseTokens = function (template, hash) {

  var keys = Object.keys(hash);
  var i;
  var length = keys.length;

  for (i = 0; i < length; i++) {
    template = template.replace('<%=' + keys[i] + '%>', hash[keys[i]]);
  }

  return template;

};

/**
 * Wrapper function to wrap a value in either a reject or resolve.
 * @param  {boolean} state Rejection or Approval.
 * @param  {*}       value Value to pass back to the promise.
 * @return {Promise}       Promise/A+ spec promise.
 */
IngestAPI.prototype.promisify = function (state, value) {

  var promise = Promise();

  promise(state, [value]);

  return promise;

};

module.exports = IngestAPI;
