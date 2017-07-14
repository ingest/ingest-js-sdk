'use strict';

var Resource = require('./Resource');
var Request = require('../Request');
var utils = require('../Utils');

/**
 * Roles Resource
 *
 * @param {object} options - SDK Options.
 * @class
 * @extends Resource
 */
function Roles (options) {
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
      'IngestAPI Roles update requires a role to be passed as an object.');
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
