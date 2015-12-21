!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.IngestAPI=e():t.IngestAPI=e()}(this,function(){return function(t){function e(i){if(o[i])return o[i].exports;var n=o[i]={exports:{},id:i,loaded:!1};return t[i].call(n.exports,n,n.exports,e),n.loaded=!0,n.exports}var o={};return e.m=t,e.c=o,e.p="",e(0)}([function(t,e,o){t.exports=o(1)},function(t,e,o){function i(t){this.defaults={host:"https://api.ingest.io",videos:"/videos",videoById:"/videos/<%=id%>",thumbnails:"/videos/<%=id%>/thumbnails",trash:"/videos?filter=trashed",networks:"/networks",networksKeys:"/networks/keys",networksKeysById:"/networks/keys/<%=id%>",inputs:"/encoding/inputs",inputsById:"/encoding/inputs/<%=id%>",inputsUpload:"/encoding/inputs/<%=id%>/upload<%=method%>",inputsUploadSign:"/encoding/inputs/<%=id%>/upload/sign<%=method%>",inputsUploadComplete:"/encoding/inputs/<%=id%>/upload/complete",inputsUploadAbort:"/encoding/inputs/<%=id%>/upload/abort",uploadMethods:{param:"?type=",singlePart:"amazon",multiPart:"amazonMP"},deleteMethods:{permanent:"?permanent=1"},search:"/<%=resource%>?search=<%=input%>"},this.config=r(!0,{},this.defaults,t),this.config.token&&this.setToken(this.config.token),this.request=n}var n=o(2),s=o(3),r=o(7);i.prototype.setToken=function(t){if("string"!=typeof t)throw new Error("IngestAPI requires an authentication token passed as a string.");this.token=t},i.prototype.getToken=function(){if(!this.token)throw new Error("IngestAPI requires a token to be set.");return this.token},i.prototype.getVideos=function(t){return new n({url:this.config.host+this.config.videos,token:this.getToken(),headers:t})},i.prototype.getVideoById=function(t){var e,o;return"string"!=typeof t?this.promisify(!1,"IngestAPI getVideoById requires a valid videoId as a string."):(o={id:t},e=this.parseTokens(this.config.host+this.config.videoById,o),new n({url:e,token:this.getToken()}))},i.prototype.addVideo=function(t){return"object"!=typeof t?this.promisify(!1,"IngestAPI addVideo requires a video object."):new n({url:this.config.host+this.config.videos,token:this.getToken(),method:"POST",data:t})},i.prototype.updateVideo=function(t){var e,o;return"object"!=typeof t?this.promisify(!1,"IngestAPI update requires a video to be passed as an object."):(o={id:t.id},e=this.parseTokens(this.config.host+this.config.videoById,o),new n({url:e,token:this.getToken(),method:"PATCH",data:t}))},i.prototype.updateVideos=function(t){return Array.isArray(t)?new n({url:this.config.host+this.config.videos,token:this.getToken(),method:"PATCH",data:t}):this.promisify(!1,"IngestAPI updateVideos requires an array of videos")},i.prototype._deleteVideos=function(t,e){var o;return Array.isArray(t)?(o=this.config.host+this.config.videos,e===!0&&(o+=this.config.deleteMethods.permanent),new n({url:o,token:this.getToken(),method:"DELETE",data:t})):this.promisify(!1,"IngestAPI deleteVideos requires an array of videos")},i.prototype.deleteVideos=function(t){return this._deleteVideos(t)},i.prototype.permanentlyDeleteVideos=function(t){return this._deleteVideos(t,!0)},i.prototype._deleteVideo=function(t,e){var o,i;return"string"!=typeof t?this.promisify(!1,"IngestAPI deleteVideo requires a video ID passed as a string."):(i={id:t},o=this.parseTokens(this.config.host+this.config.videoById,i),e===!0&&(o+=this.config.deleteMethods.permanent),new n({url:o,token:this.getToken(),method:"DELETE"}))},i.prototype.deleteVideo=function(t){return this._deleteVideo(t)},i.prototype.permanentlyDeleteVideo=function(t){return this._deleteVideo(t,!0)},i.prototype.searchVideos=function(t,e,o){var i;return"string"!=typeof t?this.promisify(!1,"IngestAPI searchVideos requires a resource type to be passed as a string."):"string"!=typeof e?this.promisify(!1,"IngestAPI searchVideos requires search input to be passed as a string."):(i=this.parseTokens(this.config.host+this.config.search,{resource:t,input:e}),new n({url:i,token:this.getToken(),headers:o}))},i.prototype.getVideosCount=function(){return new n({url:this.config.host+this.config.videos,token:this.getToken(),method:"HEAD"}).then(this.getCountResponse.bind(this))},i.prototype.getTrashedVideos=function(t){return new n({url:this.config.host+this.config.trash,token:this.getToken(),headers:t})},i.prototype.getTrashedVideosCount=function(){return new n({url:this.config.host+this.config.trash,token:this.getToken(),method:"HEAD"}).then(this.getCountResponse.bind(this))},i.prototype.getCountResponse=function(t){return parseInt(t.headers("Resource-Count"),10)},i.prototype.signUploadBlob=function(t){var e,o,i=this.validateUploadObject(t),s="";return i.valid?(t.method||(s=this.config.uploadMethods.param+this.config.uploadMethods.singlePart),o={id:t.id,method:s},e=this.parseTokens(this.config.host+this.config.inputsUploadSign,o),new n({url:e,token:this.getToken(),method:"POST",data:t})):this.promisify(!1,i.message)},i.prototype._validateUploadIds=function(t){var e={valid:!0,message:""};return"object"!=typeof t&&(e.valid=!1,e.message="The passed value was not an object."),"string"!=typeof t.key&&(e.valid=!1,e.message="Missing or invalid property : key."),"string"!=typeof t.uploadId&&(e.valid=!1,e.message="Missing or invalid property : uploadId"),e},i.prototype.validateUploadObject=function(t){var e=this._validateUploadIds(t),o={valid:!0,message:""};return"object"!=typeof t&&(o.valid=!1,o.message="The passed value was not an object."),e.valid||(o=e),"string"!=typeof t.id&&(o.valid=!1,o.message="Missing or invalid property : id."),"number"!=typeof t.partNumber&&(o.valid=!1,o.message="Missing or invalid property : partNumber"),t.hasOwnProperty("method")&&"boolean"==typeof t.method||(o.valid=!1,o.message="Missing or invalid property : method"),!t.hasOwnProperty("method")||t.method||t.uploadId||(o.valid=!0,o.message=""),o},i.prototype.parseTokens=function(t,e){var o,i=Object.keys(e),n=i.length;for(o=0;n>o;o++)t=t.replace("<%="+i[o]+"%>",e[i[o]]);return t},i.prototype.promisify=function(t,e){var o=s();return o(t,[e]),o},i.prototype.getNetworkSecureKeys=function(){return new n({url:this.config.host+this.config.networksKeys,token:this.getToken()})},i.prototype.addNetworkSecureKey=function(t){return"object"!=typeof t?this.promisify(!1,"IngestAPI addNetworkSecureKey requires data to be passed as an object."):("string"!=typeof t.title&&(t.title=""),"string"!=typeof t.key?this.promisify(!1,"IngestAPI addNetworkSecureKey requires that the key be a string in RSA public key format."):new n({url:this.config.host+this.config.networksKeys,token:this.getToken(),method:"POST",data:t}))},i.prototype.getNetworkSecureKeyById=function(t){var e,o;return"string"!=typeof t?this.promisify(!1,"IngestAPI getNetworkSecureKeyById requires an id to be passed as a string."):(e={id:t},o=this.parseTokens(this.config.host+this.config.networksKeysById,e),new n({url:o,token:this.getToken()}))},i.prototype.updateNetworkSecureKey=function(t){var e,o;return"object"!=typeof t?this.promisify(!1,"IngestAPI updateNetworkSecureKeyById requires data to be passed as an object."):"string"!=typeof t.id?this.promisify(!1,'IngestAPI updateNetworkSecureKeyById requires a param "id" to be a string.'):("string"!=typeof t.title&&(t.title=""),e={id:t.id},o=this.parseTokens(this.config.host+this.config.networksKeysById,e),new n({url:o,token:this.getToken(),method:"PATCH",data:t}))},i.prototype.deleteNetworkSecureKeyById=function(t){var e,o;return"string"!=typeof t?this.promisify(!1,"IngestAPI deleteNetworkSecureKeyById requires an id to be passed as a string."):(e={id:t},o=this.parseTokens(this.config.host+this.config.networksKeysById,e),new n({url:o,token:this.getToken(),method:"DELETE"}))},i.prototype.getVideoThumbnails=function(t){var e,o;return"string"!=typeof t?this.promisify(!1,"IngestAPI getVideoThumbnails requires an id to be passed as a string."):(e={id:t},o=this.parseTokens(this.config.host+this.config.thumbnails,e),new n({url:o,token:this.getToken()}))},i.prototype.getInputs=function(t){return new n({url:this.config.host+this.config.inputs,token:this.getToken(),headers:t})},i.prototype.getInputsById=function(t){var e,o;return"string"!=typeof t?this.promisify(!1,"IngestAPI getInputsById requires a valid inputId as a string."):(o={id:t},e=this.parseTokens(this.config.host+this.config.inputsById,o),new n({url:e,token:this.getToken()}))},i.prototype.addInputs=function(t){return Array.isArray(t)?new n({url:this.config.host+this.config.inputs,token:this.getToken(),method:"POST",data:t}):this.promisify(!1,"IngestAPI addInput requires an array of input objects.")},i.prototype.deleteInput=function(t){var e,o;return"string"!=typeof t?this.promisify(!1,"IngestAPI deleteInput requires a video ID passed as a string."):(o={id:t},e=this.parseTokens(this.config.host+this.config.inputsById,o),new n({url:e,token:this.getToken(),method:"DELETE"}))},i.prototype.deleteInputs=function(t){var e;return Array.isArray(t)?(e=this.config.host+this.config.inputs,new n({url:e,token:this.getToken(),method:"DELETE",data:t})):this.promisify(!1,"IngestAPI deleteInputs requires an array of input Ids")},i.prototype.initializeInputUpload=function(t,e){var o,i,s="";return"string"!=typeof t?this.promisify(!1,"IngestAPI initializeUploadInput requires a valid input ID passed as a string."):"string"!=typeof e.type?this.promisify(!1,"Missing or invalid property : type."):"number"!=typeof e.size?this.promisify(!1,"Missing or invalid property : size"):(e.method||(s=this.config.uploadMethods.param+this.config.uploadMethods.singlePart),i={id:t,method:s},o=this.parseTokens(this.config.host+this.config.inputsUpload,i),new n({url:o,token:this.getToken(),method:"POST",data:e}))},i.prototype.completeInputUpload=function(t,e){var o,i,s=this._validateUploadIds(e);return"string"!=typeof t?this.promisify(!1,"IngestAPI initializeUploadInput requires a valid input ID passed as a string."):s.valid?(i={id:t},o=this.parseTokens(this.config.host+this.config.inputsUploadComplete,i),new n({url:o,token:this.getToken(),method:"POST",data:e})):this.promisify(!1,s.message)},i.prototype.abortInputUpload=function(t,e){var o,i,s=this._validateUploadIds(e);return"string"!=typeof t?this.promisify(!1,"IngestAPI initializeUploadInput requires a valid input ID passed as a string."):s.valid?(i={id:t},o=this.parseTokens(this.config.host+this.config.inputsUploadAbort,i),new n({url:o,token:this.getToken(),method:"POST",data:e})):this.promisify(!1,s.message)},t.exports=i},function(t,e,o){var i=o(3),n=o(7),s=o(8),r=[200,201,202,204],a=function(t){return this.defaults={async:!0,method:"GET"},this.promise=i(),this.request=new XMLHttpRequest,this.setupListeners(),this.options=n(!0,this.defaults,t),this.options.url?(this.makeRequest(),this.promise):(this.requestError("Request Error : a url is required to make the request."),this.promise)};a.prototype.setupListeners=function(){this.request.onreadystatechange=this.readyStateChange.bind(this)},a.prototype.makeRequest=function(){var t=this.preparePostData(this.options.data);if(!t.success)return void this.requestError("Request Error : error preparing post data.");if(this.request.open(this.options.method,this.options.url,this.options.async),this.options.headers&&this.applyRequestHeaders(this.options.headers),this.options.token){if(s.isExpired(this.options.token))return void this.requestError("Request Error : token is expired.");this.request.setRequestHeader("Authorization",this.options.token)}t.data?(this.request.setRequestHeader("Content-type","application/json; charset=utf-8"),this.request.send(t.data)):this.request.send()},a.prototype.preparePostData=function(t){var e={success:!0,data:t};if(t)try{e.data=JSON.stringify(t)}catch(o){e.success=!1,e.data=null}return e},a.prototype.applyRequestHeaders=function(t){var e,o,i=Object.keys(t),n=i.length;for(o=0;n>o;o++)e=i[o],this.request.setRequestHeader(e,t[e])},a.prototype.requestComplete=function(t){this.response=this.processResponse(t),this.promise(!this.response.data.error,[this.response])},a.prototype.processResponse=function(t){var e=this.request.getResponseHeader("Content-Type"),o=t;if(e&&-1!==e.indexOf("application/json"))try{o=JSON.parse(t)}catch(i){o={error:"JSON parsing failed. "+i.stack}}return{data:o,headers:this.request.getResponseHeader.bind(this.request),statusCode:this.request.status}},a.prototype.requestError=function(t){this.promise(!1,[t])},a.prototype.readyStateChange=function(){4===this.request.readyState&&(this.isValidResponseCode(this.request.status)?this.requestComplete(this.request.responseText):this.requestError("Invalid response code."))},a.prototype.isValidResponseCode=function(t){var e,o=!1,i=r.length;for(e=0;i>e;e++)if(t===r[e]){o=!0;break}return o},t.exports=a},function(t,e,o){(function(t,e,o){!function(t){function i(t){return"function"==typeof t}function n(t){return"object"==typeof t}function s(t){"undefined"!=typeof e?e(t):"undefined"!=typeof o&&o.nextTick?o.nextTick(t):setTimeout(t,0)}var r;t[0][t[1]]=function a(t){var e,o=[],p=[],u=function(t,i){return null==e&&null!=t&&(e=t,o=i,p.length&&s(function(){for(var t=0;t<p.length;t++)p[t]()})),e};return u.then=function(u,d){var h=a(t),c=function(){function t(e){var o,s=0;try{if(e&&(n(e)||i(e))&&i(o=e.then)){if(e===h)throw new TypeError;o.call(e,function(){s++||t.apply(r,arguments)},function(t){s++||h(!1,[t])})}else h(!0,arguments)}catch(a){s++||h(!1,[a])}}try{var s=e?u:d;i(s)?t(s.apply(r,o||[])):h(e,o)}catch(a){h(!1,[a])}};return null!=e?s(c):p.push(c),h},t&&(u=t(u)),u}}([t,"exports"])}).call(e,o(4)(t),o(5).setImmediate,o(6))},function(t,e){t.exports=function(t){return t.webpackPolyfill||(t.deprecate=function(){},t.paths=[],t.children=[],t.webpackPolyfill=1),t}},function(t,e,o){(function(t,i){function n(t,e){this._id=t,this._clearFn=e}var s=o(6).nextTick,r=Function.prototype.apply,a=Array.prototype.slice,p={},u=0;e.setTimeout=function(){return new n(r.call(setTimeout,window,arguments),clearTimeout)},e.setInterval=function(){return new n(r.call(setInterval,window,arguments),clearInterval)},e.clearTimeout=e.clearInterval=function(t){t.close()},n.prototype.unref=n.prototype.ref=function(){},n.prototype.close=function(){this._clearFn.call(window,this._id)},e.enroll=function(t,e){clearTimeout(t._idleTimeoutId),t._idleTimeout=e},e.unenroll=function(t){clearTimeout(t._idleTimeoutId),t._idleTimeout=-1},e._unrefActive=e.active=function(t){clearTimeout(t._idleTimeoutId);var e=t._idleTimeout;e>=0&&(t._idleTimeoutId=setTimeout(function(){t._onTimeout&&t._onTimeout()},e))},e.setImmediate="function"==typeof t?t:function(t){var o=u++,i=arguments.length<2?!1:a.call(arguments,1);return p[o]=!0,s(function(){p[o]&&(i?t.apply(null,i):t.call(null),e.clearImmediate(o))}),o},e.clearImmediate="function"==typeof i?i:function(t){delete p[t]}}).call(e,o(5).setImmediate,o(5).clearImmediate)},function(t,e){function o(){u=!1,r.length?p=r.concat(p):d=-1,p.length&&i()}function i(){if(!u){var t=setTimeout(o);u=!0;for(var e=p.length;e;){for(r=p,p=[];++d<e;)r&&r[d].run();d=-1,e=p.length}r=null,u=!1,clearTimeout(t)}}function n(t,e){this.fun=t,this.array=e}function s(){}var r,a=t.exports={},p=[],u=!1,d=-1;a.nextTick=function(t){var e=new Array(arguments.length-1);if(arguments.length>1)for(var o=1;o<arguments.length;o++)e[o-1]=arguments[o];p.push(new n(t,e)),1!==p.length||u||setTimeout(i,0)},n.prototype.run=function(){this.fun.apply(null,this.array)},a.title="browser",a.browser=!0,a.env={},a.argv=[],a.version="",a.versions={},a.on=s,a.addListener=s,a.once=s,a.off=s,a.removeListener=s,a.removeAllListeners=s,a.emit=s,a.binding=function(t){throw new Error("process.binding is not supported")},a.cwd=function(){return"/"},a.chdir=function(t){throw new Error("process.chdir is not supported")},a.umask=function(){return 0}},function(t,e){"use strict";var o=Object.prototype.hasOwnProperty,i=Object.prototype.toString,n=function(t){return"function"==typeof Array.isArray?Array.isArray(t):"[object Array]"===i.call(t)},s=function(t){if(!t||"[object Object]"!==i.call(t))return!1;var e=o.call(t,"constructor"),n=t.constructor&&t.constructor.prototype&&o.call(t.constructor.prototype,"isPrototypeOf");if(t.constructor&&!e&&!n)return!1;var s;for(s in t);return"undefined"==typeof s||o.call(t,s)};t.exports=function r(){var t,e,o,i,a,p,u=arguments[0],d=1,h=arguments.length,c=!1;for("boolean"==typeof u?(c=u,u=arguments[1]||{},d=2):("object"!=typeof u&&"function"!=typeof u||null==u)&&(u={});h>d;++d)if(t=arguments[d],null!=t)for(e in t)o=u[e],i=t[e],u!==i&&(c&&i&&(s(i)||(a=n(i)))?(a?(a=!1,p=o&&n(o)?o:[]):p=o&&s(o)?o:{},u[e]=r(c,p,i)):"undefined"!=typeof i&&(u[e]=i));return u}},function(t,e){var o=function(t){var e=t.split(".");if(e.length<=1)return!1;var o=window.atob(e[1]);return o=JSON.parse(o)};t.exports.isExpired=function(t){var e,i,n,s;return e=o(t),n=!0,e?(i=e.exp,s=new Date,s=s.getTime()/1e3,i?(i>s&&(n=!1),n):n):n}}])});
//# sourceMappingURL=ingest.js.map