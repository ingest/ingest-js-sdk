'use strict';

var extend = require('extend');
var Request = require('../Request');
var utils = require('../Utils');

/**
 * Abstract Resource Class
 *
 * @param {object} options - SDK Options.
 * @class
 */
function Resource (options) {

  this.defaults = {
    host: 'https://api.ingest.io',
    all: '/<%=resource%>',
    byId: '/<%=resource%>/<%=id%>',
    trash: '/<%=resource%>?status=trashed',
    deleteMethods: {
      'permanent': '?permanent=1'
    },
    search: '/<%=resource%>?search=<%=input%>',
    tokenSource: null,
    resource: null
  };

  this.config = extend(true, {}, this.defaults, options);

  this.cache = this.config.cache;

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
  var request;
  var url = utils.parseTokens(this.config.host + this.config.all, {
    resource: this.config.resource
  });

  request = new Request({
    url: url,
    token: this._tokenSource(),
    headers: headers
  });

  return request.send()
          .then(this._updateCachedResources.bind(this));
};

/**
 * Return a resource that matches the supplied id.
 * @param  {string}   id    Resource id.
 * @return {promise}        A promise which resolves when the request is complete.
 */
Resource.prototype.getById = function (id) {
  var url, cachedResult, request;

  if (typeof id !== 'string' || id.length <= 0) {
    return utils.promisify(false,
      'IngestAPI Resource getById requires a valid id passed as a string.');
  }

  url = utils.parseTokens(this.config.host + this.config.byId, {
    resource: this.config.resource,
    id: id
  });

  if (this.cache && this.cache.enabled) {
    // Retrieve the cached item.
    cachedResult = this.cache.retrieve(id);
  }

  // Return a cached result if we've found one.
  if (cachedResult) {
    return utils.promisify(true, {
      data: cachedResult
    });
  }

  request = new Request({
    url: url,
    token: this._tokenSource()
  });

  return request.send()
    .then(this._updateCachedResource.bind(this));

};

/**
 * Return the resources currently in the trash.
 * @param  {object} headers Headers to be passed along with the request for pagination.
 * @return {promise}         A promise which resolves when the request is complete.
 */
Resource.prototype.getTrashed = function (headers) {
  var request;
  var url = utils.parseTokens(this.config.host + this.config.trash, {
    resource: this.config.resource
  });

  request = new Request({
    url: url,
    token: this._tokenSource(),
    headers: headers
  });

  return request.send();
};

/**
 * Add a new resource.
 * @param   {object}  resource  An object representing the resource to add.
 * @return  {promise}           A promise which resolves when the request is complete.
 */
Resource.prototype.add = function (resource) {
  var url, request;

  if (typeof resource !== 'object') {
    return utils.promisify(false,
      'IngestAPI Resource add requires a resource passed as an object.');
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

  return request.send()
          .then(this._updateCachedResource.bind(this));
};

/**
 * Update an existing resource with new content.
 * @param  {object|array} resource  An object or an array of objects representing the resource(s) to be updated.
 * @return {promise}                A promise which resolves when the request is complete.
 */
Resource.prototype.update = function (resource) {
  var request, data, url;

  if (typeof resource !== 'object') {
    return utils.promisify(false,
      'IngestAPI Resource update requires a resource to be passed as an object.');
  }

  data = resource;

  url = utils.parseTokens(this.config.host + this.config.byId, {
    resource: this.config.resource,
    id: resource.id
  });

  if (this.cache && this.cache.enabled) {
    data = this.cache.diff(resource.id, resource);
  }

  // Null is returned in the case that the two objects match.
  if (!data) {
    // Return a fulfilled promise with the cached object.
    return utils.promisify(true, {
      data: this.cache.retrieve(resource.id)
    });
  }

  request = new Request({
    url: url,
    token: this._tokenSource(),
    method: 'PATCH',
    data: data
  });

  return request.send()
          .then(this._updateCachedResource.bind(this));
};

/**
 * Delete an existing resource
 * @param  {string}   resource  The id for the resource to be deleted.
 * @param  {boolean}  async     A flag to indicate if this should be an async request to delete.
 *
 * @return {Promise}            A promise which resolves when the request is complete.
 */
Resource.prototype.delete = function (resource, async) {
  if (typeof async !== 'boolean') {
    async = true;
  }

  if (typeof resource !== 'string') {
    return utils.promisify(false,
      'IngestAPI Resource delete requires a resource to be passed as a string.');
  }

  return this._deleteResource(resource, false, async);
};

/**
 * Permanently delete an existing resource.
 * @param  {string}   resource  The id for the resource to be deleted.
 * @param  {boolean}  async     A flag to indicate if this should be an async request to delete.
 *
 * @return {Promise}            A promise which resolves when the request is complete.
 */
Resource.prototype.permanentDelete = function (resource, async) {
  if (typeof async !== 'boolean') {
    async = true;
  }

  if (typeof resource !== 'string') {
    return utils.promisify(false,
      'IngestAPI Resource delete requires a resource to be passed as a string.');
  }

  return this._deleteResource(resource, true, async);
};

/**
 * Delete a single resource
 * @private
 * @param   {object}    resource    The id of the resource to be deleted.
 * @param   {boolean}   permanent   A flag to permanently delete each video.
 * @return  {promise}               A promise which resolves when the request is complete.
 */
Resource.prototype._deleteResource = function (resource, permanent) {
  var request;

  var url = utils.parseTokens(this.config.host + this.config.byId, {
    resource: this.config.resource,
    id: resource
  });

  if (permanent === true) {
    url += this.config.deleteMethods.permanent;
  }

  request = new Request({
    url: url,
    token: this._tokenSource(),
    method: 'DELETE'
  });

  return request.send()
    .then(this._deleteCachedResource.bind(this, resource));
};

/**
 * Delete an existing resource
 * @param  {string}     resource    The id for the resource to be deleted.
 * @param  {function}   callback    A Synchronous callback for handling any errors, or working with the http response.
 */
Resource.prototype.deleteSync = function (resource, callback) {

  if (typeof resource !== 'string') {
    callback(new Error('IngestAPI Resource delete requires a resource to be passed as a string.'));
    return;
  }

  this._deleteResourceSync(resource, false, callback);

};

/**
 * Permanently delete an existing resource.
 * @param   {string}    resource    The id for the resource to be deleted.
 * @param   {function}  callback    A Synchronous callback for handling any errors, or working with the http response.
 */
Resource.prototype.permanentDeleteSync = function (resource, callback) {

  if (typeof resource !== 'string') {
    callback(new Error('IngestAPI Resource delete requires a resource to be passed as a string.'));
    return;
  }

  this._deleteResourceSync(resource, true, callback);

};

/**
 * Delete a single resource synchronously
 * @private
 * @param   {object}    resource    The id of the resource to be deleted.
 * @param   {boolean}   permanent   A flag to permanently delete each video.
 * @param   {function}  callback    A Synchronous callback for handling any errors, or working with the http response.
 */
Resource.prototype._deleteResourceSync = function (resource, permanent, callback) {
  var request;

  var url = utils.parseTokens(this.config.host + this.config.byId, {
    resource: this.config.resource,
    id: resource
  });

  if (permanent === true) {
    url += this.config.deleteMethods.permanent;
  }

  request = new Request({
    url: url,
    async: false,
    token: this._tokenSource(),
    method: 'DELETE'
  });

  request.sendSync(callback);

};

/**
 * Return a subset of items that match the search terms.
 * @param  {string}   input     The search terms to match against.
 * @param  {object}   headers   The headers to be passed to the request.
 * @param  {boolean}  trash     Should we be searching the trash.
 * @return {Promise}          A promise which resolves when the request is complete.
 */
Resource.prototype.search = function (input, headers, status) {
  var url, request;

  if (typeof input !== 'string') {
    return utils.promisify(false,
      'IngestAPI Resource search requires search input to be passed as a string.');
  }

  url = utils.parseTokens(this.config.host + this.config.search, {
    resource: this.config.resource,
    input: encodeURIComponent(input)
  });

  // If there is a status and it
  if (status) {
    if (typeof status !== 'string') {
      return utils.promisify(false,
        'IngestAPI Resource search requires a valid status to be passed as a string.');
    }

    url = url + '&status=' + status;
  }

  request = new Request({
    url: url,
    token: this._tokenSource(),
    headers: headers
  });

  return request.send();
};

/**
 * Return a subset of items that match the search terms in the trash.
 * @param  {string} input    The search terms to match against.
 * @param  {object} headers  The headers to be passed to the request.
 * @return {Promise}          A promise which resolves when the request is complete.
 */
Resource.prototype.searchTrash = function (input, headers) {
  return this.search(input, headers, 'trashed');
};

/**
 * Get the total count of resources.
 * @return {promise} A promise which resolves when the request is complete.
 */
Resource.prototype.count = function () {
  var request;
  var url = utils.parseTokens(this.config.host + this.config.all, {
    resource: this.config.resource
  });

  request = new Request({
    url: url,
    token: this._tokenSource(),
    method: 'HEAD'
  });

  return request.send()
          .then(this._handleCountResponse);
};

/**
 * Get the total count of resources in the trash.
 * @return {promise} A promise which resolves when the request is complete.
 */
Resource.prototype.trashCount = function () {
  var request;
  var url = utils.parseTokens(this.config.host + this.config.trash, {
    resource: this.config.resource
  });

  request = new Request({
    url: url,
    token: this._tokenSource(),
    method: 'HEAD'
  });

  return request.send()
          .then(this._handleCountResponse);
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

/**
 * Update a single cached resource based on the response data.
 * @param  {object}   response   Response object from the getAll request.
 * @return {response}            Response object from the getAll request.
 */
Resource.prototype._updateCachedResource = function (response) {
  if (this.cache && this.cache.enabled) {
    this.cache.save(response.data.id, response.data);
  }

  return response;
};

/**
 * Store the returned items in cache.
 * @param  {object}   response   Response object from the getAll request.
 * @return {response}            Response object from the getAll request.
 */
Resource.prototype._updateCachedResources = function (response) {
  var data = response.data;
  var dataLength = data.length;
  var i;

  if (this.cache && this.cache.enabled) {
    for (i = 0; i < dataLength; i++) {
      this.cache.save(data[i].id, data[i]);
    }

  }

  return response;
};

/**
 * Delete a single cached resource.
 * @param  {string} id            ID of the resource to remove.
 * @param  {object}   response    Response object from the getAll request.
 * @return {response}             Response object from the getAll request.
 */
Resource.prototype._deleteCachedResource = function (id, response) {
  if (this.cache && this.cache.enabled) {
    this.cache.remove(id);
  }

  return response;
};

module.exports = Resource;
