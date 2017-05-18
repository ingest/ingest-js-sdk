'use strict';

var Resource = require('./Resource');
var Request = require('../Request');
var utils = require('../Utils');
var extend = require('extend');

function Events (options) {

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

/**
 * Return a subset of items that match the filter terms.
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
