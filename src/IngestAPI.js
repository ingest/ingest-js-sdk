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
    'networks': '/networks',
    'networksKeys': '/networks/keys',
    'networksKeysById': '/networks/keys/<%=id%>',
    'uploadMethods': {
      'param': '?type=',
      'singlePart': 'amazon',
      'multiPart': 'amazonMP'
    },
    'search': '/<%=resource%>?search=<%=input%>'
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
 *
 * @return {Promise} A promise which resolves when the request is complete.
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
 *
 * @return {Promise} A promise which resolves when the request is complete.
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
 *
 * @return {Promise} A promise which resolves when the request is complete.
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
 * Update an existing video with new content.
 * @param  {object} video   An object representing the video.
 * @return {Promise}        A promise which resolves when the request is complete.
 */
IngestAPI.prototype.updateVideo = function (video) {

  var url;
  var tokens;

  if (!video || typeof video !== 'object') {
    return this.promisify(false,
      'IngestAPI update requires a video to be passed as an object.');
  }

  tokens = {
    id: video.id
  };

  url = this.parseTokens(this.config.host + this.config.videoById, tokens);

  return new Request({
    url: url,
    token: this.getToken(),
    method: 'PATCH',
    data: video
  });
};

/**
 * Delete a video.
 * @private
 * @param  {string}   videoId   ID for the video to delete.
 * @param  {boolean}  permanent A flag to permanently delete the video.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
IngestAPI.prototype._deleteVideo = function (videoId, permanent) {
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

  if (permanent === true) {
    url = url + '?permanent=1';
  }

  return new Request({
    url: url,
    token: this.getToken(),
    method: 'DELETE'
  });
};

/**
 * Delete a video.
 * @param  {string}   videoId   ID for the video to delete.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
IngestAPI.prototype.deleteVideo = function (videoId) {
  return this._deleteVideo(videoId);
};

/**
 * Permanently delete a video.
 *
 * @param  {string}   videoId   ID for the video to delete.
 * @return {Promise}            A promise which resolves when the request is complete.
 */
IngestAPI.prototype.permanentlyDeleteVideo = function (videoId) {
  return this._deleteVideo(videoId, true);
};

/**
 * Return a subset of videos that match the search terms.
 * @param  {string} resource The type of resources to search for, playlist or videos.
 * @param  {string} input    The search terms to match against.
 * @param  {object} headers  The headers to be passed to the request.
 * @return {Promise}          A promise which resolves when the request is complete.
 */
IngestAPI.prototype.searchVideos = function (resource, input, headers) {

  var url;

  if (!resource || typeof resource !== 'string') {
    return this.promisify(false,
      'IngestAPI searchVideos requires a resource type to be passed as a string.');
  }

  if (!input || typeof input !== 'string') {
    return this.promisify(false,
      'IngestAPI searchVideos requires search input to be passed as a string.');
  }

  url = this.parseTokens(this.config.host + this.config.search, {
    resource: resource,
    input: input
  });

  return new Request({
    url: url,
    token: this.getToken(),
    headers: headers
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
 * @return {Promise}                  A promise which resolves when the request is complete.
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

  if (!data.method) {
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

  // For the case of single part uploads, the uploadId is not required.
  if (data.hasOwnProperty('method') && !data.method && !data.uploadId) {
    result.valid = true;
    result.message = '';
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
    return this.promisify(false,
      'IngestAPI addNetworkSecureKey requires data to be passed as an object.');
  }

  // The title must be a string.
  if (typeof data.title !== 'string') {
    data.title = '';
  }

  if (typeof data.key !== 'string') {
    return this.promisify(false,
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
    return this.promisify(false,
      'IngestAPI getNetworkSecureKeyById requires an id to be passed as a string.');
  }

  tokens = {
    id: id
  };

  url = this.parseTokens(this.config.host + this.config.networksKeysById, tokens);

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
    return this.promisify(false,
      'IngestAPI updateNetworkSecureKeyById requires data to be passed as an object.');
  }

  if (typeof data.id !== 'string') {
    return this.promisify(false,
      'IngestAPI updateNetworkSecureKeyById requires a param "id" to be a string.');
  }

  if (typeof data.title !== 'string') {
    data.title = '';
  }

  tokens = {
    id: data.id
  };

  url = this.parseTokens(this.config.host + this.config.networksKeysById, tokens);

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
    return this.promisify(false,
      'IngestAPI deleteNetworkSecureKeyById requires an id to be passed as a string.');
  }

  tokens = {
    id: id
  };

  url = this.parseTokens(this.config.host + this.config.networksKeysById, tokens);

  return new Request({
    url: url,
    token: this.getToken(),
    method: 'DELETE'
  });
};

module.exports = IngestAPI;
