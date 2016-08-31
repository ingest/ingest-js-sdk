'use strict';

var Resource = require('./Resource');
var Request = require('../Request');
var utils = require('../Utils');
var extend = require('extend');

function Networks (options) {

  var overrides = {
    keys: '/<%=resource%>/<%=networkId%>/keys',
    keysById: '/<%=resource%>/<%=networkId%>/keys/<%=keyId%>',
    invite: '/<%=resource%>/<%=networkId%>/invite',
    customers: '/<%=resource%>/<%=networkId%>/customers',
    customerById: '/%=resource%>/<%=networkId%>/customers/<%=cusId%>'
  };

  options = extend(true, {}, overrides, options);

  Resource.call(this, options);

};

// This extends the base class of 'Resource'.
Networks.prototype = Object.create(Resource.prototype);
Networks.prototype.constructor = Networks;

/**
 * Link an existing user to the specified network.
 *
 * @param {string}  networkId  The unique ID of the network.
 * @param {string}  userId     The unique ID of the user to link.
 *
 * @return {Promise}  A promise which resolves when the request is complete.
 */
Networks.prototype.linkUser = function (networkId, userId) {
  var data, request, url;

  if (typeof networkId !== 'string') {
    return utils.promisify(false,
      'IngestAPI linkUser requires "networkId" to be passed as a string.');
  }

  if (typeof userId !== 'string') {
    return utils.promisify(false,
      'IngestAPI linkUser requires "userId" to be passed as a string.');
  }

  data = {
    id: userId
  };

  url = utils.parseTokens(this.config.host + this.config.byId, {
    resource: this.config.resource,
    id: networkId
  });

  request = new Request({
    url: url,
    data: data,
    token: this._tokenSource(),
    method: 'LINK'
  });

  return request.send();
};

/**
 * Removes the specified user from the specified network.
 *
 * @param {string}  networkId  The unique ID of the network.
 * @param {string}  userId     The unique ID of the user to unlink.
 *
 * @return {Promise}  A promise which resolves when the request is complete.
 */
Networks.prototype.unlinkUser = function (networkId, userId) {
  var data, request, url;

  if (typeof networkId !== 'string') {
    return utils.promisify(false,
      'IngestAPI unlinkUser requires "networkId" to be passed as a string.');
  }

  if (typeof userId !== 'string') {
    return utils.promisify(false,
      'IngestAPI unlinkUser requires "userId" to be passed as a string.');
  }

  data = {
    id: userId
  };

  url = utils.parseTokens(this.config.host + this.config.byId, {
    resource: this.config.resource,
    id: networkId
  });

  request = new Request({
    url: url,
    data: data,
    token: this._tokenSource(),
    method: 'UNLINK'
  });

  return request.send();
};

/**
 * Invites a user to the specified network.
 *
 * @param {string}  networkId  The unique ID of the network.
 * @param {string}  email      The email to send the invite to.
 * @param {string}  name       The name of the person to invite.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
Networks.prototype.inviteUser = function (networkId, email, name) {
  var data, request, url;

  if (typeof networkId !== 'string') {
    return utils.promisify(false,
      'IngestAPI inviteUser requires "networkId" to be passed as a string.');
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

  url = utils.parseTokens(this.config.host + this.config.invite, {
    resource: this.config.resource,
    networkId: networkId
  });

  request = new Request({
    url: url,
    data: data,
    token: this._tokenSource(),
    method: 'POST'
  });

  return request.send();
};

/**
 * Gets a list of all secure keys for the network given.
 *
 * @param {string}  networkId  The unique ID of the network.
 *
 * @return {Promise}  A promise which resolves when the request is complete.
 */
Networks.prototype.getSecureKeys = function (networkId) {
  var request, url;

  if (typeof networkId !== 'string') {
    return utils.promisify(false,
      'IngestAPI getSecureKeys requires "networkId" to be passed as a string.');
  }

  url = utils.parseTokens(this.config.host + this.config.keys, {
    resource: this.config.resource,
    networkId: networkId
  });

  request = new Request({
    url: url,
    token: this._tokenSource()
  });

  return request.send();
};

/**
 * Adds a new secure key to the specified network.
 *
 * @param {string}  networkId   The unique ID of the network.
 * @param {object}  data        The object containing data for the secure key entry.
 * @param {string}  data.title  Optional. The title of the secure key. Will default to "Default Key Title"
 * @param {string}  data.key    The public key in RSA format.
 *
 * @return {Promise}  A promise which resolves when the request is complete.
 */
Networks.prototype.addSecureKey = function (networkId, data) {
  var request, url;

  if (typeof networkId !== 'string') {
    return utils.promisify(false,
      'IngestAPI addSecureKey requires "networkId" to be passed as a string.');
  }

  if (typeof data !== 'object') {
    return utils.promisify(false,
      'IngestAPI addSecureKey requires "data" to be passed as an object.');
  }

  if (typeof data.key !== 'string') {
    return utils.promisify(false,
      'IngestAPI addSecureKey requires that the key be a string in RSA public key format.');
  }

  // The title must be a string.
  if (typeof data.title !== 'string') {
    data.title = '';
  }

  url = utils.parseTokens(this.config.host + this.config.keys, {
    resource: this.config.resource,
    networkId: networkId
  });

  request = new Request({
    url: url,
    token: this._tokenSource(),
    method: 'POST',
    data: data
  });

  return request.send();
};

/**
 * Retrieves a single network secure key entry based on the unique ID given.
 *
 * @param {string}  networkId  The unique ID of the network.
 * @param {string}  keyId      The unique ID of the secure key entry.
 *
 * @return {Promise}  A promise which resolves when the request is complete.
 */
Networks.prototype.getSecureKeyById = function (networkId, keyId) {
  var url, request;

  if (typeof networkId !== 'string') {
    return utils.promisify(false,
      'IngestAPI getSecureKeyById requires a "networkId" to be passed as a string.');
  }

  if (typeof keyId !== 'string') {
    return utils.promisify(false,
      'IngestAPI getSecureKeyById requires a "keyId" to be passed as a string.');
  }

  url = utils.parseTokens(this.config.host + this.config.keysById, {
    resource: this.config.resource,
    networkId: networkId,
    keyId: keyId
  });

  request = new Request({
    url: url,
    token: this._tokenSource()
  });

  return request.send();
};

/**
 * Updates an individual secure key entry in the network specified.
 *
 * @param {string}  networkId   The unique ID of the network.
 * @param {object}  data        The object containing data for the secure key entry.
 * @param {string}  data.title  The title for the current network.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
Networks.prototype.updateSecureKey = function (networkId, data) {
  var url, request;

  if (typeof networkId !== 'string') {
    return utils.promisify(false,
      'IngestAPI updateSecureKeyById requires "networkId" to be passed as a string.');
  }

  if (typeof data !== 'object') {
    return utils.promisify(false,
      'IngestAPI updateSecureKeyById requires "data" to be passed as an object.');
  }

  if (typeof data.id !== 'string') {
    return utils.promisify(false,
      'IngestAPI updateSecureKeyById requires param "data.id" to be a string.');
  }

  if (typeof data.title !== 'string') {
    data.title = '';
  }

  url = utils.parseTokens(this.config.host + this.config.keysById, {
    resource: this.config.resource,
    networkId: networkId,
    keyId: data.id
  });

  request = new Request({
    url: url,
    token: this._tokenSource(),
    method: 'PATCH',
    data: data
  });

  return request.send();
};

/**
 * Deletes a single network secure key entry based on the unique ID given.
 *
 * @param {string}  networkId  The unique ID of the network.
 * @param {string}  keyId      The unique ID of the secure key entry.
 *
 * @return {Promise}  A promise which resolves when the request is complete.
 */
Networks.prototype.deleteSecureKey = function (networkId, keyId) {
  var url, request;

  if (typeof networkId !== 'string') {
    return utils.promisify(false,
      'IngestAPI deleteSecureKeyById requires a "networkId" to be passed as a string.');
  }

  if (typeof keyId !== 'string') {
    return utils.promisify(false,
      'IngestAPI deleteSecureKeyById requires a "keyId" to be passed as a string.');
  }

  url = utils.parseTokens(this.config.host + this.config.keysById, {
    resource: this.config.resource,
    networkId: networkId,
    keyId: keyId
  });

  request = new Request({
    url: url,
    token: this._tokenSource(),
    method: 'DELETE'
  });

  return request.send();

};

/**
 * Creates a Stripe customer for the given network ID.
 *
 * @param {string} stripeToken - The Stripe token to reference submitted payment details.
 * @param {string} networkId   - The network UUID for this Stripe customer.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
Networks.prototype.createCustomer = function (stripeToken, networkId) {
  var url, request, data;

  if (typeof stripeToken !== 'string' || typeof networkId !== 'string') {
    return utils.promisify(false,
      'IngestAPI Billing createCustomer requires stripeToken and networkId to be strings.');
  }

  url = utils.parseTokens(this.config.host + this.config.customers, {
    networkId: networkId,
    resource: this.config.resource
  });

  data = {
    stripeToken: stripeToken
  };

  request = new Request({
    url: url,
    data: data,
    token: this._tokenSource(),
    method: 'POST'
  });

  return request.send();
};

module.exports = Networks;
