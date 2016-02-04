/**
 * A management layer for storing app cache in local storage.
 */
var Cache = function (cacheAge) {
  this.cacheAge = cacheAge;
  this.enabled = this._checkCacheSupport();
};

/**
 * Return true if localStorage is supported.
 * @private
 * @return {boolean} True if localStorage is supported.
 */
Cache.prototype._checkCacheSupport = function () {

  var support = 'support';

  try {
    localStorage.setItem(support, support);
    localStorage.removeItem(support);
    return true;
  } catch (e) {
    return false;
  }

};

/**
 * Retrieve the cached result for the provided cacheKey.
 * @param  {string}   cacheKey  Key associated with the cached result.
 * @return {object}             Parse results object.
 */
Cache.prototype.retrieve = function (cacheKey) {
  var data;
  var value = null;
  var expiry;

  try {

    data = localStorage.getItem(cacheKey);
    data = JSON.parse(data);
    value = data.value;

    if (data.expiry < Date.now()) {
      // Cache is expired;
      localStorage.removeItem(cacheKey);
      value = null;
    }

  } catch (error) {
    // Silent capture so that caching never gets in the way of returning a result.
    value = null;
  }

  return value;
};

/**
 * Remove a result from the cache.
 * @param  {string}   cacheKey  Key associated with the cached result.
 * @return {boolean}            A boolean indicating success of the removal.
 */
Cache.prototype.remove = function (cacheKey) {
  var result = true;

  try {
    localStorage.removeItem(cacheKey);
  } catch (error) {
    // Silent capture so that caching never gets in the way of returning a result.
    result = false;
  }

  return result;
};

/**
 * Save the new result with its expiry date.
 * @param  {string}   cacheKey Unique cache key for the request.
 * @param  {number}   expiry   Unix timestamp for the expiry.
 * @param  {object}   result   Object to be cached.
 * @return {boolean}            A boolean indicating success of the save.
 */
Cache.prototype.save = function (cacheKey, value) {
  var result = true;
  var data = {};
  var JSONResult;

  try {

    data.expiry = Date.now() + this.cacheAge;
    data.value = value;

    JSONResult = JSON.stringify(data);

    localStorage.setItem(cacheKey, JSONResult);

  } catch (error) {
    // Silent capture so that caching never gets in the way of returning a result.
    result = false;
  }

  return result;
};

module.exports = Cache;
