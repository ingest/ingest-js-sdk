'use strict';

var Resource = require('./Resource');
var Request = require('../Request');
var utils = require('../Utils');
var extend = require('extend');
var ResourceTypes = require('../constants/resourceTypes');

/**
 * Livestreams Resource
 *
 * @param {object} options - SDK Options.
 * @class
 * @extends Resource
 */
function Livestreams (options) {
  var overrides = {
    resource: ResourceTypes.LIVESTREAMS,
    status: '/<%=resource%>/<%=id%>/status',
    end: '/<%=resource%>/<%=id%>/stop'
  };

  options = extend(true, {}, overrides, options);

  Resource.call(this, options);
};

// This extends the base class of 'Resource'.
Livestreams.prototype = Object.create(Resource.prototype);
Livestreams.prototype.constructor = Livestreams;

/**
 * Return a list of the requested livestreams for the network.
 *
 * @param {object} headers - Object representing headers to apply to the request.
 * @param {string} status  - The status you wish to get for live streams
 *
 * @return {promise}            A promise which resolves when the request is complete.
 */
Livestreams.prototype.getAll = function (headers, status) {
  var request;
  var url = utils.parseTokens(this.config.host + this.config.all, {
    resource: this.config.resource
  });

  // If there is a status
  if (status) {
    if (typeof status !== 'string') {
      return utils.promisify(false,
        'IngestSDK Livestreams.getAll requires a valid status to be passed as a string.');
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
 * Gets a livestreams status
 *
 * @param  {string} id - Livestream id.
 *
 * @return {promise} A promise which resolves when the request is complete.
 */
Livestreams.prototype.getStatus = function (id) {
  var url, request;

  if (typeof id !== 'string') {
    return utils.promisify(false,
      'IngestSDK Livestream.getStatus requires a valid id passed as a string.');
  }

  url = utils.parseTokens(this.config.host + this.config.status, {
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
 * Ends a livestream
 *
 * @param {string} id        - The id of the livestream to end
 * @param {string} streamKey - The streamKey for the livestream you wish to end
 *
 * @return {promise} A promise which resolves when the request is complete.
 */
Livestreams.prototype.end = function (id, streamKey) {
  var request, url, data;

  if (typeof id !== 'string' || typeof streamKey !== 'string') {
    return utils.promisify(false,
      'IngestSDK Livestream.end requires a valid id and stream key passed as a string.');
  }

  url = utils.parseTokens(this.config.host + this.config.end, {
    resource: this.config.resource,
    id: id
  });

  data = {
    stream_key: streamKey
  };

  request = new Request({
    url: url,
    token: this._tokenSource(),
    method: 'POST',
    data: data
  });

  return request.send();
};

module.exports = Livestreams;
