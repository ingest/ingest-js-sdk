(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["IngestAPI"] = factory();
	else
		root["IngestAPI"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var Request = __webpack_require__(2);
	var Promise = __webpack_require__(3);
	
	var RESTCONFIG = {
	  'host': 'http://weasley.teamspace.ad:8080',
	  'videos': '/videos',
	  'videoById': '/videos/<%=id%>'
	};
	
	function IngestAPI (options) {
	
	  if (options && options.token) {
	    // Store the token for future use.
	    this.setToken(options.token);
	  }
	
	}
	
	/**
	 * Set the auth token to use.
	 * @param   {String}        token Auth token to use.
	 */
	IngestAPI.prototype.setToken = function (token) {
	
	  // Make sure a valid value is passed.
	  if (!token || typeof token !== 'string') {
	    throw new Error('IngestAPI requires an authentication token passed as a string.');
	  }
	
	  this.token = token;
	};
	
	/**
	 * Return the current auth token.
	 * @return  {String}        Current auth token.
	 */
	IngestAPI.prototype.getToken = function () {
	
	  if (!this.token) {
	    throw new Error('IngestAPI requires a token to be set.');
	  }
	
	  return this.token;
	};
	
	/**
	 * Return a list of videos for the current user and network.
	 * @param {object} headers Javascript object representing headers to apply to the call.
	 * @return  {JSON}          A JSON object representing the videos.
	 */
	IngestAPI.prototype.getVideos = function (headers) {
	
	  return new Request({
	    url: RESTCONFIG.host + RESTCONFIG.videos,
	    token: this.getToken(),
	    headers: headers
	  });
	
	};
	
	/**
	 * Return a video match the supplied id.
	 * @param   {String}       videoId ID for the requested video.
	 * @return  {JSON}         JSON object representing the requested video.
	 */
	IngestAPI.prototype.getVideoById = function (videoId) {
	
	  if (!videoId || typeof videoId !== 'string') {
	    // Wrap the error in a promise so the user is still catching the errors.
	    return this.promisify(false,
	      'IngestAPI getVideoById requires a valid videoId as a string.');
	  }
	
	  return new Request({
	    url: this.parseId(RESTCONFIG.host + RESTCONFIG.videoById, videoId),
	    token: this.getToken()
	  });
	
	};
	
	/**
	 * Add a new video.
	 * @param   {object}  videoObject An object representing the video to add.
	 */
	IngestAPI.prototype.addVideo = function (videoObject) {
	
	  // Validate the object being passed in.
	  if (!videoObject || typeof videoObject !== 'object') {
	    // Wrap the error in a promise.
	    return this.promisify(false, 'IngestAPI addVideo requires a video object.');
	  }
	
	  // Parse the JSON
	  try {
	    videoObject = JSON.stringify(videoObject);
	  } catch (error) {
	    return this.promisify(false,
	      'IngestAPI addVideo failed to parse videoObject to JSON. ' + error.stack);
	  }
	
	  // Return the promise from the request.
	  return new Request({
	    url: RESTCONFIG.host + RESTCONFIG.videos,
	    token: this.getToken(),
	    method: 'POST',
	    data: videoObject
	  });
	
	};
	
	/**
	 * Delete a video.
	 * @param  {string}   videoId   ID for the video to delete.
	 */
	IngestAPI.prototype.deleteVideo = function (videoId) {
	  if (!videoId || typeof videoId !== 'string') {
	    return this.promisify(false,
	      'IngestAPI deleteVideo requires a video ID passed as a string.');
	  }
	
	  return new Request({
	    url: this.parseId(RESTCONFIG.host + RESTCONFIG.videoById, videoId),
	    token: this.getToken(),
	    method: 'DELETE'
	  });
	
	};
	
	/**
	 * Get the total count of videos.
	 * @return {number} The number of videos in the current network.
	 */
	IngestAPI.prototype.getVideosCount = function () {
	
	  return new Request({
	    url: RESTCONFIG.host + RESTCONFIG.videos,
	    token: this.getToken(),
	    method: 'HEAD'
	  }).then(this.getVideosCountResponse.bind(this));
	
	};
	
	/**
	 * Handle the response from the getVideosCount XHR request.
	 * @param  {object} response Request response object.
	 * @return {number}          The count of videos currently in the network.
	 */
	IngestAPI.prototype.getVideosCountResponse = function (response) {
	  return parseInt(response.headers('Resource-Count'), 10);
	};
	
	/**
	 * Replace the ID in the template string with the supplied id.
	 * @param  {string} template Template for the url.
	 * @param  {string} id       Video ID to inject into the template.
	 * @return {string}          Parsed string.
	 */
	IngestAPI.prototype.parseId = function (template, id) {
	  var result = template.replace('<%=id%>', id);
	
	  return result;
	};
	
	/**
	 * Wrapper function to wrap a value in either a reject or resolve.
	 * @param  {boolean} state Rejection or Approval.
	 * @param  {*} value Value to pass back to the promise.
	 * @return {Promise}       Promise/A+ spec promise.
	 */
	IngestAPI.prototype.promisify = function (state, value) {
	
	  var promise = Promise();
	
	  promise(state, [value]);
	
	  return promise;
	
	};
	
	module.exports = IngestAPI;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var Promise = __webpack_require__(3);
	var extend = __webpack_require__(7);
	
	var VALID_RESPONSE_CODES = [200, 201, 202, 204];
	
	/**
	 * A wrapper around the XMLHttpRequest object.
	 * @param {object}  options         Options for the request.
	 * @param {boolean} options.async   Whether to perform the request asynchronously
	 * @param {string}  options.method  REST verb to use for the request.
	 * @param {string}  options.url     URL for the request.
	 */
	var Request = function (options) {
	
	  this.defaults = {
	    async: true,
	    method: 'GET'
	  };
	
	  this.promise = Promise();
	
	  // Create the XHR object for this request.
	  this.request = new XMLHttpRequest();
	
	  // Set up event listeners for this request.
	  this.setupListeners();
	
	  // Todo, merge some defaults with this.
	  this.options = extend(true, this.defaults, options);
	
	  // Make sure a url is passed before attempting to make the request.
	  if (!this.options.url) {
	    return this.promise(false, ['Request Error : a url is required to make the request.']);
	  }
	
	  // Make the actual request.
	  this.makeRequest();
	
	  // Return a promise
	  return this.promise;
	
	};
	
	/**
	 * Add event listeners to the XMLHttpRequest object.
	 */
	Request.prototype.setupListeners = function () {
	  this.request.addEventListener('readystatechange', this.readyStateChange.bind(this));
	};
	
	/**
	 * Execute the open and send of the XMLHttpRequest
	 */
	Request.prototype.makeRequest = function () {
	
	  this.request.open(this.options.method, this.options.url, this.options.async);
	
	  if (this.options.headers) {
	    this.applyRequestHeaders(this.options.headers);
	  }
	
	  // Make the token optional.
	  if (this.options.token) {
	    this.request.setRequestHeader('Authorization', this.options.token);
	  }
	
	  // If there is data then we need to pass that along with the request.
	  if (this.options.data) {
	    this.request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
	    this.request.send(this.options.data);
	  } else {
	    this.request.send();
	  }
	
	};
	
	/**
	 * Apply any supplied headers to the request object.
	 * @param  {object} headers Array of headers to apply to the request object.
	 */
	Request.prototype.applyRequestHeaders = function (headers) {
	
	  // Loop through and add the keys to the requestHeaders.
	  for (key in headers) {
	    // Make sure the object has this key as a direct property.
	    if (headers.hasOwnProperty(key)) {
	      this.request.setRequestHeader(key, headers[key]);
	    }
	  }
	
	};
	
	/**
	 * Handle the completion of the request and fulfill the promise.
	 * @param  {String} Response test of the request.
	 */
	Request.prototype.requestComplete = function (response) {
	
	  // Process the result.
	  this.response = this.processResponse(response);
	
	  // Either resolve or reject the promise.
	  this.promise(!this.response.error, [this.response]);
	
	};
	
	/**
	 * Process the response and parse certain content types.
	 * @param  {*}  response  Response data from request.
	 * @return {*}            Processed response data.
	 */
	Request.prototype.processResponse = function (response) {
	  var responseType = this.request.getResponseHeader('Content-type');
	  var result = response;
	
	  // Parse JSON if the result is JSON.
	  if (responseType === 'application/json; charset=utf-8') {
	    try {
	      result = JSON.parse(response);
	    } catch (error) {
	      result = {
	        error: 'JSON parsing failed. ' + error.stack
	      };
	    }
	  }
	
	  return {
	    data: result,
	    headers: this.request.getResponseHeader.bind(this.request),
	    statusCode: this.request.status
	  };
	
	};
	
	/**
	 * Resolve the promise.
	 * @param  {String} error   Error message.
	 */
	Request.prototype.requestError = function (error) {
	  this.promise(false, [error]);
	};
	
	/**
	 * Handle ready state change events.
	 */
	Request.prototype.readyStateChange = function () {
	
	  // Request is complete.
	  if (this.request.readyState === 4) {
	
	    // Check if the final response code is valid.
	    if (this.isValidResponseCode(this.request.status)) {
	      this.requestComplete(this.request.responseText);
	    } else {
	      this.requestError('Invalid response code.');
	    }
	
	  }
	
	};
	
	/**
	 * Validate the current response code to see if the request was a success.
	 * @param  {String}  responseCode Response Code.
	 * @return {Boolean}              Should this be treated as a successful response code.
	 */
	Request.prototype.isValidResponseCode = function (responseCode) {
	
	  var result = false,
	    responseCodeCount = VALID_RESPONSE_CODES.length,
	    i;
	
	  // Check if the supplied code is in our list of valid codes.
	  for (i = 0; i < responseCodeCount; i++) {
	
	    if (responseCode === VALID_RESPONSE_CODES[i]) {
	      result = true;
	      break;
	    }
	
	  }
	
	  return result;
	
	};
	
	module.exports = Request;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(module, setImmediate, process) {/*
	 * PinkySwear.js 2.2.2 - Minimalistic implementation of the Promises/A+ spec
	 * 
	 * Public Domain. Use, modify and distribute it any way you like. No attribution required.
	 *
	 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
	 *
	 * PinkySwear is a very small implementation of the Promises/A+ specification. After compilation with the
	 * Google Closure Compiler and gzipping it weighs less than 500 bytes. It is based on the implementation for 
	 * Minified.js and should be perfect for embedding. 
	 *
	 *
	 * PinkySwear has just three functions.
	 *
	 * To create a new promise in pending state, call pinkySwear():
	 *         var promise = pinkySwear();
	 *
	 * The returned object has a Promises/A+ compatible then() implementation:
	 *          promise.then(function(value) { alert("Success!"); }, function(value) { alert("Failure!"); });
	 *
	 *
	 * The promise returned by pinkySwear() is a function. To fulfill the promise, call the function with true as first argument and
	 * an optional array of values to pass to the then() handler. By putting more than one value in the array, you can pass more than one
	 * value to the then() handlers. Here an example to fulfill a promsise, this time with only one argument: 
	 *         promise(true, [42]);
	 *
	 * When the promise has been rejected, call it with false. Again, there may be more than one argument for the then() handler:
	 *         promise(true, [6, 6, 6]);
	 *         
	 * You can obtain the promise's current state by calling the function without arguments. It will be true if fulfilled,
	 * false if rejected, and otherwise undefined.
	 * 		   var state = promise(); 
	 * 
	 * https://github.com/timjansen/PinkySwear.js
	 */
	(function(target) {
		var undef;
	
		function isFunction(f) {
			return typeof f == 'function';
		}
		function isObject(f) {
			return typeof f == 'object';
		}
		function defer(callback) {
			if (typeof setImmediate != 'undefined')
				setImmediate(callback);
			else if (typeof process != 'undefined' && process['nextTick'])
				process['nextTick'](callback);
			else
				setTimeout(callback, 0);
		}
	
		target[0][target[1]] = function pinkySwear(extend) {
			var state;           // undefined/null = pending, true = fulfilled, false = rejected
			var values = [];     // an array of values as arguments for the then() handlers
			var deferred = [];   // functions to call when set() is invoked
	
			var set = function(newState, newValues) {
				if (state == null && newState != null) {
					state = newState;
					values = newValues;
					if (deferred.length)
						defer(function() {
							for (var i = 0; i < deferred.length; i++)
								deferred[i]();
						});
				}
				return state;
			};
	
			set['then'] = function (onFulfilled, onRejected) {
				var promise2 = pinkySwear(extend);
				var callCallbacks = function() {
		    		try {
		    			var f = (state ? onFulfilled : onRejected);
		    			if (isFunction(f)) {
			   				function resolve(x) {
							    var then, cbCalled = 0;
			   					try {
					   				if (x && (isObject(x) || isFunction(x)) && isFunction(then = x['then'])) {
											if (x === promise2)
												throw new TypeError();
											then['call'](x,
												function() { if (!cbCalled++) resolve.apply(undef,arguments); } ,
												function(value){ if (!cbCalled++) promise2(false,[value]);});
					   				}
					   				else
					   					promise2(true, arguments);
			   					}
			   					catch(e) {
			   						if (!cbCalled++)
			   							promise2(false, [e]);
			   					}
			   				}
			   				resolve(f.apply(undef, values || []));
			   			}
			   			else
			   				promise2(state, values);
					}
					catch (e) {
						promise2(false, [e]);
					}
				};
				if (state != null)
					defer(callCallbacks);
				else
					deferred.push(callCallbacks);
				return promise2;
			};
	        if(extend){
	            set = extend(set);
	        }
			return set;
		};
	})( false ? [window, 'pinkySwear'] : [module, 'exports']);
	
	
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)(module), __webpack_require__(5).setImmediate, __webpack_require__(6)))

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = function(module) {
		if(!module.webpackPolyfill) {
			module.deprecate = function() {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	}


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(setImmediate, clearImmediate) {var nextTick = __webpack_require__(6).nextTick;
	var apply = Function.prototype.apply;
	var slice = Array.prototype.slice;
	var immediateIds = {};
	var nextImmediateId = 0;
	
	// DOM APIs, for completeness
	
	exports.setTimeout = function() {
	  return new Timeout(apply.call(setTimeout, window, arguments), clearTimeout);
	};
	exports.setInterval = function() {
	  return new Timeout(apply.call(setInterval, window, arguments), clearInterval);
	};
	exports.clearTimeout =
	exports.clearInterval = function(timeout) { timeout.close(); };
	
	function Timeout(id, clearFn) {
	  this._id = id;
	  this._clearFn = clearFn;
	}
	Timeout.prototype.unref = Timeout.prototype.ref = function() {};
	Timeout.prototype.close = function() {
	  this._clearFn.call(window, this._id);
	};
	
	// Does not start the time, just sets up the members needed.
	exports.enroll = function(item, msecs) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = msecs;
	};
	
	exports.unenroll = function(item) {
	  clearTimeout(item._idleTimeoutId);
	  item._idleTimeout = -1;
	};
	
	exports._unrefActive = exports.active = function(item) {
	  clearTimeout(item._idleTimeoutId);
	
	  var msecs = item._idleTimeout;
	  if (msecs >= 0) {
	    item._idleTimeoutId = setTimeout(function onTimeout() {
	      if (item._onTimeout)
	        item._onTimeout();
	    }, msecs);
	  }
	};
	
	// That's not how node.js implements it but the exposed api is the same.
	exports.setImmediate = typeof setImmediate === "function" ? setImmediate : function(fn) {
	  var id = nextImmediateId++;
	  var args = arguments.length < 2 ? false : slice.call(arguments, 1);
	
	  immediateIds[id] = true;
	
	  nextTick(function onNextTick() {
	    if (immediateIds[id]) {
	      // fn.call() is faster so we optimize for the common use-case
	      // @see http://jsperf.com/call-apply-segu
	      if (args) {
	        fn.apply(null, args);
	      } else {
	        fn.call(null);
	      }
	      // Prevent ids from leaking
	      exports.clearImmediate(id);
	    }
	  });
	
	  return id;
	};
	
	exports.clearImmediate = typeof clearImmediate === "function" ? clearImmediate : function(id) {
	  delete immediateIds[id];
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5).setImmediate, __webpack_require__(5).clearImmediate))

/***/ },
/* 6 */
/***/ function(module, exports) {

	// shim for using process in browser
	
	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';
	
	var hasOwn = Object.prototype.hasOwnProperty;
	var toStr = Object.prototype.toString;
	
	var isArray = function isArray(arr) {
		if (typeof Array.isArray === 'function') {
			return Array.isArray(arr);
		}
	
		return toStr.call(arr) === '[object Array]';
	};
	
	var isPlainObject = function isPlainObject(obj) {
		if (!obj || toStr.call(obj) !== '[object Object]') {
			return false;
		}
	
		var hasOwnConstructor = hasOwn.call(obj, 'constructor');
		var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
		// Not own constructor property must be Object
		if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
			return false;
		}
	
		// Own properties are enumerated firstly, so to speed up,
		// if last one is own, then all properties are own.
		var key;
		for (key in obj) {/**/}
	
		return typeof key === 'undefined' || hasOwn.call(obj, key);
	};
	
	module.exports = function extend() {
		var options, name, src, copy, copyIsArray, clone,
			target = arguments[0],
			i = 1,
			length = arguments.length,
			deep = false;
	
		// Handle a deep copy situation
		if (typeof target === 'boolean') {
			deep = target;
			target = arguments[1] || {};
			// skip the boolean and the target
			i = 2;
		} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
			target = {};
		}
	
		for (; i < length; ++i) {
			options = arguments[i];
			// Only deal with non-null/undefined values
			if (options != null) {
				// Extend the base object
				for (name in options) {
					src = target[name];
					copy = options[name];
	
					// Prevent never-ending loop
					if (target !== copy) {
						// Recurse if we're merging plain objects or arrays
						if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
							if (copyIsArray) {
								copyIsArray = false;
								clone = src && isArray(src) ? src : [];
							} else {
								clone = src && isPlainObject(src) ? src : {};
							}
	
							// Never move original objects, clone them
							target[name] = extend(deep, clone, copy);
	
						// Don't bring in undefined values
						} else if (typeof copy !== 'undefined') {
							target[name] = copy;
						}
					}
				}
			}
		}
	
		// Return the modified object
		return target;
	};
	


/***/ }
/******/ ])
});
;
//# sourceMappingURL=ingest.js.map