'use strict';

var Resource = require('./Resource');
var Request = require('../Request');
var utils = require('../Utils');
var extend = require('extend');

function Networks (options) {

  var overrides = {
    invite: '/networks/invite'
  };

  options = extend(true, {}, overrides, options);

  Resource.call(this, options);

};

// This extends the base class of 'Resource'.
Networks.prototype = Object.create(Resource.prototype);
Networks.prototype.constructor = Networks;

/**
 * Link an existing user to the currently authorized network.
 *
 * @param {string} networkId - The unique ID of the network.
 * @param {string} userId    - The unique ID of the user to link.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
Networks.prototype.linkUser = function (networkId, userId) {
  var data, request;

  if (typeof networkId !== 'string') {
    return utils.promisify(false,
      'IngestAPI linkUser requires "networkId" to be passed as a string.');
  }

  if (typeof userId !== 'string') {
    return utils.promisify(false,
      'IngestAPI linkUser requires "userId" to be passed as a string.');
  }

  data = {
    user_id: userId
  };

  request = new Request({
    url: this.config.host + '/' + this.config.resource + '/' + networkId,
    data: data,
    token: this._tokenSource(),
    method: 'LINK'
  });

  return request.send();
};

/**
 * Remove the specified user from the currently authorized network.
 *
 * @param {string} networkId - The unique ID of the network.
 * @param {string} userId    - The unique ID of the user to unlink.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
Networks.prototype.unlinkUser = function (networkId, userId) {
  var data, request;

  if (typeof networkId !== 'string') {
    return utils.promisify(false,
      'IngestAPI unlinkUser requires "networkId" to be passed as a string.');
  }

  if (typeof userId !== 'string') {
    return utils.promisify(false,
      'IngestAPI unlinkUser requires "userId" to be passed as a string.');
  }

  data = {
    user_id: userId
  };

  request = new Request({
    url: this.config.host + '/' + this.config.resource + '/' + networkId,
    data: data,
    token: this._tokenSource(),
    method: 'UNLINK'
  });

  return request.send();
};

/**
 * Invite a user to the currently authorized network.
 *
 * @param {string} networkId - The unique ID of the network.
 * @param {string} email     - The email to send the invite to.
 * @param {string} name      - The name of the person to invite.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
Networks.prototype.inviteUser = function (networkId, email, name) {
  var data, request, url;

  if (typeof networkId !== 'string') {
    return utils.promisify(false,
      'IngestAPI inviteUser required "networkId" to be passed as a string.');
  }

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

  url = this.config.host + '/' + this.config.resource + '/' + networkId + '/' + this.config.invite;

  request = new Request({
    url: url,
    data: data,
    token: this._tokenSource(),
    method: 'POST'
  });

  return request.send();
};

module.exports = Networks;
