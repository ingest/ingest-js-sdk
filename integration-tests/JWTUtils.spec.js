// Token will need to be re-generated every 24 hours.
var valid_token = 'Bearer ' + window.token;

var invalid_token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOiIxNDUwMzY2NzkxIiwic3ViIjoiMTIzNDU2Nzg5MCIsIm5hbWUiOiJKb2huIERvZSIsImFkbWluIjp0cnVlfQ.MGdv4o_sNc84OsRlsitw6D933A3zBqEEacEdp30IQeg';  //eslint-disable-line

var JWTUtils = require('../src/JWTUtils');

describe('JWTUtils', function () {

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

  });

});
