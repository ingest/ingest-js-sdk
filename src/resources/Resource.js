var extend = require('extend');
var Request = require('../Request');
var utils = require('../Utils');

/**
 * Resource Object
 * @class
 */
function Resource (options) {

  this.defaults = {
    host: 'https://api.ingest.io',
    all: '/<%=resource%>',
    byId: '/<%=resource%>/<%=id%>',
    thumbnails: '/<%=resource%>/<%=id%>/thumbnails',
    trash: '/<%=resource%>?filter=trashed',
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
  var url = utils.parseTokens(this.config.host + this.config.all, {
    resource: this.config.resource
  });

  return new Request({
    url: url,
    token: this._tokenSource(),
    headers: headers
  }).then(this._updateCachedResources.bind(this));
};

/**
 * Return a resource that matches the supplied id.
 * @param  {string}   id    Resource id.
 * @return {promise}        A promise which resolves when the request is complete.
 */
Resource.prototype.getById = function (id) {
  var url, cachedResult;

  if (typeof id !== 'string') {
    return utils.promisify(false,
      'IngestAPI Resource getById requires a valid id passed as a string.');
  }

  url = utils.parseTokens(this.config.host + this.config.byId, {
    resource: this.config.resource,
    id: id
  });

  if (this.cache && this.cache.enabled) {
    // retrieve the cached item.
    cachedResult = this.cache.retrieve(id);
  }

  // Return a cached result if we've found one.
  if (cachedResult) {
    return utils.promisify(true, {
      data: cachedResult
    });
  } else {
    return new Request({
      url: url,
      token: this._tokenSource()
    });
  }
};

/**
 * Return the resources currently in the trash.
 * @param  {object} headers Headers to be passed along with the request for pagination.
 * @return {promise}         A promise which resolves when the request is complete.
 */
Resource.prototype.getTrashed = function (headers) {
  var url = utils.parseTokens(this.config.host + this.config.trash, {
    resource: this.config.resource
  });

  return new Request({
    url: url,
    token: this._tokenSource(),
    headers: headers
  });
};

/**
 * Retrieve all thumbnails for a provided resource id.
 * @param {string} id ID of the resource to retrieve thumbnails for.
 * @return {promise}  A promise which resolves when the request is complete.
 */
Resource.prototype.getThumbnails = function (id) {
  var url;

  if (typeof id !== 'string') {
    return utils.promisify(false,
      'IngestAPI Resource getThumbnails requires an id to be passed as a string.');
  }

  url = utils.parseTokens(this.config.host + this.config.thumbnails, {
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
  }).then(this._updateCachedResource.bind(this));
};

/**
 * Update an existing resource with new content.
 * @param  {object|array} resource  An object or an array of objects representing the resource(s) to be updated.
 * @return {promise}                A promise which resolves when the request is complete.
 */
Resource.prototype.update = function (resource) {
  if (typeof resource !== 'object') {
    return utils.promisify(false,
      'IngestAPI Resource update requires a resource to be passed either as an object or an array of objects.'); //eslint-disable-line
  }

  // If they've passed an array fire the updateArray function.
  if (Array.isArray(resource)) {
    return this._updateResourceArray(resource);
  } else {
    return this._updateResource(resource);
  }
};

/**
 * Update a single resource.
 * @private
 * @param  {object}   resource  An object representing the resource to update.
 * @return {promise}            A promise which resolves when the request is complete.
 */
Resource.prototype._updateResource = function (resource) {
  var data = resource;

  var url = utils.parseTokens(this.config.host + this.config.byId, {
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

  return new Request({
    url: url,
    token: this._tokenSource(),
    method: 'PATCH',
    data: data
  }).then(this._updateCachedResource.bind(this));
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
  }).then(this._updateCachedResources.bind(this));
};

/**
 * Delete an existing resource
 * @param  {object | array} resource The id, or an array of ids for the resource(s) to be deleted.
 * @param {boolean}   async       A flag to indicate if this should be an async request to delete.
 * @return {promise}          A promise which resolves when the request is complete.
 */
Resource.prototype.delete = function (resource, async) {
  if (typeof async === 'undefined') {
    async = true;
  }

  if (typeof resource !== 'string') {
    // If they've passed an array fire the updateArray function.
    if (Array.isArray(resource)) {
      return this._deleteResourceArray(resource, false, async);
    }

    return utils.promisify(false,
      'IngestAPI Resource delete requires a resource to be passed either as a string or an array of strings.'); //eslint-disable-line
  }

  return this._deleteResource(resource, false, async);
};

/**
 * Permanently delete an existing resource.
 * @param  {object | array} resource The id, or an array of ids for the resource(s) to be deleted.
 * @param {boolean}   async       A flag to indicate if this should be an async request to delete.
 * @return {promise}          A promise which resolves when the request is complete.
 */
Resource.prototype.permanentDelete = function (resource, async) {
  if (typeof async === 'undefined') {
    async = true;
  }

  if (typeof resource !== 'string') {
    // If they've passed an array fire the updateArray function.
    if (Array.isArray(resource)) {
      return this._deleteResourceArray(resource, true, async);
    }

    return utils.promisify(false,
      'IngestAPI Resource delete requires a resource to be passed either as a string or an array of strings.'); //eslint-disable-line
  }

  return this._deleteResource(resource, true, async);
};

/**
 * Delete a single resource
 * @private
 * @param  {object}   resource  The id of the resource to be deleted.
 * @param {boolean}   permanent  A flag to permanently delete each video.
 * @param {boolean}   async       A flag to indicate if this should be an async request to delete.
 * @return {promise}            A promise which resolves when the request is complete.
 */
Resource.prototype._deleteResource = function (resource, permanent, async) {
  var url = utils.parseTokens(this.config.host + this.config.byId, {
    resource: this.config.resource,
    id: resource
  });

  if (permanent === true) {
    url += this.config.deleteMethods.permanent;
  }

  return new Request({
    url: url,
    async: async,
    token: this._tokenSource(),
    method: 'DELETE',
  }).then(this._deleteCachedResource.bind(this, resource));
};

/**
 * Delete an array of resources
 * @private
 * @param  {array}  resources   An array of resource objects to be deleted.
 * @param {boolean}  permanent  A flag to permanently delete each video.
 * @return {promise}            A promise which resolves when the request is complete.
 */
Resource.prototype._deleteResourceArray = function (resources, permanent) {
  var url = utils.parseTokens(this.config.host + this.config.all, {
    resource: this.config.resource
  });

  if (permanent === true) {
    url += this.config.deleteMethods.permanent;
  }

  return new Request({
    url: url,
    token: this._tokenSource(),
    method: 'DELETE',
    data: resources
  }).then(this._deleteCachedResources.bind(this, resources));
};

/**
 * Return a subset of items that match the search terms.
 * @param  {string} input    The search terms to match against.
 * @param  {object} headers  The headers to be passed to the request.
 * @return {Promise}          A promise which resolves when the request is complete.
 */
Resource.prototype.search = function (input, headers) {
  var url;

  if (typeof input !== 'string') {
    return utils.promisify(false,
      'IngestAPI Resource search requires search input to be passed as a string.');
  }

  url = utils.parseTokens(this.config.host + this.config.search, {
    resource: this.config.resource,
    input: input
  });

  return new Request({
    url: url,
    token: this._tokenSource(),
    headers: headers
  });
};

/**
 * Get the total count of resources.
 * @return {promise} A promise which resolves when the request is complete.
 */
Resource.prototype.count = function () {
  var url = utils.parseTokens(this.config.host + this.config.all, {
    resource: this.config.resource
  });

  return new Request({
    url: url,
    token: this._tokenSource(),
    method: 'HEAD'
  }).then(this._handleCountResponse);
};

/**
 * Get the total count of resources in the trash.
 * @return {promise} A promise which resolves when the request is complete.
 */
Resource.prototype.trashCount = function () {
  var url = utils.parseTokens(this.config.host + this.config.trash, {
    resource: this.config.resource
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

/**
 * Delete an array of cached resources
 * @param  {array}    ids         Array of resource id's to delete from cache.
 * @param  {object}   response    Response object from the getAll request.
 * @return {response}             Response object from the getAll request.
 */
Resource.prototype._deleteCachedResources = function (ids, response) {
  var dataLength = ids.length;
  var i;

  if (this.cache && this.cache.enabled) {

    for (i = 0; i < dataLength; i++) {
      this.cache.remove(ids[i]);
    }

  }

  return response;
};

module.exports = Resource;
