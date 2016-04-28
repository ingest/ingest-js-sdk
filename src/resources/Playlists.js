var Resource = require('./Resource');
var Request = require('../Request');
var utils = require('../Utils');
var extend = require('extend');

function Playlists (options) {

  var overrides = {};

  options = extend(true, {}, overrides, options);

  Resource.call(this, options);

};

// This extends the base class of 'Resource'.
Playlists.prototype = Object.create(Resource.prototype);
Playlists.prototype.constructor = Playlists;

/**
 * Link the supplied video to the supplied playlist.
 * @param   {string}           playlistId       ID of the playlist to link the supplied video to.
 * @param   {object|array}     videos           A single video object, or an array of video objects.
 * @return  {promise}                           A promise which resolves when the request is complete.
 */
Playlists.prototype.link = function (playlistId, video) {
  return this._linkVideos(true, playlistId, video);
};

/**
 * Unlink the supplied video to the supplied playlist.
 * @param   {string}            playlistId      ID of the playlist to unlink the supplied video from.
 * @param   {object|array}      videos          A single video object, or an array of video objects.
 * @return  {promise}                           A promise which resolves when the request is complete.
 */
Playlists.prototype.unlink = function (playlistId, video) {
  return this._linkVideos(false, playlistId, video);
};

/**
 * Link or Unlink videos to a playlist.
 * @private
 * @param  {boolean}          link              A boolean indicating wether to link or unlink the item.
 * @param  {string}           playlistId        ID of the playlist to act upon.
 * @param  {object|array}     video             A single video object, or an array of video objects.
 * @return {promise}                            A promise which resolves when the request is complete.
 */
Playlists.prototype._linkVideos = function (link, playlistId, video) {
  var request;
  var videosToLink = [];

  if (typeof link !== 'boolean') {
    return utils.promisify(false,
      'IngestAPI Playlists link requires a valid link flag passed as a boolean.');
  }

  if (typeof playlistId !== 'string') {
    return utils.promisify(false,
      'IngestAPI Playlists link requires a valid playlistId passed as a string.');
  }

  if (!Array.isArray(video) && typeof video !== 'object') {
    return utils.promisify(false,
      'IngestAPI Playlists link requires a valid video passed as a valid object or array.');
  }

  // Check to see if we recieved either an object or an array.
  if (!Array.isArray(video)) {
    videosToLink.push(video);
  } else {
    videosToLink = video;
  }

  // Ensure that we have an array with a valid video.
  if (videosToLink.length === 0) {
    return utils.promisify(false,
      'IngestAPI Playlists link requires at least one video to link.');
  }

  var url = utils.parseTokens(this.config.host + this.config.byId, {
    resource: this.config.resource,
    id: playlistId
  });

  request = new Request({
    method: link ? 'LINK' : 'UNLINK',
    url: url,
    token: this._tokenSource(),
    data: videosToLink
  });

  return request.send()
          .then(this._updateCachedResources.bind(this));
};

module.exports = Playlists;
