var Request = require('./Request.js');

// TODO, determine how this can be unit tested vs integration tested.
describe('Request.', function () {

  it('Should Exist.', function () {

    expect(Request).toBeDefined();

  });

  it('Should have the required functions.', function () {
    var required = [
      'setupListeners',
      'makeRequest',
      'requestComplete',
      'requestError'
    ];

    var requiredLength = required.length;
    var i, func;

    for (i = 0; i < requiredLength; i++) {
      func = required[i];
      expect(Request.prototype[func]).toBeDefined();
    }

  });

  describe('Request : isValidResponseCode', function () {

    it('Should return true for 200', function () {

      var result = Request.prototype.isValidResponseCode(200);

      expect(result).toEqual(true);

    });

    it ('Should return false for 502', function () {

      var result = Request.prototype.isValidResponseCode(502);

      expect(result).toEqual(false);

    });

  });

});
