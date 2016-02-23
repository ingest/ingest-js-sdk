var Resource = require('../Resource');
var Request = require('../Request');
var utils = require('../Utils');

function Users (options) {

  Resource.call(this, options);

};

Users.prototype = Object.create(Resource.prototype);
Users.prototype.constructor = Users;

/**
 * Retrieve information for the current user.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
Users.prototype.getCurrentUserInfo = function () {
  return new Request({
    url: this.config.host + this.config.users.currentUser,
    token: this.getToken()
  });
};

/**
 * Transfer all authorship currently under the specified user onto another.
 * This includes all videos & playlists.
 * This task is commonly used in conjunction with permanently deleting a user.
 *
 * @param {string} oldId - The user who currently has authorship.
 * @param {string} newId - The user to transfer authorship to.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
Users.prototype.transferUserAuthorship = function (oldId, newId) {
  var tokens, url;

  if (typeof oldId !== 'string') {
    return utils.promisify(false,
      'IngestAPI transferUserAuthorship requires "oldId" to be passed a string.');
  }

  if (typeof newId !== 'string') {
    return utils.promisify(false,
      'IngestAPI transferUserAuthorship requires "newId" to be passed as a string');
  }

  tokens = {
    oldId: oldId,
    newId: newId
  };

  url = utils.parseTokens(this.config.host + this.config.users.transfer, tokens);

  return new Request({
    url: url,
    token: this.getToken(),
    method: 'PATCH'
  });
};

/**
 * Link an existing user to the currently authorized network.
 *
 * @param {string} id - The unique ID of the user to link.
 *
 * @return {object} - The user object.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
Users.prototype.linkUser = function (id) {
  var tokens, url;

  if (typeof id !== 'string') {
    return utils.promisify(false,
      'IngestAPI linkUser requires "id" to be passed as a string.');
  }

  tokens = {
    id: id
  };

  url = utils.parseTokens(this.config.host + this.config.users.byId, tokens);

  return new Request({
    url: url,
    token: this.getToken(),
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
Users.prototype.unlinkUser = function (id) {
  var tokens, url;

  if (typeof id !== 'string') {
    return utils.promisify(false,
      'IngestAPI unlinkUser requires "id" to be passed as a string.');
  }

  tokens = {
    id: id
  };

  url = utils.parseTokens(this.config.host + this.config.users.byId, tokens);

  return new Request({
    url: url,
    token: this.getToken(),
    method: 'UNLINK'
  });
};

/**
 * Revokes the authorization token for the current user.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
Users.prototype.revokeCurrentUser = function () {
  return new Request({
    url: this.config.host + this.config.currentUser.revoke,
    token: this.getToken(),
    method: 'DELETE'
  });
};

module.exports = Users;