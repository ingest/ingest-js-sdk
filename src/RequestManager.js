'use strict';

/**
 * Manages request objects in a queueing system
 */
function RequestManager () {
  this.pending = [];
  this.activeRequests = 0;
  this.currentSetRequests = 0;
  this.lastRequestSetStart = null;
  this.resetTimer = null;

  this._sendNextRequest = this.sendNextRequest.bind(this);
  this._resetCurrentSet = this.resetCurrentSet.bind(this);
};

/**
 * Sets the max requests for the Request Manager
 *
 * @param {number} maxRequests - The maximum allowed requests at one time
 */
RequestManager.prototype.setMaxRequests = function (maxRequests) {
  this.maxRequests = maxRequests;
};

/**
 * Resets the current set and sets the last request start to the passed in value
 *
 * @param {any} newDate - The new date timestamp or null
 */
RequestManager.prototype.resetCurrentSet = function (newDate) {
  this.currentSetRequests = 0;
  this.lastRequestSetStart = newDate;
};

/**
 * Sends a request or adds it to the queue if it can't be sent
 *
 * @param {array} requestData - The request object and request data in an array
 *
 * @return
 */
RequestManager.prototype.addRequest = function (requestData) {
  // If we have too many out then queue the request
  if (this.activeRequests >= this.maxRequests) {
    this.pending.push(requestData);
    return;
  }

  // Otherwise send the request
  this.sendRequest(requestData[0], requestData[1]);
};

/**
 * Sends the request
 *
 * @param {object} request - The request object
 * @param {object} data    - The request data
 */
RequestManager.prototype.sendRequest = function (request, data) {

  // If there is a reset timer, we need to clear it so its not run
  if (this.resetTimer) {
    clearTimeout(this.resetTimer);
  }

  // If this request is the start of a set, lets reset the set data
  if (this.currentSetRequests % this.maxRequests === 0) {
    this.resetCurrentSet(Date.now());
  }

  // Increment counters
  this.activeRequests++;
  this.currentSetRequests++;

  // Send data
  if (data) {
    request.send(data);
  } else {
    request.send();
  }
};

/**
 * Sends the next available request if applicable
 *
 * @param {object}  response - The http response data
 *
 * @return {object} response - The http response data
 */
RequestManager.prototype.sendNextRequest = function (response) {
  var XRatelimitRemaining, moreRequests, requestData, delay;

  // Deincrement counter
  this.activeRequests--;

  // No more to send, reset data if enough time passes
  if (this.pending.length === 0) {

    // If i don't have a timer already and have no active requests
    if (!this.resetTimer && this.activeRequests === 0) {
      // Set the reset timer so new calls are in sync
      this.resetTimer = setTimeout(this._resetCurrentSet, this.XRatelimitLimit * 1000);
    }

    // Return response
    return response;
  }

  // Only run the first time to get the limits
  if (!this.XRatelimitReset) {
    // Set the reset and the limit
    this.XRatelimitReset = response.headers('X-Ratelimit-Reset');
    this.XRatelimitLimit = response.headers('X-Ratelimit-Limit');

    // If the limit returned from the server is less than the set max limit, lets override it
    if (this.XRatelimitLimit < this.maxRequests) {
      this.maxRequests = this.XRatelimitLimit;
    }
  }

  // Get my next request and requests remaining
  requestData = this.pending.shift();
  XRatelimitRemaining = response.headers('X-Ratelimit-Remaining');

  // See if I can send more requests right now
  moreRequests = (this.activeRequests < this.maxRequests) && (XRatelimitRemaining > 0);

  // If I can send more requests send them
  if (moreRequests) {
    this.sendRequest(requestData[0], requestData[1]);
  } else {
    // Otherwise lets delay so these get sent in the next tick
    delay = (Date.now() - this.lastRequestSetStart) < 100 ? 100 : (Date.now() - this.lastRequestSetStart);

    // Delay the call of the next send request
    setTimeout(this.sendRequest.bind(this, requestData[0], requestData[1]), delay);
  }

  // Return the response
  return response;
};

module.exports = new RequestManager();
