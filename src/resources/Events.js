'use strict';

var Resource = require('./Resource');
var Request = require('../Request');
var utils = require('../Utils');
var extend = require('extend');

function Events (options) {

  Resource.call(this, options);

};

// This extends the base class of 'Resource'.
Events.prototype = Object.create(Resource.prototype);
Events.prototype.constructor = Events;

Events.prototype.getAll = function (headers, filterStatus, filterType) {
  var request;
  var url = utils.parseTokens(this.config.host + this.config.all, {
    resource: this.config.resource
  });

  // If there is a status filter
  if (filterStatus) {
    if (typeof filterStatus !== 'string') {
      return utils.promisify(false,
        'IngestAPI Events.getAll requires a valid filter to be passed as a string.');
    }

    url = url + '?filter=' + filterStatus;

    if (filterType) {
      if (typeof filterType !== 'string') {
        return utils.promisify(false,
          'IngestAPI Events.getAll requires a valid filter to be passed as a string.');
      }

      url = url + '&resource=' + filterType;
    }
  // If there is a type filter
  } else if (filterType) {
    if (typeof filterType !== 'string') {
      return utils.promisify(false,
        'IngestAPI Events.getAll requires a valid filter to be passed as a string.');
    }

    url = url + '?resource=' + filterType;
  }

  request = new Request({
    url: url,
    token: this._tokenSource(),
    headers: headers
  });

  return request.send();
};

module.exports = Events;
