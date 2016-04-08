var Resource = require('./Resource');
var Request = require('../Request');
var utils = require('../Utils');
var extend = require('extend');

function Playlists (options) {

  var overrides = {
    invite: '/networks/invite'
  };

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

  var videos = [];

  // Check to see if we recieved either an object or an array.
  if (!Array.isArray(video)) {
    videos.push(video);
  } else {
    videos = video;
  }

  return this._linkVideos(true, playlistId, videos);

};

/**
 * Unlink the supplied video to the supplied playlist.
 * @param   {string}            playlistId      ID of the playlist to unlink the supplied video from.
 * @param   {object|array}      videos          A single video object, or an array of video objects.
 * @return  {promise}                           A promise which resolves when the request is complete.
 */
Playlists.prototype.unlink = function (playlistId, video) {
  var videos = [];

  // Check to see if we recieved either an object or an array.
  if (!Array.isArray(video)) {
    videos.push(video);
  } else {
    videos = video;
  }

  return this._linkVideos(false, playlistId, videos);
};

/**
 * Link or Unlink videos to a playlist.
 * @param  {boolean}          link              A boolean indicating wether to link or unlink the item.
 * @param  {string}           playlistId        ID of the playlist to act upon.
 * @param  {object|array}     videos            A single video object, or an array of video objects.
 * @return {promise}                            A promise which resolves when the request is complete.
 */
Playlists.prototype._linkVideos = function (link, playlistId, videos) {
  var request;
  var videos;

  if (typeof link === 'undefined' || typeof link !== 'boolean') {
    return utils.promisify(false,
      'IngestAPI Playlists link requires a valid link flag passed as a boolean.');
  }

  if (typeof playlistId !== 'string') {
    return utils.promisify(false,
      'IngestAPI Playlists link requires a valid playlistId passed as a string.');
  }

  if (!Array.isArray(videos) || videos.length === 0) {
    return utils.promisify(false,
      'IngestAPI Playlists link requires a valid array of videos.');
  }

  var url = utils.parseTokens(this.config.host + this.config.byId, {
    resource: this.config.resource,
    id: playlistId
  });

  request = new Request({
    method: link ? 'LINK' : 'UNLINK',
    url: url,
    token: this._tokenSource(),
    data: videos
  });

  return request.send()
          .then(this._updateCachedResources.bind(this));
};

module.exports = Playlists;
