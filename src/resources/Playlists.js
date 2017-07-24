'use strict';

var PlaybackContent = require('./PlaybackContent');
var Request = require('../Request');
var utils = require('../Utils');
var extend = require('extend');
var ResourceTypes = require('../constants/resourceTypes');

/**
 * Playlists Resource
 *
 * @param {object} options - SDK options.
 * @class
 * @extends PlaybackContent
 */
function Playlists (options) {

  var overrides = {
    resource: ResourceTypes.PLAYLISTS,
    playlistVideoById: '/<%=resource%>/<%=playlistId%>/video/<%=videoId%>',
    playlistReorder: '/<%=resource%>/<%=playlistId%>/reorder/<%=videoId%>',
    playlistAddRemove: '/<%=resource%>/<%=playlistId%>/videos'
  };

  options = extend(true, {}, overrides, options);

  PlaybackContent.call(this, options);

};

// This extends the base class of 'PlaybackContent'.
Playlists.prototype = Object.create(PlaybackContent.prototype);
Playlists.prototype.constructor = Playlists;

/**
 * Return a resource that matches the supplied id.
 * @param  {string}   id    Resource id.
 * @return {promise}        A promise which resolves when the request is complete.
 */
Playlists.prototype.getById = function (id, status) {
  var url, request;

  if (typeof id !== 'string' || id.length <= 0) {
    return utils.promisify(false,
      'IngestSDK Playlist getById requires a valid id passed as a string.');
  }

  url = utils.parseTokens(this.config.host + this.config.byId, {
    resource: this.config.resource,
    id: id
  });

  if (status) {
    if (typeof status !== 'string') {
      return utils.promisify(false,
        'IngestSDK Videos.getAll requires a valid status to be passed as a string.');
    }

    url = url + '?video.status=' + status;
  }

  request = new Request({
    url: url,
    token: this._tokenSource()
  });

  return request.send();
};

/**
 * Add the supplied video to the supplied playlist.
 * @param   {string}   playlistId  The UUID of the playlist to add the videoId to.
 * @param   {array}    videoIds    The UUID of the video to add to the playlist.
 * @param   {number}   position    [Optional] Position of the new video in the playlist.
 *                                 If omitted, the video in question will be added to the end of the given playlist.
 * @return  {promise}              A promise which resolves when the request is complete.
 */
Playlists.prototype.addVideos = function (playlistId, videoIds, position) {
  var request, url, data;

  if (typeof playlistId !== 'string') {
    return utils.promisify(false,
      'IngestSDK Playlists addVideo requires `playlistId` be a string.');
  }

  if (!Array.isArray(videoIds)) {
    return utils.promisify(false,
      'IngestSDK Playlists addVideo requires `videoId` be an array of videoIds.');
  }

  url = utils.parseTokens(this.config.host + this.config.playlistAddRemove, {
    resource: this.config.resource,
    playlistId: playlistId
  });

  data = {
    videos: videoIds
  };

  if (typeof position === 'number') {
    data.position = position;
  }

  request = new Request({
    method: 'POST',
    url: url,
    token: this._tokenSource(),
    data: data
  });

  return request.send();
};

/**
 * Remove the supplied videos from the supplied playlist.
 * @param   {string}   playlistId    The UUID of the playlist to remove the videoId from.
 * @param   {array}    videos        An array of objects containing both the id and position of the video to remove.
 * @return  {promise}                A promise which resolves when the request is complete.
 */
Playlists.prototype.removeVideos = function (playlistId, videos) {
  var request, url;

  if (typeof playlistId !== 'string') {
    return utils.promisify(false,
      'IngestSDK Playlists removeVideo requires `playlistId` to be a string.');
  }

  if (!Array.isArray(videos)) {
    return utils.promisify(false,
      'IngestSDK Playlists removeVideo requires `videos` be an array of video objects.');
  }

  url = utils.parseTokens(this.config.host + this.config.playlistAddRemove, {
    resource: this.config.resource,
    playlistId: playlistId
  });

  request = new Request({
    method: 'DELETE',
    url: url,
    token: this._tokenSource(),
    data: videos
  });

  return request.send();
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
      'IngestSDK Playlists reorderVideo requires `playlistId` to be a string');
  }

  if (typeof videoId !== 'string') {
    return utils.promisify(false,
      'IngestSDK Playlists reorderVideo requires `videoId` to be a string');
  }

  if (typeof oldPosition !== 'number' || typeof newPosition !== 'number') {
    return utils.promisify(false,
      'IngestSDK Playlists reorderVideo requires `oldPosition` and `newPosition` to be numbers.');
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

  return request.send();
};

module.exports = Playlists;
