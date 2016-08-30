'use strict';

var access_token = 'Bearer ' + window.token;

var api = new IngestAPI({
  host: 'http://weasley.teamspace.ad:8080',
  token: access_token
});

var mock = require('xhr-mock');
var billingResource;

describe('Ingest API : Resource : Billing', function () {

  beforeEach(function () {

    billingResource = new api.billingResource({
      host: api.config.host,
      resource: 'billing',
      tokenSource: api.getToken.bind(api)
    });

  });

  describe('createCustomer', function () {

    it('Should fail if the given parameters are not the correct types.', function (done) {

      var networkId = null;   // Not a string.
      var stripeToken = null; // Not a string.

      billingResource.createCustomer(stripeToken, networkId).then(function (response) {

        expect(response).not.toBeDefined();
        done();

      }, function (error) {

        expect(error).toBeDefined();
        expect(error).toMatch(/createCustomer requires stripeToken and networkId to be strings/);
        done();

      });

    });

    it('Should successfully create a Stripe customer for the given network.', function (done) {

      var requestData = {
        "networkId": "fed6e925-dee4-41cc-be4a-479cabc149a5",
        "stripeToken": "tok_notarealtoken"
      };

      var responseData = {
        "networkID": "fed6e925-dee4-41cc-be4a-479cabc149a5",
        "networkName": "Redspace",
        "stripeCustomerID": "cus_abcdefghijklmnopqrstuvwxyz"
      };

      var request;

      // Mock the XHR object.
      mock.setup();

      // Mock the response from the REST API.
      mock.mock('POST', api.config.host + '/billing/customers', function (request, response) {
        // Restore the XHR object.
        mock.teardown();

        return response.status(204)
          .header('Content-Type', 'application/json')
          .body(JSON.stringify(responseData));
      });

      request = billingResource.createCustomer(requestData.stripeToken, requestData.networkId)
        .then(function (response) {

          expect(response).toBeDefined();
          expect(response.data).toBeDefined();
          expect(typeof response.headers).toBe('function');
          expect(response.statusCode).toEqual(204);

          done();

        }, function (error) {

          expect(error).not.toBeDefined();
          done();

        });

      // Ensure a promise was returned.
      expect(request.then).toBeDefined();

    });

  });

});
