'use strict';

var IngestSDK = require('../src/index');
var JWTUtils;

// This valid tokens expiry is in the year 2999
var valid_token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOiIzMjUwMzU5MzYwMCIsInN1YiI6IjEyMzQ1Njc4OTAiLCJuYW1lIjoiSm9obiBEb2UiLCJhZG1pbiI6dHJ1ZX0.SRJ8AvhOJyJPfcl5Aqf8-ZiKVoDy72h0RwJQJzx28nI'; // eslint-disable-line
var invalid_token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOiIxNDUwMzY2NzkxIiwic3ViIjoiMTIzNDU2Nzg5MCIsIm5hbWUiOiJKb2huIERvZSIsImFkbWluIjp0cnVlfQ.MGdv4o_sNc84OsRlsitw6D933A3zBqEEacEdp30IQeg';  //eslint-disable-line
var malformed_token = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiSm9obiBEb2UifQ.xuEv8qrfXu424LZk8bVgr9MQJUIrp1rHcPyZw_KSsds' //eslint-disable-line

describe('Ingest API : JWTUtils', function () {

  // Reset the auth token.
  beforeEach(function () {
    var api = new IngestSDK();

    JWTUtils = api.JWTUtils;
  });

  it('Should expose utility functions.', function () {
    expect(JWTUtils).toBeDefined();

    var required = [
      'isExpired'
    ];

    var requiredLength = required.length;
    var i, func;

    for (i = 0; i < requiredLength; i++) {
      func = required[i];
      expect(JWTUtils[func]).toBeDefined();
    }
  });

  describe('isExpired', function () {

    it('Should return false if the token is still valid', function () {
      expect(JWTUtils.isExpired(valid_token)).toEqual(false);
    });

    it('Should return true if the token is expired.', function () {
      expect(JWTUtils.isExpired(invalid_token)).toEqual(true);
    });

    it('Should return true if the token does not have an exp.', function () {
      expect(JWTUtils.isExpired(malformed_token)).toEqual(true);
    });

  });

});
