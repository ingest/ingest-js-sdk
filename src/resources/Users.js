'use strict';

var Resource = require('./Resource');
var Request = require('../Request');
var utils = require('../Utils');
var extend = require('extend');
var ResourceTypes = require('../constants/resourceTypes');

/**
 * Users Resource
 *
 * @param {object} options - SDK Options.
 * @class
 * @extends Resource
 */
function Users (options) {

  var overrides = {
    resource: ResourceTypes.USERS,
    currentUser: '/users/me',
    transfer: '/users/<%=oldId%>/transfer/<%=newId%>',
    updateRoles: '/users/<%=id%>/roles',
    revoke: '/revoke'
  };

  options = extend(true, {}, overrides, options);

  Resource.call(this, options);

};

// This extends the base class of 'Resource'.
Users.prototype = Object.create(Resource.prototype);
Users.prototype.constructor = Users;

/**
 * Retrieve information for the current user.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
Users.prototype.getCurrentUserInfo = function () {
  var request = new Request({
    url: this.config.host + this.config.currentUser,
    token: this._tokenSource()
  });

  return request.send();
};

/**
 * Transfer all authorship currently under the specified user onto another.
 * This includes all videos.
 * This task is commonly used in conjunction with permanently deleting a user.
 *
 * @param {string} oldId - The user who currently has authorship.
 * @param {string} newId - The user to transfer authorship to.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
Users.prototype.transferUserAuthorship = function (oldId, newId) {
  var tokens, url, request;

  if (typeof oldId !== 'string') {
    return utils.promisify(false,
      'IngestSDK transferUserAuthorship requires `oldId` to be passed as a string.');
  }

  if (typeof newId !== 'string') {
    return utils.promisify(false,
      'IngestSDK transferUserAuthorship requires `newId` to be passed as a string');
  }

  tokens = {
    oldId: oldId,
    newId: newId
  };

  url = utils.parseTokens(this.config.host + this.config.transfer, tokens);

  request = new Request({
    url: url,
    token: this._tokenSource(),
    method: 'PATCH'
  });

  return request.send();
};

/**
 * Revokes the authorization token for the current user.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
Users.prototype.revokeCurrentUser = function () {
  var request = new Request({
    url: this.config.host + this.config.currentUser + this.config.revoke,
    token: this._tokenSource(),
    method: 'DELETE'
  });

  return request.send();
};

/**
 * Updates a user with the passed in roles
 *
 * @param {string} id      - The id of the user to update their roles
 * @param {array}  roleIDs - The role ids of the roles you wish to assign to the user
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
Users.prototype.updateUserRoles = function (id, roleIDs) {
  var request, url, data;

  if (!Array.isArray(roleIDs) || roleIDs.length < 1) {
    return utils.promisify(false,
      'IngestSDK updateUserRoles requires `roleIDs` to be passed as an array.');
  }

  if (typeof id !== 'string') {
    return utils.promisify(false,
      'IngestSDK updateUserRoles requires `id` to be passed as a string.');
  }

  // Get the url
  url = utils.parseTokens(this.config.host + this.config.updateRoles, {
    id: id
  });

  // Set the data into a structure the api can use it
  data = {
    role_ids: roleIDs
  };

  request = new Request({
    url: url,
    token: this._tokenSource(),
    method: 'PUT',
    data: data
  });

  return request.send();
};

module.exports = Users;
