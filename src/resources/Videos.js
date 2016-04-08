'use strict';

var Resource = require('./Resource');
var Request = require('../Request');
var utils = require('../Utils');
var extend = require('extend');

function Videos (options) {

  var overrides = {
    playlists: '/<%=resource%>/<%=id%>/playlists',
    variants: '/<%=resource%>/<%=id%>/variants'
  };

  options = extend(true, {}, overrides, options);

  Resource.call(this, options);

};

// This extends the base class of 'Resource'.
Videos.prototype = Object.create(Resource.prototype);
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

module.exports = Videos;
