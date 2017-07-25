'use strict';

var Resource = require('./Resource');
var Request = require('../Request');
var utils = require('../Utils');
var extend = require('extend');
var ResourceTypes = require('../constants/resourceTypes');

/**
 * Inputs Resource
 *
 * @param {object} options - SDK Options.
 * @class
 * @extends Resource
 */
function Inputs (options) {

  var overrides = {
    resource: ResourceTypes.INPUTS,
    allWithFilters: '/<%=resource%>?filter=<%=filterChain%>',
    searchWithFilters: '/<%=resource%>?search=<%=input%>&filter=<%=filterChain%>'
  };

  options = extend(true, {}, overrides, options);

  Resource.call(this, options);

};

// This extends the base class of 'Resource'.
Inputs.prototype = Object.create(Resource.prototype);
Inputs.prototype.constructor = Inputs;

/**
 * Return a list of Inputs for the current user and network.
 *
 * @param  {object} headers - Object representing headers to apply to the request.
 * @param  {Array}  filters - [Optional] A list of filters to send along with the request to return Inputs that match the criteria.
 *
 * @return {Promise} - A promise which resolves when the request is complete.
 */
Inputs.prototype.getAll = function (headers, filters) {
  var request, url, urlTemplate, tokens;

  tokens = { resource: this.config.resource };
  urlTemplate = this.config.host + this.config.all;

  // If there are filters, join them as a comma seperated string and update our tokens and url template.
  if (Array.isArray(filters) && filters.length > 0) {
    tokens.filterChain = filters.join(',');
    urlTemplate = this.config.host + this.config.allWithFilters;
  }

  url = utils.parseTokens(urlTemplate, tokens);

  request = new Request({
    url: url,
    token: this._tokenSource(),
    headers: headers
  });

  return request.send();
};

/**
 * Return a subset of Inputs that match the search terms.
 *
 * @param  {string} input   - The search terms to match against.
 * @param  {object} headers - The headers to be passed to the request.
 * @param  {Array}  filters - [Optional] A list of filters to send along with the request to return Inputs that match the criteria.
 *
 * @return {Promise} - A promise which resolves when the request is complete.
 */
Inputs.prototype.search = function (input, headers, filters) {
  var url, request, urlTemplate, tokens;

  if (typeof input !== 'string') {
    return utils.promisify(false,
      'IngestSDK Inputs search requires search input to be passed as a string.');
  }

  tokens = { resource: this.config.resource, input: encodeURIComponent(input) };
  urlTemplate = this.config.host + this.config.search;

  // If there are filters, join them as a comma seperated string and update our tokens and url template.
  if (Array.isArray(filters) && filters.length > 0) {
    tokens.filterChain = filters.join(',');
    urlTemplate = this.config.host + this.config.searchWithFilters;
  }

  url = utils.parseTokens(urlTemplate, tokens);

  request = new Request({
    url: url,
    token: this._tokenSource(),
    headers: headers
  });

  return request.send();
};

module.exports = Inputs;
