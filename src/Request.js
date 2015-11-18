var Promise = require('pinkyswear');
var extend = require('extend');

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
    method: 'GET'
  };

  this.promise = Promise();

  // Create the XHR object for this request.
  this.request = new XMLHttpRequest();

  // Set up event listeners for this request.
  this.setupListeners();

  // Todo, merge some defaults with this.
  this.options = extend(true, this.defaults, options);

  // Make sure a url is passed before attempting to make the request.
  if (!this.options.url) {
    this.promise(false, ['Request Error : a url is required to make the request.']);
    return this.promise;
  }

  // Make the actual request.
  this.makeRequest();

  // Return a promise
  return this.promise;

};

/**
 * Add event listeners to the XMLHttpRequest object.
 */
Request.prototype.setupListeners = function () {
  this.request.onreadystatechange = this.readyStateChange.bind(this);
};

/**
 * Execute the open and send of the XMLHttpRequest
 */
Request.prototype.makeRequest = function () {

  this.request.open(this.options.method, this.options.url, this.options.async);

  if (this.options.headers) {
    this.applyRequestHeaders(this.options.headers);
  }

  // Make the token optional.
  if (this.options.token) {
    this.request.setRequestHeader('Authorization', this.options.token);
  }

  // If there is data then we need to pass that along with the request.
  if (this.options.data) {
    this.request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    this.request.send(this.options.data);
  } else {
    this.request.send();
  }

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

  // Parse JSON if the result is JSON.
  if (responseType && responseType.indexOf('application/json') !== -1) {
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
 * @param  {String} error   Error message.
 */
Request.prototype.requestError = function (error) {
  this.promise(false, [error]);
};

/**
 * Handle ready state change events.
 */
Request.prototype.readyStateChange = function () {

  // Request is complete.
  if (this.request.readyState === 4) {

    // Check if the final response code is valid.
    if (this.isValidResponseCode(this.request.status)) {
      this.requestComplete(this.request.responseText);
    } else {
      this.requestError('Invalid response code.');
    }

  }

};

/**
 * Validate the current response code to see if the request was a success.
 * @param  {String}  responseCode Response Code.
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

module.exports = Request;
