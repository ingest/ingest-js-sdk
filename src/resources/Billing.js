'use strict';

var Resource = require('./Resource');
var Request = require('../Request');
var utils = require('../Utils');
var extend = require('extend');

function Billing (options) {

  var overrides = {
    customers: '/<%=resource%>/customers'
  };

  options = extend(true, {}, overrides, options);

  // We only want the config, not the prototype.
  // This is because the billing resource does not share the same pattern as the other resources.
  Resource.call(this, options);
};

/**
 * Creates a Stripe customer for the given network ID.
 *
 * @param {string} stripeToken - The Stripe token to reference submitted payment details.
 * @param {string} networkId   - The network UUID for this Stripe customer.
 *
 * @return {Promise} A promise which resolves when the request is complete.
 */
Billing.prototype.createCustomer = function (stripeToken, networkId) {
  var url, request, data;

  if (typeof stripeToken !== 'string' || typeof networkId !== 'string') {
    return utils.promisify(false,
      'IngestAPI Billing createCustomer requires stripeToken and networkId to be strings.');
  }

  url = utils.parseTokens(this.config.host + this.config.customers, {
    resource: this.config.resource
  });

  data = {
    networkId: networkId,
    stripeToken: stripeToken
  };

  request = new Request({
    url: url,
    data: data,
    token: this.config.tokenSource(),
    method: 'POST'
  });

  return request.send();
};

module.exports = Billing;
