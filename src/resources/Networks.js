'use strict';

var Resource = require('./Resource');
var Request = require('../Request');
var utils = require('../Utils');
var extend = require('extend');
var ResourceTypes = require('../constants/resourceTypes');

/**
 * Networks Resource
 *
 * @param {object} options - SDK Options.
 * @class
 * @extends Resource
 */
function Networks (options) {

  var overrides = {
    resource: ResourceTypes.NETWORKS,
    keys: '/<%=resource%>/<%=networkId%>/keys',
    keysById: '/<%=resource%>/<%=networkId%>/keys/<%=keyId%>',
    invite: '/<%=resource%>/<%=networkId%>/invite',
    invoices: '/<%=resource%>/<%=networkId%>/invoices',
    invoicesById: '/<%=resource%>/<%=networkId%>/invoices/<%=invoiceId%>',
    currentUsage: '/<%=resource%>/<%=networkId%>/invoices?currentUsage=true',
    customers: '/<%=resource%>/<%=networkId%>/customers',
    customerById: '/<%=resource%>/<%=networkId%>/customers/<%=cusId%>',
    customerCardInformation: '/<%=resource%>/<%=networkId%>/customers/<%=cusId%>/card',
    getPendingUsers: '/<%=resource%>/<%=networkId%>?filter=pending',
    deletePendingUser: '/<%=resource%>/<%=networkId%>/pending-users/<%=pendingUserId%>',
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
      'IngestSDK linkUser requires `networkId` to be passed as a string.');
  }

  if (typeof userId !== 'string') {
    return utils.promisify(false,
      'IngestSDK linkUser requires `userId` to be passed as a string.');
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
      'IngestSDK unlinkUser requires `networkId` to be passed as a string.');
  }

  if (typeof userId !== 'string') {
    return utils.promisify(false,
      'IngestSDK unlinkUser requires `userId` to be passed as a string.');
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
 * @param {boolean} resend     [Optional] True: Resend an invite. False for first time invite. Default value is false.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
Networks.prototype.inviteUser = function (networkId, email, name, resend) {
  var data, request, url;

  if (typeof networkId !== 'string') {
    return utils.promisify(false,
      'IngestSDK inviteUser requires `networkId` to be passed as a string.');
  }

  if (typeof email !== 'string') {
    return utils.promisify(false,
      'IngestSDK inviteUser requires `email` to be passed as a string.');
  }

  if (typeof name !== 'string') {
    return utils.promisify(false,
      'IngestSDK inviteUser requires `name` to be passed as a string.');
  }

  data = {
    email: email,
    name: name
  };

  if (typeof resend === 'boolean') {
    data.resend = resend;
  }

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
      'IngestSDK getSecureKeys requires `networkId` to be passed as a string.');
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
      'IngestSDK addSecureKey requires `networkId` to be passed as a string.');
  }

  if (typeof data !== 'object') {
    return utils.promisify(false,
      'IngestSDK addSecureKey requires `data` to be passed as an object.');
  }

  if (typeof data.key !== 'string') {
    return utils.promisify(false,
      'IngestSDK addSecureKey requires that the key be a string in RSA public key format.');
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
      'IngestSDK getSecureKeyById requires a `networkId` to be passed as a string.');
  }

  if (typeof keyId !== 'string') {
    return utils.promisify(false,
      'IngestSDK getSecureKeyById requires a `keyId` to be passed as a string.');
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
      'IngestSDK updateSecureKeyById requires `networkId` to be passed as a string.');
  }

  if (typeof data !== 'object') {
    return utils.promisify(false,
      'IngestSDK updateSecureKeyById requires `data` to be passed as an object.');
  }

  if (typeof data.id !== 'string') {
    return utils.promisify(false,
      'IngestSDK updateSecureKeyById requires param `data.id` to be a string.');
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
      'IngestSDK deleteSecureKeyById requires a `networkId` to be passed as a string.');
  }

  if (typeof keyId !== 'string') {
    return utils.promisify(false,
      'IngestSDK deleteSecureKeyById requires a `keyId` to be passed as a string.');
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
      'IngestSDK Networks createCustomer requires stripeToken and networkId to be strings.');
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

/**
 * Updates an existing Stripe customer for the given network ID.
 *
 * @param {string} networkId   - The networkID that this Stripe customer belongs to.
 * @param {string} cusId       - The Stripe customer ID you wish to update.
 * @param {string} networkName - [Optional] Only provide if you wish to update the network name on the Stripe customer.
 * @param {string} stripeToken - [Optional] Provide only if payment details have been updated.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 *
 */
Networks.prototype.updateCustomer = function (networkId, cusId, networkName, stripeToken) {
  var url, request, data;

  if (typeof networkId !== 'string' || typeof cusId !== 'string') {
    return utils.promisify(false,
      'IngestSDK Networks updateCustomer requires `networkId` and `cusID` to be a string.');
  }

  if (typeof networkName !== 'string' && typeof stripeToken !== 'string') {
    return utils.promisify(false,
      'IngestSDK Networks updateCustomer requires either networkName or stripeToken passed as a string.');
  }

  url = utils.parseTokens(this.config.host + this.config.customerById, {
    resource: this.config.resource,
    networkId: networkId,
    cusId: cusId
  });

  data = {
    networkName: networkName,
    stripeToken: stripeToken
  };

  request = new Request({
    url: url,
    data: data,
    token: this._tokenSource(),
    method: 'PATCH'
  });

  return request.send();
};

/**
 * Deletes an existing Stripe customer for the given network ID.
 *
 * @param {string} networkId - The network ID that the customer belongs to.
 * @param {string} cusId     - The Stripe customer ID to be deleted.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 *
 */
Networks.prototype.deleteCustomer = function (networkId, cusId) {

  var url, request;

  if (typeof networkId !== 'string' || typeof cusId !== 'string') {
    return utils.promisify(false,
      'IngestSDK Networks deleteCustomer requires `networkId` and `cusId` to be strings.');
  }

  url = utils.parseTokens(this.config.host + this.config.customerById, {
    resource: this.config.resource,
    networkId: networkId,
    cusId: cusId
  });

  request = new Request({
    url: url,
    token: this._tokenSource(),
    method: 'DELETE'
  });

  return request.send();

};

/**
 * Gets a customers card information on file
 *
 * @param {string} customerId - The customer ID you wish to get the information for.
 * @param {string} networkId  - The network ID the customer belongs to.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 *
 */
Networks.prototype.getCustomerCardInformation = function (networkId, customerId) {
  var url, request;

  if (typeof customerId !== 'string' || typeof networkId !== 'string') {
    return utils.promisify(false,
      'IngestSDK Networks getCustomerCardInformation requires networkId and customerId to be strings');
  }

  url = utils.parseTokens(this.config.host + this.config.customerCardInformation, {
    resource: this.config.resource,
    networkId: networkId,
    cusId: customerId
  });

  request = new Request({
    url: url,
    token: this._tokenSource()
  });

  return request.send();
};

/**
 * Remove the credit card currently associated with the proviced customer.
 * @param {string} networkId  - The network ID the customer belongs to.
 * @param {string} networkId  - The customer ID.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
Networks.prototype.deleteCustomerCard = function (networkId, customerId) {
  var url, request;

  if (typeof customerId !== 'string' || typeof networkId !== 'string') {
    return utils.promisify(false,
      'IngestSDK Networks deleteCustomerCard requires networkId and customerId to be strings');
  }

  url = utils.parseTokens(this.config.host + this.config.customerCardInformation, {
    resource: this.config.resource,
    networkId: networkId,
    cusId: customerId
  });

  request = new Request({
    url: url,
    token: this._tokenSource(),
    method: 'DELETE'
  });

  return request.send();
};

/**
 * Gets a networks invoices
 *
 * @param {string} networkId  - The network ID that you wish to get the invoices for.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 *
 */
Networks.prototype.getInvoices = function (networkId) {
  var url, request;

  if (typeof networkId !== 'string') {
    return utils.promisify(false, 'IngestSDK Networks getInvoices requires networkId to be a string');
  }

  url = utils.parseTokens(this.config.host + this.config.invoices, {
    resource: this.config.resource,
    networkId: networkId,
  });

  request = new Request({
    url: url,
    token: this._tokenSource()
  });

  return request.send();
};

/**
 * Gets a specific invoice for a network
 *
 * @param {string} networkId  - The network ID the customer belongs to.
 * @param {string} invoiceId  - The invoice ID you wish to get the information for.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 *
 */
Networks.prototype.getInvoiceById = function (networkId, invoiceId) {
  var url, request;

  if (typeof networkId !== 'string') {
    return utils.promisify(false,
      'IngestSDK getInvoiceById requires networkId to be passed as a string.');
  }

  if (typeof invoiceId !== 'string') {
    return utils.promisify(false,
      'IngestSDK getInvoiceById requires invoiceId to be passed as a string.');
  }

  url = utils.parseTokens(this.config.host + this.config.invoicesById, {
    resource: this.config.resource,
    networkId: networkId,
    invoiceId: invoiceId
  });

  request = new Request({
    url: url,
    token: this._tokenSource()
  });

  return request.send();
};

/**
 * Gets current usage for a network
 *
 * @param {string} networkId  - The network ID the customer belongs to.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 *
 */
Networks.prototype.getCurrentUsage = function (networkId) {
  var url, request;

  if (typeof networkId !== 'string') {
    return utils.promisify(false,
      'IngestSDK getCurrentUsage requires networkId to be passed as a string.');
  }

  url = utils.parseTokens(this.config.host + this.config.currentUsage, {
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
 * Gets all pending users for the specified network.
 *
 * @param {string} networkId - The network ID.
 *
 * @return {Promise} - A promise which resolves when the request is complete.
 */
Networks.prototype.getPendingUsers = function (networkId) {
  var url, request;

  if (typeof networkId !== 'string') {
    return utils.promisify(false,
      'IngestSDK getPendingUsers requires networkId to be passed as a string.');
  }

  url = utils.parseTokens(this.config.host + this.config.getPendingUsers, {
    resource:  this.config.resource,
    networkId: networkId
  });

  request = new Request({
    url: url,
    token: this._tokenSource()
  });

  return request.send();
};

/**
 * Deletes a pending user from the specified network.
 *
 * @param {string} networkId     - The network ID that the pending user belongs to.
 * @param {string} pendingUserId - The pending user to delete from the network.
 *
 * @return {Promise} - A promise which resolves when the request is complete.
 */
Networks.prototype.deletePendingUser = function (networkId, pendingUserId) {
  var url, request;

  if (typeof networkId !== 'string' || typeof pendingUserId !== 'string') {
    return utils.promisify(false,
      'IngestSDK deletePendingUser requires networkId and pendingUserId to be passed as strings.');
  }

  url = utils.parseTokens(this.config.host + this.config.deletePendingUser, {
    resource: this.config.resource,
    networkId: networkId,
    pendingUserId: pendingUserId
  });

  request = new Request({
    method: 'DELETE',
    url: url,
    token: this._tokenSource()
  });

  return request.send();
};

module.exports = Networks;
