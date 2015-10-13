var IngestAPI = require('./IngestAPI.js');

describe('IngestAPI Wrapper', function () {

  it('Should expose the required functions.', function () {

    var required = ['setToken', 'getToken', 'getVideos', 'getVideoById', 'addVideo'];
    var requiredLength = required.length;
    var i, func;

    for (i = 0; i < requiredLength; i++) {
      func = required[i];
      expect(IngestAPI.prototype[func]).toBeDefined();
    }

  });

});
