'use strict';

var Resource = require('./Resource');
var Request = require('../Request');
var utils = require('../Utils');
var extend = require('extend');

function Events (options) {

//make only one override
  var overrides = {
    filter: '/<%=resource%>?filter=<%=input%>',
    filterByType: '/<%=resource%>?resource=<%=input%>'
  };

  options = extend(true, {}, overrides, options);

  Resource.call(this, options);

};

// This extends the base class of 'Resource'.
Events.prototype = Object.create(Resource.prototype);
Events.prototype.constructor = Events;

Events.prototype.getAll = function (headers, filter, resource) {
  var request;
  var url = utils.parseTokens(this.config.host + this.config.all, {
    resource: this.config.resource
  });

  // If there is a filter type
  if (filter) {
    if (typeof filter !== 'string') {
      return utils.promisify(false,
        'IngestAPI Events.getAll requires a valid filter to be passed as a string.');
    }

    url = url + '?filter=' + filter;
  }

  request = new Request({
    url: url,
    token: this._tokenSource(),
    headers: headers
  });

  return request.send();
};

/**
 * Return a subset of items that match the filter by status terms.
 * @param  {string}   input     The filter terms to match against.
 *
 * @return {Promise}          A promise which resolves when the request is complete.
 */
Events.prototype.filter = function (input, headers) {
  var url, request;

  url = utils.parseTokens(this.config.host + this.config.filter, {
    resource: this.config.resource,
    input: encodeURIComponent(input)
  });

  request = new Request({
    url: url,
    token: this._tokenSource(),
    headers: headers
  });

  return request.send();
};


/**
 * Return a subset of items that match the filter by type terms.
 * @param  {string}   input     The filter terms to match against.
 *
 * @return {Promise}          A promise which resolves when the request is complete.
 */
Events.prototype.filterByType = function (input, headers) {
  var url, request;

  url = utils.parseTokens(this.config.host + this.config.filterByType, {
    resource: this.config.resource,
    input: encodeURIComponent(input)
  });

  request = new Request({
    url: url,
    token: this._tokenSource(),
    headers: headers
  });

  return request.send();
};

module.exports = Events;
