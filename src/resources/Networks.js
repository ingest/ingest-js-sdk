var Resource = require('./Resource');
var Request = require('../Request');
var utils = require('../Utils');

function Networks (options) {

  Resource.call(this, options);

};

// This extends the base class of 'Resource'.
Networks.prototype = Object.create(Resource.prototype);
Networks.prototype.constructor = Networks;

/**
 * Link an existing user to the currently authorized network.
 *
 * @param {string} id - The unique ID of the user to link.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
Networks.prototype.linkUser = function (id) {
  var data;

  if (typeof id !== 'string') {
    return utils.promisify(false,
      'IngestAPI linkUser requires "id" to be passed as a string.');
  }

  data = {
    user_id: id
  };

  return new Request({
    url: this.config.host + '/' + this.config.resource,
    data: data,
    token: this._tokenSource(),
    method: 'LINK'
  });
};

/**
 * Remove the specified user from the currently authorized network.
 *
 * @param {string} id - The unique ID of the user to unlink.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
Networks.prototype.unlinkUser = function (id) {
  var data;

  if (typeof id !== 'string') {
    return utils.promisify(false,
      'IngestAPI unlinkUser requires "id" to be passed as a string.');
  }

  data = {
    user_id: id
  };

  return new Request({
    url: this.config.host + '/' + this.config.resource,
    data: data,
    token: this._tokenSource(),
    method: 'UNLINK'
  });
};

/**
 * Invite a user to the currently authorized network.
 *
 * @param {string} email - The email to send the invite to.
 * @param {string} name  - The name of the person to invite.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
Networks.prototype.inviteUser = function (email, name) {
  var data;

  if (typeof email !== 'string') {
    return utils.promisify(false,
      'IngestAPI inviteUser requires "email" to be passed as a string.');
  }

  if (typeof name !== 'string') {
    return utils.promisify(false,
      'IngestAPI inviteUser requires "name" to be passed as a string.');
  }

  data = {
    email: email,
    name: name
  };

  return new Request({
    url: this.config.host + this.config.invite,
    data: data,
    token: this._tokenSource(),
    method: 'POST'
  });
};


module.exports = Networks;
