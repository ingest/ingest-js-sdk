'use strict';

var Resource = require('./Resource');
var Request = require('../Request');
var utils = require('../Utils');
var extend = require('extend');
var ResourceTypes = require('../constants/resourceTypes');

/**
 * Jobs Resource
 *
 * @param {object} options - SDK Options.
 * @class
 * @extends Resource
 */
function Jobs (options) {

  var overrides = {
    resource: ResourceTypes.JOBS,
    progress: '/<%=resource%>/<%=id%>/progress'
  };

  options = extend(true, {}, overrides, options);

  Resource.call(this, options);

};

// This extends the base class of 'Resource'.
Jobs.prototype = Object.create(Resource.prototype);
Jobs.prototype.constructor = Jobs;

/**
 * Creates a new encoding job.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
Jobs.prototype.add = function (resource) {

  var url, request;

  if (typeof resource !== 'object') {
    return utils.promisify(false,
      'IngestSDK Jobs `add` requires a resource passed as an object.');
  }

  url = utils.parseTokens(this.config.host + this.config.all, {
    resource: this.config.resource
  });

  request = new Request({
    url: url,
    token: this._tokenSource(),
    method: 'POST',
    data: resource
  });

  return request.send();
};

/**
 * Gets the progress of a current encoding job
 *
 * @param  {string}  id The id of the job
 * @return {Promise}    A promise which resolves when the request is complete.
 */
Jobs.prototype.progress = function (id) {
  var url, request;

  if (typeof id !== 'string') {
    return utils.promisify(false,
      'IngestSDK Jobs `progress` requires `jobId` to be passed as a string.');
  }

  url = utils.parseTokens(this.config.host + this.config.progress, {
    resource: this.config.resource,
    id: id
  });

  request = new Request({
    url: url,
    token: this._tokenSource(),
    method: 'GET'
  });

  return request.send();
};

module.exports = Jobs;
