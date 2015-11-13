var Request = require('./Request.js');
var Promise = require('pinkyswear');
var extend = require('extend');

var defaults = {
  'host': 'https://api.ingest.io',
  'videos': '/videos',
  'videoById': '/videos/<%=id%>',
  'trash': '/videos?filter=trashed'
};

/**
 * IngestAPI Object
 * @param {object} options Options to override the default.
 * @param {string} options.host Override the default live host.
 * @param {string} options.token Auth token to use for requests.
 */
function IngestAPI (options) {

  this.defaults = {
    'host': 'https://api.ingest.io',
    'videos': '/videos',
    'videoById': '/videos/<%=id%>',
    'trash': '/videos?filter=trashed'
  };

  // Create a config object by extending the defaults with the pass options.
  this.config = extend(true, defaults, options);

  if (this.config.token) {
    // Store the token for future use.
    this.setToken(this.config.token);
  }

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

  if (!videoId || typeof videoId !== 'string') {
    // Wrap the error in a promise so the user is still catching the errors.
    return this.promisify(false,
      'IngestAPI getVideoById requires a valid videoId as a string.');
  }

  return new Request({
    url: this.parseId(this.config.host + this.config.videoById, videoId),
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

  // Parse the JSON
  try {
    videoObject = JSON.stringify(videoObject);
  } catch (error) {
    return this.promisify(false,
      'IngestAPI addVideo failed to parse videoObject to JSON. ' + error.stack);
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

  if (!videoId || typeof videoId !== 'string') {
    return this.promisify(false,
      'IngestAPI deleteVideo requires a video ID passed as a string.');
  }

  return new Request({
    url: this.parseId(this.config.host + this.config.videoById, videoId),
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
 * @param  {object} response Request response object.
 * @return {number}          The resource count from the response.
 */
IngestAPI.prototype.getCountResponse = function (response) {

  return parseInt(response.headers('Resource-Count'), 10);

};

/**
 * Replace the ID in the template string with the supplied id.
 * @param  {string} template Template for the url.
 * @param  {string} id       Video ID to inject into the template.
 * @return {string}          Parsed string.
 */
IngestAPI.prototype.parseId = function (template, id) {

  var result = template.replace('<%=id%>', id);

  return result;

};

/**
 * Wrapper function to wrap a value in either a reject or resolve.
 * @param  {boolean} state Rejection or Approval.
 * @param  {*} value Value to pass back to the promise.
 * @return {Promise}       Promise/A+ spec promise.
 */
IngestAPI.prototype.promisify = function (state, value) {

  var promise = Promise();

  promise(state, [value]);

  return promise;

};

module.exports = IngestAPI;
