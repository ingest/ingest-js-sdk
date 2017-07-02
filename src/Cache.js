'use strict';

/**
 * A management layer for storing app cache in session storage.
 */
function Cache (cacheAge) {
  this.cacheAge = cacheAge;
  this.enabled = this._checkCacheSupport();
};

/**
 * Return true if sessionStorage is supported.
 * @private
 * @return {boolean} True if sessionStorage is supported.
 */
Cache.prototype._checkCacheSupport = function () {

  var support = 'support';

  try {
    window.sessionStorage.setItem(support, support);
    window.sessionStorage.removeItem(support);
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

  try {

    data = window.sessionStorage.getItem(cacheKey);
    data = JSON.parse(data);

    if (!data) {
      return value;
    }

    value = data.value;

    if (data.expiry < Date.now()) {
      // Cache is expired;
      window.sessionStorage.removeItem(cacheKey);
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
    window.sessionStorage.removeItem(cacheKey);
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

    window.sessionStorage.setItem(cacheKey, JSONResult);

  } catch (error) {
    // Silent capture so that caching never gets in the way of returning a result.
    result = false;
  }

  return result;
};

/**
 * Return an object representing the differences between the provided object and the cached object.
 * @example
 * //'cachedObject' = {id: '12345'};
 * cache.diff('cachedObject', {title: 'test'});
 * // returns {title: 'test'}
 * @example
 * //'cachedObject' = {id: '12345', title: 'test'};
 * cache.diff('cachedObject', {title: 'test2'});
 * // returns {title: 'test2'}
 *
 * @param  {string} cacheKey  Cachekey of the object to compare against.
 * @param  {object} item      Object to compare against the cached object.
 * @param  {array}  forced    An array of properties to be returned in the resulting object regardless of difference.
 * @return {object}           An object containing the differences.
 */
Cache.prototype.diff = function (cacheKey, item, forced) {
  var property, properties, propertiesLength, i;
  var forcedLength, n;
  var original = this.retrieve(cacheKey);
  var diff = null;

  if (forced) {
    forcedLength = forced.length;
  }

  properties = Object.keys(item);
  propertiesLength = properties.length;

  if (!original) {
    // Return the compare object if the original item wasn't found.
    return item;
  }

  // Walk the object and compare the properties.
  for (i = 0; i < propertiesLength; i++) {
    property = properties[i];

    // Check the values if both objects have the property.
    if (original.hasOwnProperty(property)) {
      if (item[property] === original[property]) {
        // If the values are the same we don't need to add it to the diff so continue.
        continue;
      }
    }

    // If the diff item is still null we need to create a new object to store the properties in.
    if (!diff) {
      diff = {};
    }

    // If we've made it this far the property is either a new one, or the item doesn't match.
    diff[property] = item[property];

  }

  // As long as changes were found append the forced properties.
  if (diff) {
    for (n = 0; n < forcedLength; n++) {
      property = forced[n];
      diff[property] = item[property];
    }
  }

  return diff;

};

/**
 * Return an object representing the differences between the provided objects and the cached object.
 * Similar to diff, but accepts an array of objects.
 *
 * @param  {string} cacheKey  Property on the provided objects that represents the cache key.
 * @param  {object} item      Object to compare against the cached object.
 * @param  {array}  forced    An array of properties to be returned in the resulting object regardless of difference.
 * @return {object}           An object containing the differences.
 */
Cache.prototype.diffArray = function (cacheKey, items, forced) {

  var i;
  var itemsLength = items.length;
  var item;
  var result = null;
  var results = [];

  for (i = 0; i < itemsLength; i++) {
    item = items[i];

    result = this.diff(item[cacheKey], item, forced);

    // Only add it to the result set if changes were found.
    if (result !== null) {
      results.push(result);
    }

  }

  return results;

};

module.exports = Cache;
