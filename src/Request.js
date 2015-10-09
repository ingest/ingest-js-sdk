var Promise = require('bluebird');
var VALID_RESPONSE_CODES = [200, 301, 302];

/**
 * A wrapper around the XMLHttpRequest object.
 * @param {object} options Overrides for the default options.
 */
var Request = function (options) {

  this.resolver = Promise.pending();

  // Create the XHR object for this request.
  this.request = new XMLHttpRequest();

  // Set up event listeners for this request.
  this.setupListeners();

  // Store the url to be used throughout the object.
  this.url = options.url;

  // Todo, merge some defaults with this.
  this.options = options;

  // Defaults
  this.options.async = true;
  this.options.method = 'GET';

  // Make the actual request.
  this.makeRequest();

  // Return a promise
  return this.resolver.promise;

};

/**
 * Add event listeners to the XMLHttpRequest object.
 */
Request.prototype.setupListeners = function () {
  this.request.addEventListener('readystatechange', this.readyStateChange.bind(this));
};

/**
 * Execute the open and send of the XMLHttpRequest
 */
Request.prototype.makeRequest = function () {

  this.request.open(this.options.method, this.url, this.options.async);

  // Make the token optional.
  if (this.options.token) {
    this.request.setRequestHeader('Authorization', this.options.token);
  }

  this.request.send();

};

/**
 * Handle the completion of the request and fulfill the promise.
 * @param  {String} Response test of the request.
 */
Request.prototype.requestComplete = function (response) {
  var result = 'reject';

  // Parse the response as JSON.
  this.response = JSON.parse(response);

  // Resolve the promise.
  // This is a second check to validate the content, There could be a 200 response
  // with an error message in the supplied response.
  if (this.response.error) {
    result = 'reject';
  } else {
    result = 'resolve';
  }

  this.resolver[result](this.response);

};

/**
 * Resolve the promise.
 * @param  {String} error   Error message.
 */
Request.prototype.requestError = function (error) {
  this.resolver.reject(error);
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
