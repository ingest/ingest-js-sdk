'use strict';

var extend = require('extend');
var Request = require('./Request');
var JWTUtils = require('./JWTUtils');
var utils = require('./Utils');
var Uploader = require('./Uploader');
var RequestManager = require('./RequestManager');

var Resource = require('./resources/Resource');
var Media = require('./resources/PlaybackContent');
var Users = require('./resources/Users');
var Networks = require('./resources/Networks');
var Videos = require('./resources/Videos');
var Jobs = require('./resources/Jobs');
var Profiles = require('./resources/Profiles');
var Inputs = require('./resources/Inputs');
var Events = require('./resources/Events');
var Roles = require('./resources/Roles');
var Livestreams = require('./resources/Livestreams');

/**
 * IngestAPI Object
 * @class
 * @param {object}  options        Options to override the default.
 * @param {string}  options.host   Override the default live host.
 * @param {string}  options.token  Auth token to use for requests.
 */
function IngestSDK (options) {
  var resourceConfig;

  this.defaults = {
    'maxRequests': 6, // Active Requests
    'host': 'https://api.ingest.io'
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
  this.playbackContent = Media;
  this.usersResource = Users;
  this.networksResource = Networks;
  this.videosResource = Videos;
  this.jobsResource = Jobs;
  this.profilesResource = Profiles;
  this.inputsResource = Inputs;
  this.uploader = Uploader;
  this.eventsResource = Events;
  this.rolesResource = Roles;
  this.livestreamsResource = Livestreams;

  // Set my max requests
  this.requestManager = RequestManager;
  this.setMaxRequests(this.config.maxRequests);

  resourceConfig = {
    host: this.config.host,
    tokenSource: this.getToken.bind(this)
  };

  this.videos = new Videos(resourceConfig);
  this.inputs = new Inputs(resourceConfig);
  this.users = new Users(resourceConfig);
  this.networks = new Networks(resourceConfig);
  this.profiles = new Profiles(resourceConfig);
  this.jobs = new Jobs(resourceConfig);
  this.events = new Events(resourceConfig);
  this.roles = new Roles(resourceConfig);
  this.livestreams = new Livestreams(resourceConfig);
}

/** Token **/
/**
 * Set the auth token to use.
 * @param   {String}        token Auth token to use.
 */
IngestSDK.prototype.setToken = function (token) {

  // Make sure a valid value is passed.
  if (typeof token !== 'string') {
    throw new Error('IngestSDK requires an authentication token passed as a string.');
  }

  this.token = token;
};

/**
 * Sets the maxrequests in the Request Manager
 * @param {number} max - The max amount of requests at once
 */
IngestSDK.prototype.setMaxRequests = function (max) {
  // Make sure we have a valid number.
  if (typeof max !== 'number' || max < 1) {
    throw new Error('IngestSDK requires a maxRequest count to be passed as a positive number.');
  }

  RequestManager.setMaxRequests(max);
};

/**
 * Return the current auth token.
 * @return  {String}        Current auth token, or null if a token has not been set.
 */
IngestSDK.prototype.getToken = function () {
  return this.token;
};

/**
 * Create a new input and upload a file.
 * @param  {File}   file    File to upload.
 * @return {Promise} A promise which resolves when the upload is complete.
 */
IngestSDK.prototype.upload = function (file) {
  return new Uploader({
    file: file,
    api: this,
    host: this.config.host
  });
};

module.exports = IngestSDK;
