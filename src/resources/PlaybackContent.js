'use strict';

var Resource = require('./Resource');
var Request = require('../Request');
var utils = require('../Utils');
var extend = require('extend');

/**
 * Abstract PlaybackContent Class
 *
 * @param {object} options - SDK Options.
 * @class
 * @extends Resource
 */
function PlaybackContent (options) {

  var overrides = {
    thumbnail: '/<%=resource%>/<%=id%>/thumbnail',
    thumbnails: '/<%=resource%>/<%=id%>/thumbnails',
    deleteThumbnail: '/<%=resource%>/<%=id%>/thumbnail/<%=thumbnailId%>'
  };

  options = extend(true, {}, overrides, options);

  Resource.call(this, options);

};

// This extends the base class of 'Resource'.
PlaybackContent.prototype = Object.create(Resource.prototype);
PlaybackContent.prototype.constructor = PlaybackContent;

/**
 * Retrieve all thumbnails for a provided resource id.
 * @param {string}    id    ID of the resource to retrieve thumbnails for.
 * @return {promise}        A promise which resolves when the request is complete.
 */
PlaybackContent.prototype.getThumbnails = function (id) {
  var url, request;

  if (typeof id !== 'string') {
    return utils.promisify(false,
      'IngestSDK PlaybackContent getThumbnails requires an id to be passed as a string.');
  }

  url = utils.parseTokens(this.config.host + this.config.thumbnails, {
    resource: this.config.resource,
    id: id
  });

  request = new Request({
    url: url,
    token: this._tokenSource()
  });

  return request.send();
};

/**
 * Add external images to the resource id.
 * @param   {string}          id      ID of the resource to add the external thumbnails to.
 * @param   {string|array}    images  A path to the image, or an array of image paths.
 * @return  {promise}                 A promise which resolves when the request is complete.
 */
PlaybackContent.prototype.addExternalThumbnails = function (id, images) {

  var url, request;

  var imagesToAdd = [];

  if (typeof id !== 'string') {
    return utils.promisify(false,
      'IngestSDK PlaybackContent addExternal requires an id to be passed as a string.');
  }

  // Early return if the types do not match what we are expecting.
  if (!Array.isArray(images) && typeof images !== 'string') {
    return utils.promisify(false,
      'IngestSDK PlaybackContent addExternal requires images as a string or an array of strings.');
  }

  // If we already have an array replace the outgoing array, otherwise push the image path to the array.
  // This ensures we are always passing an array.
  if (Array.isArray(images)) {
    imagesToAdd = images;
  } else {
    imagesToAdd.push(images);
  }

  url = utils.parseTokens(this.config.host + this.config.thumbnails, {
    resource: this.config.resource,
    id: id
  });

  request = new Request({
    method: 'POST',
    url: url,
    token: this._tokenSource(),
    data: imagesToAdd
  });

  return request.send();

};

/**
 * Add external images to the resource id.
 * @param   {string}        id        ID of the resource to add the external thumbnails to.
 * @param   {file}          image     A JavaScript File interface representing the image to upload.
 * @return  {promise}                 A promise which resolves when the request is complete.
 */
PlaybackContent.prototype.uploadThumbnail = function (id, image) {

  var request, url, formData;

  if (typeof id !== 'string') {
    return utils.promisify(false,
      'IngestSDK PlaybackContent uploadThumbnail requires an id to be passed as a string.');
  }

  // Early return if the types do not match what we are expecting.
  if (!image || !(image instanceof File) || !utils.isImage(image)) {
    return utils.promisify(false,
      'IngestSDK PlaybackContent uploadThumbnail requires a valid image.');
  }

  url = utils.parseTokens(this.config.host + this.config.thumbnail, {
    resource: this.config.resource,
    id: id
  });

  // Create a new FormData object so the request is properly sent as multipart.
  formData = new FormData();
  formData.append('image', image);

  request = new Request({
    method: 'POST',
    url: url,
    token: this._tokenSource(),
    data: formData
  });

  return request.send();

};

/**
 * Remove an external thumbnail image.
 *
 * @param   {string}    id            ID of the resource to remove the thumbnail from.
 * @param   {string}    thumbnailId   ID of the thumbnail to remove from the resource.
 * @return  {promise}                 A promise which resolves when the request is complete.
 */
PlaybackContent.prototype.deleteThumbnail = function (id, thumbnailId) {

  var request, url;

  if (typeof id !== 'string') {
    return utils.promisify(false,
      'IngestSDK PlaybackContent deleteThumbnail requires an id to be passed as a string.');
  }

  if (typeof thumbnailId !== 'string') {
    return utils.promisify(false,
      'IngestSDK PlaybackContent deleteThumbanil requires a thumbnailId to be passed as a string.');
  }

  url = utils.parseTokens(this.config.host + this.config.deleteThumbnail, {
    resource: this.config.resource,
    id: id,
    thumbnailId: thumbnailId
  });

  request = new Request({
    method: 'DELETE',
    url: url,
    token: this._tokenSource()
  });

  return request.send();

};

module.exports = PlaybackContent;
