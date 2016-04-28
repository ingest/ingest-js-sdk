'use strict';

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

    it('Should return true when sessionStorage is available.', function () {
      expect(cache._checkCacheSupport()).toEqual(true);
    });

    it('Should return false when sessionStorage is not available.', function () {

      spyOn(sessionStorage, 'setItem').and.callFake(function () {
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

      sessionStorage.setItem('test-item', JSON.stringify(testItem));

      result = cache.retrieve('test-item');

      expect(result).toEqual(testItem.value);

    });

    it('Should return null if the cache result is expired.', function () {
      var result;

      var testItem = {
        expiry: Date.now() - 10000,
        value: 'test-data'
      };

      sessionStorage.setItem('test-item', JSON.stringify(testItem));

      result = cache.retrieve('test-item');

      expect(result).toEqual(null);
    });

    it('Should fail silently.', function () {

      spyOn(sessionStorage, 'getItem').and.throwError('error');

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
      sessionStorage.setItem('test-item', JSON.stringify(testItem));

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

      spyOn(sessionStorage, 'removeItem').and.throwError('error');

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

      spyOn(sessionStorage, 'setItem').and.throwError('error');

      expect(cache.save.bind(this, 'test-item', 'test')).not.toThrow();

    });

  });

  describe('diff', function () {

    it('Should return the provided object if a cached value is not found.', function () {

      var test = {
        'id': '12345'
      };

      var diff = cache.diff('test-id', test);

      expect(diff).toEqual(diff);

    });

    it('Should return null if the two objects match.', function () {

      var test = {
        'id': '12345'
      };

      spyOn(cache, 'retrieve').and.returnValue(test);

      var diff = cache.diff.call(cache, 'test-id', test);

      expect(diff).toEqual(null);

    });

    it('Should return an object containing the changed values.', function () {

      var test = {
        'name': 'TestName',
        'title': 'TestTitle',
        'weight': '1'
      };

      spyOn(cache, 'retrieve').and.returnValue(test);

      var diff = cache.diff.call(cache, 'test-id', {
        'name': 'NewTestName',
        'weight': '1',
        'title': 'NewTitle',
        'newProperty': 'property'
      });

      expect(diff).toEqual({
        'name': 'NewTestName',
        'title': 'NewTitle',
        'newProperty': 'property'
      });

    });

    it('Should return an object containing atleast the forced properties.', function () {

      var test = {
        'name': 'TestName',
        'title': 'TestTitle',
        'weight': '1'
      };

      spyOn(cache, 'retrieve').and.returnValue(test);

      var diff = cache.diff.call(cache, 'test-id', {
        'name': 'TestName',
        'weight': '1',
        'title': 'NewTitle',
        'newProperty': 'property'
      }, ['name']);

      expect(diff).toEqual({
        'name': 'TestName',
        'title': 'NewTitle',
        'newProperty': 'property'
      });

    });

  });

  describe('diffArray', function () {

    it('Should return the provided objects if cached values are not found.', function() {

      var test = [
        {'id': 1},
        {'id': 2}
      ];

      var diff = cache.diffArray('id', test);

      expect(diff).toEqual(test);

    });

    it('Should only return objects that have changes.', function () {

      var test = [
        {'id': 1, 'value': 'new value'},
        {'id': 2, 'value': 'test2'}
      ];

      // Mock the retrieve and return a different cached value for the first test object.
      spyOn(cache, 'retrieve').and.callFake(function (key) {
        if (key === 1) {
          return {
            'id': 1,
            'value': 'test'
          };
        }

        return test[key - 1];
      });

      var diff = cache.diffArray('id', test);

      expect(diff).toEqual([{'value': 'new value'}]);

    });

  });

});
