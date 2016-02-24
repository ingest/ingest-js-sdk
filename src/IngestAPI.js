var extend = require('extend');
var Request = require('./Request');
var JWTUtils = require('./JWTUtils');
var utils = require('./Utils');
var Uploader = require('./Uploader');
var Cache = require('./Cache');

var Resource = require('./resources/Resource');
var Users = require('./resources/Users');

/**
 * IngestAPI Object
 * @class
 * @param {object}  options        Options to override the default.
 * @param {string}  options.host   Override the default live host.
 * @param {string}  options.token  Auth token to use for requests.
 */
function IngestAPI (options) {

  this.defaults = {
    'host': 'https://api.ingest.io',
    'cacheAge': 300000, // 5 minutes
    'networks': '/networks',
    'networksKeys': '/networks/keys',
    'networksKeysById': '/networks/keys/<%=id%>',
    'inputs': '/encoding/inputs',
    'inputsById' : '/encoding/inputs/<%=id%>',
    'inputsUpload': '/encoding/inputs/<%=id%>/upload<%=method%>',
    'inputsUploadSign': '/encoding/inputs/<%=id%>/upload/sign<%=method%>',
    'inputsUploadComplete': '/encoding/inputs/<%=id%>/upload/complete',
    'inputsUploadAbort': '/encoding/inputs/<%=id%>/upload/abort',
    'uploadMethods': {
      'param': '?type=',
      'singlePart': 'amazon',
      'multiPart': 'amazonMP'
    }
  };

  // Create a config object by extending the defaults with the pass options.
  this.config = extend(true, {}, this.defaults, options);

  this.token = null;

  if (this.config.token) {
    // Store the token for future use.
    this.setToken(this.config.token);
  }

  /* Exposed for testing */
  this.request = Request;
  this.JWTUtils = JWTUtils;
  this.utils = utils;
  this.resource = Resource;
  this.usersResource = Users;
  this.uploader = Uploader;

  this.cache = new Cache(this.config.cacheAge);

  this.videos = new Resource({
    host: this.config.host,
    resource: 'videos',
    tokenSource: this.getToken.bind(this),
    cache: this.cache
  });

  this.playlists = new Resource({
    host: this.config.host,
    resource: 'playlists',
    tokenSource: this.getToken.bind(this),
    cache: this.cache
  });

  this.inputs = new Resource({
    host: this.config.host,
    resource: 'encoding/inputs',
    tokenSource: this.getToken.bind(this),
    cache: this.cache
  });

  this.users = new Users({
    host: this.config.host,
    resource: 'users',
    tokenSource: this.getToken.bind(this),
    cache: this.cache,
    currentUser: '/users/me',
    transfer: '/users/<%=oldId%>/transfer/<%=newId%>',
    revoke: '/revoke'
  });

}
/** Token **/
/**
 * Set the auth token to use.
 * @param   {String}        token Auth token to use.
 */
IngestAPI.prototype.setToken = function (token) {

  // Make sure a valid value is passed.
  if (typeof token !== 'string') {
    throw new Error('IngestAPI requires an authentication token passed as a string.');
  }

  this.token = token;
};

/**
 * Return the current auth token.
 * @return  {String}        Current auth token, or null if a token has not been set.
 */
IngestAPI.prototype.getToken = function () {
  return this.token;
};

/** Network Information **/

/**
 * Get the current network primary key in RSA format.
 * @return {Promise} Promise/A+ spec which resolves with the primary network key.
 */
IngestAPI.prototype.getNetworkSecureKeys = function () {
  return new Request({
    url: this.config.host + this.config.networksKeys,
    token: this.getToken()
  });
};

/**
 * Adds a new secure key to the current network.
 * @param {object}  data        The object containing data for the secure key entry.
 * @param {string}  data.title  Optional. The title of the secure key. Will default to "Default Key Title"
 * @param {string}  data.key    The public key in RSA format.
 *
 * @return {Promise}          A promise which resolves when the request is complete.
 */
IngestAPI.prototype.addNetworkSecureKey = function (data) {
  if (typeof data !== 'object') {
    return utils.promisify(false,
      'IngestAPI addNetworkSecureKey requires data to be passed as an object.');
  }

  // The title must be a string.
  if (typeof data.title !== 'string') {
    data.title = '';
  }

  if (typeof data.key !== 'string') {
    return utils.promisify(false,
      'IngestAPI addNetworkSecureKey requires that the key be a string in RSA public key format.');
  }

  return new Request({
    url: this.config.host + this.config.networksKeys,
    token: this.getToken(),
    method: 'POST',
    data: data
  });
};

/**
 * Retrieves a single network secure key entry based on the UUID given.
 * @param {string}  id  The UUID of the secure key entry.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
IngestAPI.prototype.getNetworkSecureKeyById = function (id) {
  var tokens, url;

  if (typeof id !== 'string') {
    return utils.promisify(false,
      'IngestAPI getNetworkSecureKeyById requires an id to be passed as a string.');
  }

  tokens = {
    id: id
  };

  url = utils.parseTokens(this.config.host + this.config.networksKeysById, tokens);

  return new Request({
    url: url,
    token: this.getToken()
  });
};

/**
 * Updates an individual secure key entry in the current network.
 * @param {object}  data        The object containing data for the secure key entry.
 * @param {string}  data.title  The title for the current network.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
IngestAPI.prototype.updateNetworkSecureKey = function (data) {
  var tokens, url;

  if (typeof data !== 'object') {
    return utils.promisify(false,
      'IngestAPI updateNetworkSecureKeyById requires data to be passed as an object.');
  }

  if (typeof data.id !== 'string') {
    return utils.promisify(false,
      'IngestAPI updateNetworkSecureKeyById requires a param "id" to be a string.');
  }

  if (typeof data.title !== 'string') {
    data.title = '';
  }

  tokens = {
    id: data.id
  };

  url = utils.parseTokens(this.config.host + this.config.networksKeysById, tokens);

  return new Request({
    url: url,
    token: this.getToken(),
    method: 'PATCH',
    data: data
  });
};

/**
 * Deletes a single network secure key entry based on the UUID given.
 * @param {string}  id  The UUID of the secure key entry.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
IngestAPI.prototype.deleteNetworkSecureKeyById = function (id) {
  var tokens, url;

  if (typeof id !== 'string') {
    return utils.promisify(false,
      'IngestAPI deleteNetworkSecureKeyById requires an id to be passed as a string.');
  }

  tokens = {
    id: id
  };

  url = utils.parseTokens(this.config.host + this.config.networksKeysById, tokens);

  return new Request({
    url: url,
    token: this.getToken(),
    method: 'DELETE'
  });
};

/**
 * Create a new input and upload a file.
 * @param  {File}   file    File to upload.
 * @return {Promise} A promise which resolves when the upload is complete.
 */
IngestAPI.prototype.upload = function (file) {
  return new Uploader({
    file: file,
    api: this,
    host: this.config.host
  });
};

/** User Information **/

// /**
//  * Retrieves a count of all users in the authorized network.
//  *
//  * @return {Promise} A promise which resolves when the request is complete.
//  */
// IngestAPI.prototype.getUsersCount = function () {
//   return new Request({
//     url: this.config.host + this.config.users.all,
//     token: this.getToken(),
//     method: 'HEAD'
//   });
// };

// /**
//  * Retrieve information for the current user.
//  *
//  * @return {Promise} A promise which resolves when the request is complete.
//  */
// IngestAPI.prototype.getCurrentUserInfo = function () {
//   return new Request({
//     url: this.config.host + this.config.users.currentUser,
//     token: this.getToken()
//   });
// };

// /**
//  * Retrieves a user object.
//  *
//  * @param {string} id - The unique ID of the user to retrieve.
//  *
//  * @return {Promise} A promise which resolves when the request is complete.
//  */
// IngestAPI.prototype.getUserById = function (id) {
//   var tokens, url;

//   if (typeof id !== 'string') {
//     return utils.promisify(false,
//       'IngestAPI getUserById requires an id to be passed as a string.');
//   }

//   tokens = {
//     id: id
//   };

//   url = utils.parseTokens(this.config.host + this.config.users.byId, tokens);

//   return new Request({
//     url: url,
//     token: this.getToken()
//   });
// };

// /**
//  * Retrieves all users in the authorized network.
//  *
//  * @return {Promise} A promise which resolves when the request is complete.
//  */
// IngestAPI.prototype.getAllUsers = function () {
//   return new Request({
//     url: this.config.host + this.config.users.all,
//     token: this.getToken()
//   });
// };

// /**
//  * Adds a user to the authorized network.
//  *
//  * @param {object} user - The user object.
//  *
//  * @return {Promise} A promise which resolves when the request is complete.
//  */
// IngestAPI.prototype.addUser = function (user) {
//   if (typeof user !== 'object') {
//     return utils.promisify(false,
//       'IngestAPI addUser requires a user object to be passed.');
//   }

//   return new Request({
//     url: this.config.host + this.config.users.all,
//     token: this.getToken(),
//     method: 'POST'
//   });
// };

// /**
//  * Updates the given user object.
//  *
//  * @param {string} user.id - The unique ID of this user. Required.
//  * @param {object} user    - The user object.
//  *
//  * @return {Promise} A promise which resolves when the request is complete.
//  */
// IngestAPI.prototype.updateUser = function (user) {
//   var tokens, url;

//   if (typeof user !== 'object') {
//     return utils.promisify(false,
//       'IngestAPI updateUser requires a user object to be passed.');
//   }

//   if (typeof user.id !== 'string') {
//     return utils.promisify(false,
//       'IngestAPI updateUser requires a user object contain an "id" as a string.');
//   }

//   tokens = {
//     id: user.id
//   };

//   url = utils.parseTokens(this.config.host + this.config.users.byId, tokens);

//   return new Request({
//     url: url,
//     token: this.getToken(),
//     method: 'PATCH'
//   });
// };

// /**
//  * Disables a user within the authorized network.
//  *
//  * @param {string} id - The unique ID of the user.
//  *
//  * @return {Promise} A promise which resolves when the request is complete.
//  */
// IngestAPI.prototype.deleteUser = function (id) {
//   var tokens, url;

//   if (typeof id !== 'string') {
//     return utils.promisify(false,
//       'IngestAPI deleteUser requires "id" to be passed as a string.');
//   }

//   tokens = {
//     id: id
//   };

//   url = utils.parseTokens(this.config.host + this.config.byId, tokens);

//   return new Request({
//     url: url,
//     token: this.getToken(),
//     method: 'DELETE'
//   });
// };

// /**
//  * Deletes a user within the authorized network.
//  * Permanent deletion is only successful when the requested user has no authored content.
//  *
//  * @param {string} id - The unique ID of the user.
//  *
//  * @return {Promise} A promise which resolves when the request is complete.
//  */
// IngestAPI.prototype.permanentlyDeleteUser = function (id) {
//   var tokens, url;

//   if (typeof id !== 'string') {
//     return utils.promisify(false,
//       'IngestAPI permanentlyDeleteUser requires "id" to be passed as a string.');
//   }

//   tokens = {
//     id: id
//   };

//   url = utils.parseTokens(this.config.host + this.config.byId, tokens);

//   return new Request({
//     url: url + '?permanent=1',
//     token: this.getToken(),
//     method: 'DELETE'
//   });
// };

// /**
//  * Transfer all authorship currently under the specified user onto another.
//  * This includes all videos & playlists.
//  * This task is commonly used in conjunction with permanently deleting a user.
//  *
//  * @param {string} oldId - The user who currently has authorship.
//  * @param {string} newId - The user to transfer authorship to.
//  *
//  * @return {Promise} A promise which resolves when the request is complete.
//  */
// IngestAPI.prototype.transferUserAuthorship = function (oldId, newId) {
//   var tokens, url;

//   if (typeof oldId !== 'string') {
//     return utils.promisify(false,
//       'IngestAPI transferUserAuthorship requires "oldId" to be passed a string.');
//   }

//   if (typeof newId !== 'string') {
//     return utils.promisify(false,
//       'IngestAPI transferUserAuthorship requires "newId" to be passed as a string');
//   }

//   tokens = {
//     oldId: oldId,
//     newId: newId
//   };

//   url = utils.parseTokens(this.config.host + this.config.users.transfer, tokens);

//   return new Request({
//     url: url,
//     token: this.getToken(),
//     method: 'PATCH'
//   });
// };

// /**
//  * Link an existing user to the currently authorized network.
//  *
//  * @param {string} id - The unique ID of the user to link.
//  *
//  * @return {object} - The user object.
//  *
//  * @return {Promise} A promise which resolves when the request is complete.
//  */
// IngestAPI.prototype.linkUser = function (id) {
//   var tokens, url;

//   if (typeof id !== 'string') {
//     return utils.promisify(false,
//       'IngestAPI linkUser requires "id" to be passed as a string.');
//   }

//   tokens = {
//     id: id
//   };

//   url = utils.parseTokens(this.config.host + this.config.users.byId, tokens);

//   return new Request({
//     url: url,
//     token: this.getToken(),
//     method: 'LINK'
//   });
// };

// /**
//  * Remove the specified user from the currently authorized network.
//  *
//  * @param {string} id - The unique ID of the user to unlink.
//  *
//  * @return {Promise} A promise which resolves when the request is complete.
//  */
// IngestAPI.prototype.unlinkUser = function (id) {
//   var tokens, url;

//   if (typeof id !== 'string') {
//     return utils.promisify(false,
//       'IngestAPI unlinkUser requires "id" to be passed as a string.');
//   }

//   tokens = {
//     id: id
//   };

//   url = utils.parseTokens(this.config.host + this.config.users.byId, tokens);

//   return new Request({
//     url: url,
//     token: this.getToken(),
//     method: 'UNLINK'
//   });
// };

// /**
//  * Revokes the authorization token for the current user.
//  *
//  * @return {Promise} A promise which resolves when the request is complete.
//  */
// IngestAPI.prototype.revokeCurrentUser = function () {
//   return new Request({
//     url: this.config.host + this.config.users.currentUser.revoke,
//     token: this.getToken(),
//     method: 'DELETE'
//   });
// };

// /**
//  * Revokes the authorization token for the specified user.
//  *
//  * @param {string} id - The unique ID of the user to revoke.
//  *
//  * @return {Promise} A promise which resolves when the request is complete.
//  */
// IngestAPI.prototype.revokeUserById = function (id) {
//   var tokens, url;

//   if (typeof id !== 'string') {
//     return utils.promisify(false,
//       'IngestAPI revokeUserById requires an "id" to be passed as a string.');
//   }

//   tokens = {
//     id: id
//   };

//   url = utils.parseTokens(
//     this.config.host + this.config.users.byId + this.config.users.revoke,
//     tokens
//   );

//   return new Request({
//     url: url,
//     token: this.getToken(),
//     method: 'DELETE'
//   });
// };

module.exports = IngestAPI;
