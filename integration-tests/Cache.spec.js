var utils;
var Request;

var api, cache;

// Token will need to be re-generated every 24 hours.
var access_token = 'Bearer ' + window.token;

describe('Ingest API : Cache', function () {

  // Reset the auth token.
  beforeEach(function () {
    api = new IngestAPI({
      host: 'http://weasley.teamspace.ad:3000',
      token: access_token
    });

    cache = api.cache;
  });

  it('Should expose the required functions.', function () {

    var required = [
      'retrieve',
      'remove',
      'save'
    ];

    var requiredLength = required.length;
    var i, func;

    for (i = 0; i < requiredLength; i++) {
      expect(cache[required[i]]).toBeDefined();
    }

  });

  describe('_checkCacheSupport', function () {

    it('Should return true when localStorage is available.', function () {
      expect(cache._checkCacheSupport()).toEqual(true);
    });

    it('Should return false when localStorage is not available.', function () {

      spyOn(localStorage, 'setItem').and.callFake(function () {
        throw new Error('Unsupported');
      });

      expect(cache._checkCacheSupport()).toEqual(false);

    });
  });

  describe('retrieve', function () {

    it('Should return a cached result.', function () {

      var result;

      var testItem = {
        expiry: Date.now() + 10000,
        value: 'test-data'
      };

      localStorage.setItem('test-item', JSON.stringify(testItem));

      result = cache.retrieve('test-item');

      expect(result).toEqual(testItem.value);

    });

    it('Should return null if the cache result is expired.', function () {
      var result;

      var testItem = {
        expiry: Date.now() - 10000,
        value: 'test-data'
      };

      localStorage.setItem('test-item', JSON.stringify(testItem));

      result = cache.retrieve('test-item');

      expect(result).toEqual(null);
    });

    it('Should fail silently.', function () {

      spyOn(localStorage, 'getItem').and.throwError('error');

      expect(cache.retrieve.bind(this, 'test-item')).not.toThrow();

    });
  });

  describe('remove', function () {
    it('Should remove the item from cache.', function () {
      var result;

      var testItem = {
        expiry: Date.now() + 10000,
        value: 'test-data'
      };

      // Store it.
      localStorage.setItem('test-item', JSON.stringify(testItem));

      // Retrieve it.
      result = cache.retrieve('test-item');

      // Make sure it has a value.
      expect(result).not.toEqual(null);

      // Remove it.
      cache.remove('test-item');

      // Retrieve it again.
      result = cache.retrieve('test-item');

      expect(result).toEqual(null);
    });

    it('Should fail silently.', function () {

      spyOn(localStorage, 'removeItem').and.throwError('error');

      expect(cache.remove.bind(this, 'test-item')).not.toThrow();

    });
  });

  describe('save', function () {

    it('Should save the new cache value.', function () {
      var result;

      cache.save('test-item', 'test-data');

      result = cache.retrieve('test-item');

      expect(result).toEqual('test-data');
    });

    it('Should fail silently.', function () {

      spyOn(localStorage, 'setItem').and.throwError('error');

      expect(cache.save.bind(this, 'test-item', 'test')).not.toThrow();

    });

  });

});
