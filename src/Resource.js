var Request = require('./Request.js');
var Promise = require('pinkyswear');
var extend = require('extend');
var utils = require('Utils');

/**
 * Resource Object
 * @class
 */
function Resource (options) {

  this.defaults = {
    host: 'https://api.ingest.io',
    all: '/<%=resource%>/',
    byId: '/<%=resource%>/<%=id%>',
    thumbnails: '/<%=resource%>/<%=id%>/thumbnails',
    trash: '<%=resource%>/?filter=trashed',
    deleteMethods: {
      'permanent': '?permanent=1'
    },
    search: '/<%=resource%>?search=<%=inputs>',
    tokenSource: null,
    resource: null
  };

  this.config = extend(true, {}, this.defaults, options);

}

/**
 * Proxy the request to token source to ensure a value is always returned.
 * @private
 * @return {string} Auth token.
 */
Resource.prototype._tokenSource = function () {
  var result = null;

  if (this.config.tokenSource) {
    result = this.config.tokenSource.call();
  }

  return result;
};

/**
 * Return a list of the requested resource for the current user and network.
 * @param  {object}   headers   Object representing headers to apply to the request.
 * @return {promise}            A promise which resolves when the request is complete.
 */
Resource.prototype.getAll = function (headers) {
  var url = utils.parseTokens(this.config.host + this.config.all, {
    resource: this.config.resource
  });

  return new Request({
    url: url,
    token: this._tokenSource(),
    headers: headers
  });
};

/**
 * Return a resource that matches the supplied id.
 * @param  {string}   id    Resource id.
 * @return {promise}        A promise which resolves when the request is complete.
 */
Resource.prototype.getById = function (id) {
  var url;

  if (typeof id !== 'string') {
    return utils.promisify(false,
      'IngestAPI Resource getById requires a valid id passed as a string.');
  }

  url = utils.parseTokens(this.config.host + this.config.getById, {
    resource: this.config.resource,
    id: id
  });

  return new Request({
    url: url,
    token: this._tokenSource()
  });
};

/**
 * Add a new resource.
 * @param   {object}  resource  An object representing the resource to add.
 * @return  {promise}           A promise which resolves when the request is complete.
 */
Resource.prototype.add = function (resource) {
  var url;

  if (typeof resource !== 'object') {
    return utils.promisify(false,
      'IngestAPI Resource add requires a resource passed as an object.');
  }

  url = utils.parseTokens(this.config.host + this.config.all, {
    resource: this.config.resource
  });

  return new Request({
    url: url,
    token: this._tokenSource(),
    method: 'POST',
    data: resource
  });
};

/**
 * Update an existing resource with new content.
 * @param  {object|array} resource  An object or an array of objects representing the resource(s) to be updated.
 * @return {promise}                A promise which resolves when the request is complete.
 */
Resource.prototype.update = function (resource) {
  if (typeof resource !== 'object') {
    // If they've passed an array fire the updateArray function.
    if (Array.isArray(resource)) {
      return this._updateResourceArray(resource);
    }

    return utils.promisify(false,
      'IngestAPI Resource update requires a resource to be passed either as an object or an array of objects.'); //eslint-disable-line
  }

  return this._updateResource(resource);
};

/**
 * Update a single resource.
 * @private
 * @param  {object}   resource  An object representing the resource to update.
 * @return {promise}            A promise which resolves when the request is complete.
 */
Resource.prototype._updateResource = function (resource) {
  var url = utils.parseTokens(this.config.host + this.config.byId, {
    resource: this.config.resource,
    id: resource.id
  });

  return new Request({
    url: url,
    token: this._tokenSource(),
    method: 'PATCH',
    data: resource
  });
};

/**
 * Update an array of resources.
 * @private
 * @param  {array} resources  An array of resource objects to be updated.
 * @return {promise}          A promise which resolves when the request is complete.
 */
Resource.prototype._updateResourceArray = function (resources) {
  var url = utils.parseTokens(this.config.host + this.config.all, {
    resource: this.config.resource
  });

  return new Request({
    url: url,
    token: this._tokenSource(),
    method: 'PATCH',
    data: resources
  });
};

/**
 * Delete an existing resource
 * @param  {object | array} resource The id, or an array of ids for the resource(s) to be deleted.
 * @return {promise}          A promise which resolves when the request is complete.
 */
Resource.prototype.delete = function (resource) {
  if (typeof resource !== 'string') {
    // If they've passed an array fire the updateArray function.
    if (Array.isArray(resource)) {
      return this._deleteResourceArray(resource);
    }

    return utils.promisify(false,
      'IngestAPI Resource delete requires a resource to be passed either as a string or an array of strings.'); //eslint-disable-line
  }

  return this._deleteResource(resource);
};

/**
 * Delete a single resource
 * @private
 * @param  {object}   resource  The id of the resource to be deleted.
 * @return {promise}            A promise which resolves when the request is complete.
 */
Resource.prototype._deleteResource = function (resource) {
  var url = utils.parseTokens(this.config.host + this.config.byId, {
    resource: this.config.resource,
    id: resource
  });

  return new Request({
    url: url,
    token: this._tokenSource(),
    method: 'DELETE',
  });
};

/**
 * Delete an array of resources
 * @param  {array}  resources   An array of resource objects to be deleted.
 * @return {promise}            A promise which resolves when the request is complete.
 */
Resource.prototype._deleteResourceArray = function (resources) {
  var url = utils.parseTokens(this.config.host + this.config.all, {
    resource: this.config.resource
  });

  return new Request({
    url: url,
    token: this._tokenSource(),
    method: 'DELETE',
    data:videos
  });
};

/**
 * Return a subset of items that match the search terms.
 * @param  {string} input    The search terms to match against.
 * @param  {object} headers  The headers to be passed to the request.
 * @return {Promise}          A promise which resolves when the request is complete.
 */
Resource.prototype.searchItems = function (input, headers) {
  var url;

  if (typeof input !== 'string') {
    return this.promisify(false,
      'IngestAPI Resource search requires search input to be passed as a string.');
  }

  url = utils.parseTokens(this.config.host + this.config.search, {
    resource: resource,
    input: input
  });

  return new Request({
    url: url,
    token: this.getToken(),
    headers: headers
  });
};

/**
 * Get the total count of resources.
 * @return {promise} A promise which resolves when the request is complete.
 */
Resource.prototype.count = function () {
  var url = utils.parseTokens(this.config.host + this.config.all, {
    resource: resource
  });

  return new Request({
    url: url,
    token: this._tokenSource(),
    method: 'HEAD'
  }).then(this._handleCountResponse);
};

/**
 * Return the resource count from the response.
 * @private
 * @param  {object} response Request response object.
 * @return {number}          The resource count.
 */
Resource.prototype._handleCountResponse = function (response) {
  return parseInt(response.headers('Resource-Count'), 10);
};

module.exports = Resource;
