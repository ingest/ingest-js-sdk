var extend = require('extend');
var Request = require('./Request');
var JWTUtils = require('./JWTUtils');
var utils = require('./Utils');
var Uploader = require('./Uploader');
var Cache = require('./Cache');

var Resource = require('./resources/Resource');
var Users = require('./resources/Users');
var Networks = require('./resources/Networks');

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
  this.networksResource = Networks;
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
    tokenSource: this.getToken.bind(this)
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

  this.networks = new Networks({
    host: this.config.host,
    resource: 'networks',
    tokenSource: this.getToken.bind(this),
    cache: this.cache,
    invite: '/networks/invite'
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
  var request = new Request({
    url: this.config.host + this.config.networksKeys,
    token: this.getToken()
  });

  return request.send();
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
  var request;

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

  request = new Request({
    url: this.config.host + this.config.networksKeys,
    token: this.getToken(),
    method: 'POST',
    data: data
  });

  return request.send();
};

/**
 * Retrieves a single network secure key entry based on the UUID given.
 * @param {string}  id  The UUID of the secure key entry.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
IngestAPI.prototype.getNetworkSecureKeyById = function (id) {
  var tokens, url, request;

  if (typeof id !== 'string') {
    return utils.promisify(false,
      'IngestAPI getNetworkSecureKeyById requires an id to be passed as a string.');
  }

  tokens = {
    id: id
  };

  url = utils.parseTokens(this.config.host + this.config.networksKeysById, tokens);

  request = new Request({
    url: url,
    token: this.getToken()
  });

  return request.send();
};

/**
 * Updates an individual secure key entry in the current network.
 * @param {object}  data        The object containing data for the secure key entry.
 * @param {string}  data.title  The title for the current network.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
IngestAPI.prototype.updateNetworkSecureKey = function (data) {
  var tokens, url, request;

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

  request = new Request({
    url: url,
    token: this.getToken(),
    method: 'PATCH',
    data: data
  });

  return request.send();
};

/**
 * Deletes a single network secure key entry based on the UUID given.
 * @param {string}  id  The UUID of the secure key entry.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
IngestAPI.prototype.deleteNetworkSecureKeyById = function (id) {
  var tokens, url, request;

  if (typeof id !== 'string') {
    return utils.promisify(false,
      'IngestAPI deleteNetworkSecureKeyById requires an id to be passed as a string.');
  }

  tokens = {
    id: id
  };

  url = utils.parseTokens(this.config.host + this.config.networksKeysById, tokens);

  request = new Request({
    url: url,
    token: this.getToken(),
    method: 'DELETE'
  });

  return request.send();

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

module.exports = IngestAPI;
