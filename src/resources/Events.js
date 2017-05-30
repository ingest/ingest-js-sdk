'use strict';

var Resource = require('./Resource');
var Request = require('../Request');
var utils = require('../Utils');

function Events (options) {
  Resource.call(this, options);
};

// This extends the base class of 'Resource'.
Events.prototype = Object.create(Resource.prototype);
Events.prototype.constructor = Events;

/**
 * Returns a list of the requested events for the current network
 *
 * @param {object} headers      - The heades to apply to the request
 * @param {string} filterStatus - A string of all the statuses to filter by, separated by commas
 * @param {string} filterType   - A string of all the types to filter by, separated by commas
 *
 * @return {Promise}
 */
Events.prototype.getAll = function (headers, filterStatus, filterType) {
  var request, url, filterString;

  filterString = '';

  url = utils.parseTokens(this.config.host + this.config.all, {
    resource: this.config.resource
  });

  // If there is a status filter
  if (filterStatus) {
    if (typeof filterStatus !== 'string') {
      return utils.promisify(false,
        'IngestAPI Events.getAll requires a valid filter status to be passed as a string.');
    }

    filterString = '?filter=' + filterStatus;
  }

  if (filterType) {
    if (typeof filterType !== 'string') {
      return utils.promisify(false,
        'IngestAPI Events.getAll requires a valid filter type to be passed as a string.');
    }

    if (!filterString) {
      filterString = '?resource=' + filterType;
    } else {
      filterString = filterString + '&resource=' + filterType;
    }
  }

  url = url + filterString;

  request = new Request({
    url: url,
    token: this._tokenSource(),
    headers: headers
  });

  return request.send();
};

module.exports = Events;
