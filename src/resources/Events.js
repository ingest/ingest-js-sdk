'use strict';

var Resource = require('./Resource');
var Request = require('../Request');
var utils = require('../Utils');
var extend = require('extend');

function Events () {

  Resource.call(this, options);

};

// This extends the base class of 'Resource'.
Events.prototype = Object.create(Resource.prototype);
Events.prototype.constructor = Events;

module.exports = Events;
