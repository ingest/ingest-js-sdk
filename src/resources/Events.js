'use strict';

var Resource = require('./Resource');
var Request = require('../Request');
var utils = require('../Utils');
var extend = require('extend');

function Events (options) {

  var overrides = {
    filter: '/<%=resource%>?filter=<%=input%>'
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
Events.prototype.filter = function (input) {
  var url, request;

  url = utils.parseTokens(this.config.host + this.config.filter, {
    resource: this.config.resource,
    input: encodeURIComponent(input)
  });

  request = new Request({
    method: 'GET',
    url: url,
    token: this._tokenSource()
  });

  return request.send();
};

module.exports = Events;
