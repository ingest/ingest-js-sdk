'use strict';

var Resource = require('./Resource');
var Request = require('../Request');
var utils = require('../Utils');
var extend = require('extend');

function Jobs (options) {

  Resource.call(this, options);

};

// This extends the base class of 'Resource'.
Jobs.prototype = Object.create(Resource.prototype);
Jobs.prototype.constructor = Jobs;

/**
 * Creates a new encoding job.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
Jobs.prototype.add = function (resource) {

  var url, request;

  if (typeof resource !== 'object') {
    return utils.promisify(false,
      'IngestAPI Jobs `add` requires a resource passed as an object.');
  }

  url = utils.parseTokens(this.config.host + this.config.all, {
    resource: this.config.resource
  });

  // Deletes the cached version of the associated video.
  if (resource.hasOwnProperty('video') && typeof resource.video === 'string') {
    this._deleteCachedResource(resource.video);
  }

  request = new Request({
    url: url,
    token: this._tokenSource(),
    method: 'POST',
    data: resource
  });

  return request.send()
      .then(this._updateCachedResource.bind(this));

};

module.exports = Jobs;