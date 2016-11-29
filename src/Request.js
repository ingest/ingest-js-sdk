'use strict';

var Promise = require('pinkyswear');
var extend = require('extend');

var JWTUtils = require('./JWTUtils');
var RequestManager = require('./RequestManager');

var VALID_RESPONSE_CODES = [200, 201, 202, 204];

/**
 * A wrapper around the XMLHttpRequest object.
 * @param {object}  options         Options for the request.
 * @param {boolean} options.async   Whether to perform the request asynchronously
 * @param {string}  options.method  REST verb to use for the request.
 * @param {string}  options.url     URL for the request.
 */
var Request = function (options) {

  this.defaults = {
    async: true,
    method: 'GET',
    ignoreAcceptHeader: false
  };

  // Create the XHR object for this request.
  this.request = new XMLHttpRequest();

  // Set up event listeners for this request.
  this.setupListeners();

  // Todo, merge some defaults with this.
  this.options = extend(true, this.defaults, options);

};

/**
 * Send the request and return a promise to resolve when the request is complete.
 * @return {Promise} A promise which resolves when the request is complete.
 */
Request.prototype.send = function () {
  this.promise = Promise();

  // Make sure a url is passed before attempting to make the request.
  if (this.options.url) {
    // Add the request to the queue and send it
    this.makeRequest();
  } else {
    this.requestError('Request Error : a url is required to make the request.');
  }

  // Return the promise. Once complete send of the next request if necessary
  return this.promise
    .then(RequestManager._sendNextRequest);
};

/**
 * Add event listeners to the XMLHttpRequest object.
 */
Request.prototype.setupListeners = function () {
  this.request.onreadystatechange = this.readyStateChange.bind(this);
};

/**
 * Execute the open and construction of the XMLHttpRequest and its data
 */
Request.prototype.makeRequest = function () {
  var postData = this.preparePostData(this.options.data);
  var headers = this.options.headers;
  var hasContentType = headers && headers.hasOwnProperty('Content-Type');

  if (!postData.success) {
    this.requestError('Request Error : error preparing post data.');
    return;
  }

  this.request.open(this.options.method, this.options.url, this.options.async);

  // Set before we apply the headers so it can be overridden on a per request basis.
  if (!this.options.ignoreAcceptHeader) {
    this.request.setRequestHeader('Accept', 'application/vnd.ingest.v1+json');
  }

  if (headers) {
    this.applyRequestHeaders(headers);
  }

  // Make the token optional.
  if (this.options.token) {

    // If there is a token present ensure that it's still valid.
    if (JWTUtils.isExpired(this.options.token)) {
      this.requestError('Request Error : token is expired.');
      return;
    }

    this.request.setRequestHeader('Authorization', this.options.token);

  }

  // Set the default content type when posting data.
  if (postData.data && postData.type === 'JSON' && !hasContentType) {
    this.request.setRequestHeader('Content-Type', 'application/vnd.ingest.v1+json');
  }

  // If everything is good lets add it to the queue
  RequestManager.addRequest([this.request, postData.data]);
};

/**
 * Stringify the post data if it is present.
 * @param  {object} data Object to be parsed.
 * @return {object}      Result object with the parsed string, and a success boolean flag.
 */
Request.prototype.preparePostData = function (data) {

  var result = {
    success: true,
    data: data,
    type: 'JSON'
  };

  // In the case of file uploads, all FormData to be passed to the request.
  if (data instanceof FormData) {
    result.type = 'FormData';
    return result;
  }

  if (data instanceof Blob) {
    result.type = 'File';
    return result;
  }

  // If the data is populated, and its not already a string parse it.
  if (data) {
    try {
      result.data = JSON.stringify(data);
    } catch (error) {
      result.success = false;
      result.data = null;
    }
  }

  return result;
};

/**
 * Apply any supplied headers to the request object.
 * @param  {object} headers Array of headers to apply to the request object.
 */
Request.prototype.applyRequestHeaders = function (headers) {

  var key, i;
  var keys = Object.keys(headers);
  var keysLength = keys.length;

  // Loop through and add the keys to the requestHeaders.
  for (i = 0; i < keysLength; i++) {
    key = keys[i];
    this.request.setRequestHeader(key, headers[key]);
  }

};

/**
 * Handle the completion of the request and fulfill the promise.
 * @param  {String} Response test of the request.
 */
Request.prototype.requestComplete = function (response) {

  // Process the result.
  this.response = this.processResponse(response);

  // Either resolve or reject the promise.
  this.promise(!this.response.data.error, [this.response]);

};

/**
 * Process the response and parse certain content types.
 * @param  {*}  response  Response data from request.
 * @return {*}            Processed response data.
 */
Request.prototype.processResponse = function (response) {
  var responseType = this.request.getResponseHeader('Content-Type');
  var result = response;

  var hasLength = parseInt(this.request.getResponseHeader('Content-Length'), 10);
  hasLength = hasLength > 0;

  // Parse JSON if the result is JSON.
  if (hasLength && responseType && responseType.indexOf('json') !== -1) {
    try {
      result = JSON.parse(response);
    } catch (error) {
      result = {
        error: 'JSON parsing failed. ' + error.stack
      };
    }
  }

  return {
    data: result,
    headers: this.request.getResponseHeader.bind(this.request),
    statusCode: this.request.status
  };

};

/**
 * Resolve the promise.
 * @param  {String} message   Error message.
 */
Request.prototype.requestError = function (message) {
  // Reject the promise.
  this.promise(false, [{
    message: message,
    headers: this.request.getAllResponseHeaders(),
    statusCode: this.request.status
  }]);
};

/**
 * Handle ready state change events.
 */
Request.prototype.readyStateChange = function () {
  switch (this.request.readyState) {
  case 4:
    // Check if the final response code is valid
    if (this.isValidResponseCode(this.request.status)) {
      return this.requestComplete(this.request.responseText);
    } else if (this.request.getResponseHeader('Content-Length') === '0') {
      return this.requestError('Invalid response code');
    }

    // Special case error handling with response body
    var resp = this.processResponse(this.request.response);
    this.requestError(resp.data.error);
    break;
  default:
    // silence is golden
  }
};

/**
 * Validate the current response code to see if the request was a success.
 * @param  {Number}  responseCode Response Code.
 * @return {Boolean}              Should this be treated as a successful response code.
 */
Request.prototype.isValidResponseCode = function (responseCode) {

  var result = false,
    responseCodeCount = VALID_RESPONSE_CODES.length,
    i;

  // Check if the supplied code is in our list of valid codes.
  for (i = 0; i < responseCodeCount; i++) {

    if (responseCode === VALID_RESPONSE_CODES[i]) {
      result = true;
      break;
    }

  }

  return result;

};

/**
 * Cancel the current XHR request.
 */
Request.prototype.cancel = function () {
  // Remove the event listener.
  this.request.onreadystatechange = null;
  this.request.abort();
  this.requestError('Request has been canceled.');
};

module.exports = Request;
