'use strict';

var IngestSDK = require('../src/index');
var Promise = require('pinkyswear');

var api, utils, promises;

function testPromise () {
  return utils.promisify(true, 'Test Promise Resolve.');
}

function promiseError () {
  return utils.promisify(false, 'Error');
}

describe('Utils:Series', function () {

  beforeEach(function () {
    api = new IngestSDK();

    utils = api.utils;

    promises = [
      testPromise,
      testPromise,
      testPromise
    ];
  });

  it('Should return a new promise.', function (done) {

    spyOn(utils, '_seriesCallPromise').and.callThrough();
    spyOn(utils, '_seriesComplete').and.callThrough();

    var series = utils.series(promises);

    series.then(function () {
      expect(utils._seriesCallPromise).toHaveBeenCalled();
      expect(utils._seriesComplete).toHaveBeenCalled();

      done();
    }, function (error) {
      expect(error).not.toBeDefined();
      done();
    });

  });

  it('Should pause the series on creation.', function () {

    spyOn(utils, '_seriesCallPromise').and.callThrough();

    var series = utils.series(promises, true);

    expect(utils._seriesCallPromise).not.toHaveBeenCalled();

  });

  it('Should not execute a promise if the series is paused.', function () {

    spyOn(utils, '_seriesComplete').and.callThrough();

    var series = utils.series(promises, true);
    var state = {
      paused: true
    };

    utils._seriesCallPromise(promises[0], state, series);

    expect(utils._seriesComplete).not.toHaveBeenCalled();

  });

  it('Should not execute the next promise if the series is paused.', function () {

    spyOn(utils, '_seriesCallPromise').and.callThrough();

    var series = utils.series(promises, true);
    var state = {
      paused: true,
      complete: 0,
      total: 10,
      responses: []
    };

    utils._seriesComplete(series, state, 'test');

    expect(utils._seriesCallPromise).not.toHaveBeenCalled();

  });

  it('Should resolve the all promise with an error if a single promise fails.', function (done) {

    spyOn(utils, '_seriesError').and.callThrough();

    var newList = promises.slice(0);
    newList.push(promiseError);

    utils.series(newList).then(function (response) {

      expect(response).not.toBeDefined();
      done();

    }, function (error) {

      expect(error).toBeDefined();
      expect(utils._seriesError).toHaveBeenCalled();
      done();

    });

  });

  it('Should set paused to true.', function () {

    var state = {
      paused: false
    };

    utils._seriesPause(null, state);

    expect(state.paused).toEqual(true);

  });

  it('Should set paused to false.', function () {

    spyOn(utils, '_seriesCallPromise').and.callThrough();

    var state = {
      paused: true
    };

    utils._seriesResume(null, state);

    expect(state.paused).toEqual(false);

  });

  it('Should resume the series.', function () {

    spyOn(utils, '_seriesCallPromise').and.returnValue(null);

    var state = {
      paused: true,
      completed: 1,
      total: 10,
      promises: [
        0,1,2,3,4,5,6,7,8,9
      ]
    };

    utils._seriesResume(null, state);

    expect(state.paused).toEqual(false);
    expect(utils._seriesCallPromise).toHaveBeenCalled();

  });

  it('Should cancel the series.', function () {

    var state = {
      canceled: false
    };

    utils._seriesCancel(function () {}, state);

    expect(state.canceled).toEqual(true);

  });

  it('Should exit early if the series is canceled.', function () {

    var state = {
      complete: 0,
      canceled: true
    };

    utils._seriesComplete(null, state);

    expect(state.complete).toEqual(0);

  });

});
