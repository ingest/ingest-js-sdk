'use strict';

var Resource = require('./Resource');
var Request = require('../Request');
var utils = require('../Utils');
var extend = require('extend');

function Events (options) {

  var overrides = {
    //?/events?filter=new,error,important,notifications&resource=videos,playlists,users,inputs,jobs
    byType: '/<%=resource%>?filter=<%=input%>',
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
 * @param  {object}   headers   The headers to be passed to the request.
 * @return {Promise}          A promise which resolves when the request is complete.
 */
Event.prototype.filter = function (input, headers) {
  var url, request;

  if (typeof input !== 'string') {
    return utils.promisify(false,
      'IngestAPI Event filtering requires input to be passed as a string.');
  }

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

module.exports = Events;
