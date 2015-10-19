var IngestAPI = require('./IngestAPI.js');
var MockAPI = {};

describe('IngestAPI Wrapper', function () {

  it('Should expose the required functions.', function () {

    var required = [
      'setToken',
      'getToken',
      'getVideos',
      'getVideoById',
      'addVideo',
      'deleteVideo',
      'parseId'
    ];

    var requiredLength = required.length;
    var i, func;

    for (i = 0; i < requiredLength; i++) {
      func = required[i];
      expect(IngestAPI.prototype[func]).toBeDefined();
    }

  });

  it('Should parse the id out of a template string', function () {

    var result = IngestAPI.prototype.parseId.call(this, '<%=id%>', 'testid');

    expect(result).toEqual('testid');

  });

  it('Should set the auth token.', function () {

    IngestAPI.prototype.setToken.call(MockAPI, 'test-token');

    expect(MockAPI.token).toBeDefined();
    expect(MockAPI.token).toEqual('test-token');

  });

  it('Should return the token.', function () {

    var token = IngestAPI.prototype.getToken.call(MockAPI);

    expect(token).toBeDefined();
    expect(token).toEqual('test-token');

  });

});
