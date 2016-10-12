'use strict';

var Resource = require('./Resource');
var Request = require('../Request');
var utils = require('../Utils');
var extend = require('extend');

function Profiles (options) {

  Resource.call(this, options);

};

// This extends the base class of 'Resource'.
Profiles.prototype = Object.create(Resource.prototype);
Profiles.prototype.constructor = Profiles;

/**
 * Update an existing profile with new content.
 * @param  {object|array} resource  An object or an array of objects representing the profile to be updated.
 * @return {promise}                A promise which resolves when the request is complete.
 */
Profiles.prototype.update = function (resource) {
  var request, data, url;

  if (typeof resource !== 'object') {
    return utils.promisify(false,
      'IngestAPI Profiles update requires a resource to be passed as an object.');
  }

  data = resource;

  url = utils.parseTokens(this.config.host + this.config.byId, {
    resource: this.config.resource,
    id: resource.id
  });

  if (this.cache && this.cache.enabled) {
    data = this.cache.diff(resource.id, resource);
  }

  // Null is returned in the case that the two objects match.
  if (!data) {
    // Return a fulfilled promise with the cached object.
    return utils.promisify(true, {
      data: this.cache.retrieve(resource.id)
    });
  }

  request = new Request({
    url: url,
    token: this._tokenSource(),
    method: 'PUT',
    data: data
  });

  return request.send()
    .then(this._updateCachedResource.bind(this));

};

module.exports = Profiles;
