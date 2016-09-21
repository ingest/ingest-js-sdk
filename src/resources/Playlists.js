var PlaybackContent = require('./PlaybackContent');
var Request = require('../Request');
var utils = require('../Utils');
var extend = require('extend');

function Playlists (options) {

  var overrides = {
    'playlistVideoById': '/<%=resource%>/<%=playlistId%>/video/<%=videoId%>',
    'playlistReorder': '/<%=resource%>/<%=playlistId%>/reorder/<%=videoId%>'
  };

  options = extend(true, {}, overrides, options);

  PlaybackContent.call(this, options);

};

// This extends the base class of 'PlaybackContent'.
Playlists.prototype = Object.create(PlaybackContent.prototype);
Playlists.prototype.constructor = Playlists;

/**
 * Add the supplied video to the supplied playlist.
 * @param   {string}   playlistId  The UUID of the playlist to add the videoId to.
 * @param   {string}   videoId     The UUID of the video to add to the playlist.
 * @param   {number}   position    [Optional] Position of the new video in the playlist.
 *                                 If omitted, the video in question will be added to the end of the given playlist.
 * @return  {promise}              A promise which resolves when the request is complete.
 */
Playlists.prototype.addVideo = function (playlistId, videoId, position) {
  var request, url, data;

  if (typeof playlistId !== 'string' || typeof videoId !== 'string') {
    return utils.promisify(false,
      'IngestAPI Playlists addVideo requires "playlistId" and "videoId" to both be strings.');
  }

  url = utils.parseTokens(this.config.host + this.config.playlistVideoById, {
    resource: this.config.resource,
    playlistId: playlistId,
    videoId: videoId
  });

  data = {};

  if (typeof position === 'number') {
    data.position = position;
  }

  request = new Request({
    method: 'POST',
    url: url,
    token: this._tokenSource(),
    data: data
  });

  return request.send().then(this._updateCachedResources.bind(this));
};

/**
 * Remove the supplied video to the supplied playlist.
 * @param   {string}   playlistId  The UUID of the playlist to add the videoId to.
 * @param   {string}   videoId     The UUID of the video to add to the playlist.
 * @param   {number}   position    Must be supplied as there can be multiple instances of the same video within a playlist.
 * @return  {promise}              A promise which resolves when the request is complete.
 */
Playlists.prototype.removeVideo = function (playlistId, videoId, position) {
  var request, url, data;

  if (typeof playlistId !== 'string' || typeof videoId !== 'string') {
    return utils.promisify(false,
      'IngestAPI Playlists removeVideo requires "playlistId" and "videoId" to both be strings.');
  }

  if (typeof position !== 'number') {
    return utils.promisify(false,
      'IngestAPI Playlists removeVideo requires "position" to be a number');
  }

  data = {
    position: position
  };

  url = utils.parseTokens(this.config.host + this.config.playlistVideoById, {
    resource: this.config.resource,
    playlistId: playlistId,
    videoId: videoId
  });

  request = new Request({
    method: 'DELETE',
    url: url,
    token: this._tokenSource(),
    data: data
  });

  return request.send().then(this._updateCachedResources.bind(this));

};

/**
 * Re-orders a supplied playlist based on the given old and new positions.
 * @param  {string}   playlistId   The UUID of the playlist to re-order.
 * @param  {string}   videoId      The UUID of the video to re-order.
 * @param  {number}   oldPosition  The old position to move to the given new position.
 * @param  {number}   newPosition  The new position to move to.
 */
Playlists.prototype.reorderVideo = function (playlistId, videoId, oldPosition, newPosition) {
  var request, url, data;

  if (typeof playlistId !== 'string') {
    return utils.promisify(false,
      'IngestAPI Playlists reorderVideo requires "playlistId" to be a string');
  }

  if (typeof videoId !== 'string') {
    return utils.promisify(false,
      'IngestAPI Playlists reorderVideo requires "videoId" to be a string');
  }

  if (typeof oldPosition !== 'number' || typeof newPosition !== 'number') {
    return utils.promisify(false,
      'IngestAPI Playlists reorderVideo requires "oldPosition" and "newPosition" to be numbers.');
  }

  url = utils.parseTokens(this.config.host + this.config.playlistReorder, {
    resource: this.config.resource,
    playlistId: playlistId,
    videoId: videoId
  });

  data = {
    old_position: oldPosition,
    new_position: newPosition
  };

  request = new Request({
    method: 'PUT',
    url: url,
    token: this._tokenSource(),
    data: data
  });

  return request.send().then(this._updateCachedResources.bind(this));

};

module.exports = Playlists;
