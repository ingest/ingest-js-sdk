var Request = require('./Request.js');
var Promise = require('bluebird');

var RESTCONFIG = {
  'host': 'http://weasley.teamspace.ad:8080',
  'videos': '/videos',
  'videoById': '/videos/<%=id%>'
};

function IngestAPI (options) {

  if (!options || !options.token) {
    throw new Error('IngestAPI requires an authentication token.');
  }

  // Store the token for future use.
  this.setToken(options.token);

}

/**
 * Set the auth token to use.
 * @param {String} token Auth token to use.
 */
IngestAPI.prototype.setToken = function (token) {
  this.token = token;
};

/**
 * Return the current auth token.
 * @return {String} Current auth token.
 */
IngestAPI.prototype.getToken = function () {
  return this.token;
};

/**
 * Return a list of videos for the current user and network.
 * @return {JSON} A JSON object representing the videos.
 */
IngestAPI.prototype.getVideos = function () {

  return new Request({
    url: RESTCONFIG.host + RESTCONFIG.videos,
    token: this.token
  });

};

/**
 * Return a video match the supplied id.
 * @param  {String} videoId ID for the requested video.
 * @return {JSON}         JSON object representing the requested video.
 */
IngestAPI.prototype.getVideoById = function (videoId) {

  if (!videoId) {
    // Wrap the error in a promise so the user is still catching the errors.
    return Promise.reject('IngestAPI getVideoById requires a videoId.');
  }

  var url = RESTCONFIG.host;

  url = url + RESTCONFIG.videoById.replace('<%=id%>', videoId);

  return new Request({
    url: url,
    token: this.token
  });

};

module.exports = IngestAPI;
