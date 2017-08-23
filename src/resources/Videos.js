'use strict';

var PlaybackContent = require('./PlaybackContent');
var Request = require('../Request');
var utils = require('../Utils');
var extend = require('extend');
var ResourceTypes = require('../constants/resourceTypes');

/**
 * Videos Resource
 *
 * @param {object} options - SDK Options.
 * @class
 * @extends PlaybackContent
 */
function Videos (options) {
  var overrides = {
    resource: ResourceTypes.VIDEOS,
    variants: '/<%=resource%>/<%=id%>/variants',
    publish: '/<%=resource%>/publish'
  };

  options = extend(true, {}, overrides, options);

  PlaybackContent.call(this, options);

};

// This extends the base class of 'PlaybackContent'.
Videos.prototype = Object.create(PlaybackContent.prototype);
Videos.prototype.constructor = Videos;

/**
 * Return a list of the requested videos for the current user and network.
 * @param  {object}   headers   Object representing headers to apply to the request.
 * @return {promise}            A promise which resolves when the request is complete.
 */
Videos.prototype.getAll = function (headers, status) {
  var request;
  var url = utils.parseTokens(this.config.host + this.config.all, {
    resource: this.config.resource
  });

  // If there is a status
  if (status) {
    if (typeof status !== 'string') {
      return utils.promisify(false,
        'IngestSDK Videos.getAll requires a valid status to be passed as a string.');
    }

    url = url + '?status=' + status;
  }

  request = new Request({
    url: url,
    token: this._tokenSource(),
    headers: headers
  });

  return request.send();
};

/**
 * Get all of the variants for the supplied video id.
 * @param   {string}    id     Video id.
 * @return  {promise}          A promise which resolves when the request is complete.
 */
Videos.prototype.getVariants = function (id) {
  var url, request;

  if (typeof id !== 'string') {
    return utils.promisify(false,
      'IngestSDK Resource getVariants requires a valid video id passed as a string.');
  }

  url = utils.parseTokens(this.config.host + this.config.variants, {
    resource: this.config.resource,
    id: id
  });

  request = new Request({
    url: url,
    token: this._tokenSource()
  });

  return request.send();
};

/**
 * Publishes a video based on the server time
 *
 * @param  {array}   ids   An array of video ids to publish
 * @return {promise}       A promise which resolves when the request is complete
 */
Videos.prototype.publish = function (ids) {
  var request, url;

  // Check to make sure the ids are in an array
  if (!Array.isArray(ids) || ids.length === 0) {
    return utils.promisify(false,
      'IngestSDK Videos publish requires an array of ids to be passed in.');
  }

  url = utils.parseTokens(this.config.host + this.config.publish, {
    resource: this.config.resource,
  });

  request = new Request({
    url: url,
    token: this._tokenSource(),
    method: 'POST',
    data: ids
  });

  return request.send();
};

/**
 * Gets the total count of videos.
 *
 * @param {string}  status   - [Optional] A comma seperated string of video statuses to filter by.
 * @param {boolean} _private - [Optional] If true, private videos will be included in the response.
 *
 * @return {promise} A promise which resolves when the request is complete.
 */
Videos.prototype.count = function (status, _private) {
  var request, url, isStatusSet;

  isStatusSet = false;

  url = utils.parseTokens(this.config.host + this.config.all, {
    resource: this.config.resource
  });

  // If there is a status and it is a string, use it as the status filter.
  if (status) {
    if (typeof status !== 'string') {
      return utils.promisify(false,
        'IngestSDK Videos count requires a valid status to be passed as a string.');
    }

    url += '?status=' + status;
    isStatusSet = true;
  }

  // If private videos were requested, add the `private` query parameter to the url.
  if (_private === true) {

    // If a status has been set, then we need to append the next parameter with '&'.
    if (isStatusSet) {
      url += '&';
    } else {
      url += '?';
    }

    url += 'private=true';
  }

  request = new Request({
    url: url,
    token: this._tokenSource(),
    method: 'HEAD'
  });

  return request.send()
    .then(this._handleCountResponse);
};


module.exports = Videos;
