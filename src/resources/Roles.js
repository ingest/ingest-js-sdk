'use strict';

var Resource = require('./Resource');
var Request = require('../Request');
var utils = require('../Utils');
var extend = require('extend');
var ResourceTypes = require('../constants/resourceTypes');

/**
 * Roles Resource
 *
 * @param {object} options - SDK Options.
 * @class
 * @extends Resource
 */
function Roles (options) {
  var overrides = {
    resource: ResourceTypes.ROLES
  };

  options = extend(true, {}, overrides, options);

  Resource.call(this, options);

};

// This extends the base class of 'Resource'.
Roles.prototype = Object.create(Resource.prototype);
Roles.prototype.constructor = Roles;

/**
 * Update an existing role with new content.
 * @param  {object|array} resource  An object or an array of objects representing the role(s) to be updated.
 * @return {promise}                A promise which resolves when the request is complete.
 */
Roles.prototype.update = function (resource) {
  var request, data, url;

  if (typeof resource !== 'object') {
    return utils.promisify(false,
      'IngestSDK Roles update requires a role to be passed as an object.');
  }

  data = resource;

  url = utils.parseTokens(this.config.host + this.config.byId, {
    resource: this.config.resource,
    id: resource.id
  });

  request = new Request({
    url: url,
    token: this._tokenSource(),
    method: 'PUT',
    data: data
  });

  return request.send();
};

module.exports = Roles;
