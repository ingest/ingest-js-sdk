'use strict';

var PlaybackContent = require('./PlaybackContent');
var Request = require('../Request');
var utils = require('../Utils');
var extend = require('extend');

function Videos (options) {

  var overrides = {
    playlists: '/<%=resource%>/<%=id%>/playlists',
    variants: '/<%=resource%>/<%=id%>/variants',
    withVariants: '/<%=resource%>?filter=variants',
    missingVariants: '/<%=resource%>?filter=missing_variants'
  };

  options = extend(true, {}, overrides, options);

  PlaybackContent.call(this, options);

};

// This extends the base class of 'PlaybackContent'.
Videos.prototype = Object.create(PlaybackContent.prototype);
Videos.prototype.constructor = Videos;

/**
 * Return any playlists that contains the provided video.
 * @param   {string}   id   Video id.
 * @return  {promise}       A promise which resolves when the request is complete.
 */
Videos.prototype.getPlaylists = function (id) {
  var url, request;

  if (typeof id !== 'string') {
    return utils.promisify(false,
      'IngestAPI Resource getPlaylists requires a valid video id passed as a string.');
  }

  url = utils.parseTokens(this.config.host + this.config.playlists, {
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
 * Get all of the variants for the supplied video id.
 * @param   {string}    id     Video id.
 * @return  {promise}          A promise which resolves when the request is complete.
 */
Videos.prototype.getVariants = function (id) {
  var url, request;

  if (typeof id !== 'string') {
    return utils.promisify(false,
      'IngestAPI Resource getPlaylists requires a valid video id passed as a string.');
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
 * Return a list of the videos for the current user and network that contain variants.
 * @param  {object}   headers   Object representing headers to apply to the request.
 * @return {promise}            A promise which resolves when the request is complete.
 */
Videos.prototype.getVideosWithVariants = function (headers) {
  var request;
  var url = utils.parseTokens(this.config.host + this.config.withVariants, {
    resource: this.config.resource
  });

  request = new Request({
    url: url,
    token: this._tokenSource(),
    headers: headers
  });

  return request.send()
          .then(this._updateCachedResources.bind(this));
};

/**
 * Return a list of the videos for the current user and network that are missing variants.
 * @param  {object}   headers   Object representing headers to apply to the request.
 * @return {promise}            A promise which resolves when the request is complete.
 */
Videos.prototype.getVideosMissingVariants = function (headers) {
  var request;
  var url = utils.parseTokens(this.config.host + this.config.missingVariants, {
    resource: this.config.resource
  });

  request = new Request({
    url: url,
    token: this._tokenSource(),
    headers: headers
  });

  return request.send()
          .then(this._updateCachedResources.bind(this));
};

module.exports = Videos;
