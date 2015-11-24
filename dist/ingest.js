!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.IngestAPI=e():t.IngestAPI=e()}(this,function(){return function(t){function e(n){if(o[n])return o[n].exports;var r=o[n]={exports:{},id:n,loaded:!1};return t[n].call(r.exports,r,r.exports,e),r.loaded=!0,r.exports}var o={};return e.m=t,e.c=o,e.p="",e(0)}([function(t,e,o){t.exports=o(1)},function(t,e,o){function n(t){this.defaults={host:"https://api.ingest.io",videos:"/videos",videoById:"/videos/<%=id%>",uploadSign:"/videos/<%=id%>/upload/sign<%=method%>",trash:"/videos?filter=trashed",uploadMethods:{param:"?type=",singlePart:"amazon",multiPart:"amazonMP"}},this.config=s(!0,{},this.defaults,t),this.config.token&&this.setToken(this.config.token),this.request=r}var r=o(2),i=o(3),s=o(7);n.prototype.setToken=function(t){if(!t||"string"!=typeof t)throw new Error("IngestAPI requires an authentication token passed as a string.");this.token=t},n.prototype.getToken=function(){if(!this.token)throw new Error("IngestAPI requires a token to be set.");return this.token},n.prototype.getVideos=function(t){return new r({url:this.config.host+this.config.videos,token:this.getToken(),headers:t})},n.prototype.getVideoById=function(t){var e,o;return t&&"string"==typeof t?(o={id:t},e=this.parseTokens(this.config.host+this.config.videoById,o),new r({url:e,token:this.getToken()})):this.promisify(!1,"IngestAPI getVideoById requires a valid videoId as a string.")},n.prototype.addVideo=function(t){return t&&"object"==typeof t?new r({url:this.config.host+this.config.videos,token:this.getToken(),method:"POST",data:t}):this.promisify(!1,"IngestAPI addVideo requires a video object.")},n.prototype.deleteVideo=function(t){var e,o;return t&&"string"==typeof t?(o={id:t},e=this.parseTokens(this.config.host+this.config.videoById,o),new r({url:e,token:this.getToken(),method:"DELETE"})):this.promisify(!1,"IngestAPI deleteVideo requires a video ID passed as a string.")},n.prototype.getVideosCount=function(){return new r({url:this.config.host+this.config.videos,token:this.getToken(),method:"HEAD"}).then(this.getCountResponse.bind(this))},n.prototype.getTrashedVideosCount=function(){return new r({url:this.config.host+this.config.trash,token:this.getToken(),method:"HEAD"}).then(this.getCountResponse.bind(this))},n.prototype.getCountResponse=function(t){return parseInt(t.headers("Resource-Count"),10)},n.prototype.signUploadBlob=function(t){var e,o,n=this.validateUploadObject(t),i="";return n.valid?(t.method===!0&&(i=this.config.uploadMethods.param+this.config.uploadMethods.singlePart),o={id:t.id,method:i},e=this.parseTokens(this.config.host+this.config.uploadSign,o),new r({url:e,token:this.getToken(),method:"POST",data:t})):this.promisify(!1,n.message)},n.prototype.validateUploadObject=function(t){var e={valid:!0,message:""};return t&&"object"==typeof t||(e.valid=!1,e.message="The passed value was not an object."),t.id&&"string"==typeof t.id||(e.valid=!1,e.message="Missing or invalid property : id."),t.key&&"string"==typeof t.key||(e.valid=!1,e.message="Missing or invalid property : key."),t.uploadId&&"string"==typeof t.uploadId||(e.valid=!1,e.message="Missing or invalid property : uploadId"),t.partNumber&&"number"==typeof t.partNumber||(e.valid=!1,e.message="Missing or invalid property : partNumber"),t.hasOwnProperty("method")&&"boolean"==typeof t.method||(e.valid=!1,e.message="Missing or invalid property : method"),e},n.prototype.parseTokens=function(t,e){var o,n=Object.keys(e),r=n.length;for(o=0;r>o;o++)t=t.replace("<%="+n[o]+"%>",e[n[o]]);return t},n.prototype.promisify=function(t,e){var o=i();return o(t,[e]),o},t.exports=n},function(t,e,o){var n=o(3),r=o(7),i=[200,201,202,204],s=function(t){return this.defaults={async:!0,method:"GET"},this.promise=n(),this.request=new XMLHttpRequest,this.setupListeners(),this.options=r(!0,this.defaults,t),this.options.url?(this.makeRequest(),this.promise):(this.requestError("Request Error : a url is required to make the request."),this.promise)};s.prototype.setupListeners=function(){this.request.onreadystatechange=this.readyStateChange.bind(this)},s.prototype.makeRequest=function(){var t=this.preparePostData(this.options.data);return t.success?(this.request.open(this.options.method,this.options.url,this.options.async),this.options.headers&&this.applyRequestHeaders(this.options.headers),this.options.token&&this.request.setRequestHeader("Authorization",this.options.token),void(t.data?(this.request.setRequestHeader("Content-type","application/json; charset=utf-8"),this.request.send(t.data)):this.request.send())):void this.requestError("Request Error : error preparing post data.")},s.prototype.preparePostData=function(t){var e={success:!0,data:t};if(t)try{e.data=JSON.stringify(t)}catch(o){e.success=!1,e.data=null}return e},s.prototype.applyRequestHeaders=function(t){var e,o,n=Object.keys(t),r=n.length;for(o=0;r>o;o++)e=n[o],this.request.setRequestHeader(e,t[e])},s.prototype.requestComplete=function(t){this.response=this.processResponse(t),this.promise(!this.response.data.error,[this.response])},s.prototype.processResponse=function(t){var e=this.request.getResponseHeader("Content-Type"),o=t;if(e&&-1!==e.indexOf("application/json"))try{o=JSON.parse(t)}catch(n){o={error:"JSON parsing failed. "+n.stack}}return{data:o,headers:this.request.getResponseHeader.bind(this.request),statusCode:this.request.status}},s.prototype.requestError=function(t){this.promise(!1,[t])},s.prototype.readyStateChange=function(){4===this.request.readyState&&(this.isValidResponseCode(this.request.status)?this.requestComplete(this.request.responseText):this.requestError("Invalid response code."))},s.prototype.isValidResponseCode=function(t){var e,o=!1,n=i.length;for(e=0;n>e;e++)if(t===i[e]){o=!0;break}return o},t.exports=s},function(t,e,o){(function(t,e,o){!function(t){function n(t){return"function"==typeof t}function r(t){return"object"==typeof t}function i(t){"undefined"!=typeof e?e(t):"undefined"!=typeof o&&o.nextTick?o.nextTick(t):setTimeout(t,0)}var s;t[0][t[1]]=function a(t){var e,o=[],u=[],p=function(t,n){return null==e&&null!=t&&(e=t,o=n,u.length&&i(function(){for(var t=0;t<u.length;t++)u[t]()})),e};return p.then=function(p,c){var d=a(t),f=function(){function t(e){var o,i=0;try{if(e&&(r(e)||n(e))&&n(o=e.then)){if(e===d)throw new TypeError;o.call(e,function(){i++||t.apply(s,arguments)},function(t){i++||d(!1,[t])})}else d(!0,arguments)}catch(a){i++||d(!1,[a])}}try{var i=e?p:c;n(i)?t(i.apply(s,o||[])):d(e,o)}catch(a){d(!1,[a])}};return null!=e?i(f):u.push(f),d},t&&(p=t(p)),p}}([t,"exports"])}).call(e,o(4)(t),o(5).setImmediate,o(6))},function(t,e){t.exports=function(t){return t.webpackPolyfill||(t.deprecate=function(){},t.paths=[],t.children=[],t.webpackPolyfill=1),t}},function(t,e,o){(function(t,n){function r(t,e){this._id=t,this._clearFn=e}var i=o(6).nextTick,s=Function.prototype.apply,a=Array.prototype.slice,u={},p=0;e.setTimeout=function(){return new r(s.call(setTimeout,window,arguments),clearTimeout)},e.setInterval=function(){return new r(s.call(setInterval,window,arguments),clearInterval)},e.clearTimeout=e.clearInterval=function(t){t.close()},r.prototype.unref=r.prototype.ref=function(){},r.prototype.close=function(){this._clearFn.call(window,this._id)},e.enroll=function(t,e){clearTimeout(t._idleTimeoutId),t._idleTimeout=e},e.unenroll=function(t){clearTimeout(t._idleTimeoutId),t._idleTimeout=-1},e._unrefActive=e.active=function(t){clearTimeout(t._idleTimeoutId);var e=t._idleTimeout;e>=0&&(t._idleTimeoutId=setTimeout(function(){t._onTimeout&&t._onTimeout()},e))},e.setImmediate="function"==typeof t?t:function(t){var o=p++,n=arguments.length<2?!1:a.call(arguments,1);return u[o]=!0,i(function(){u[o]&&(n?t.apply(null,n):t.call(null),e.clearImmediate(o))}),o},e.clearImmediate="function"==typeof n?n:function(t){delete u[t]}}).call(e,o(5).setImmediate,o(5).clearImmediate)},function(t,e){function o(){p=!1,s.length?u=s.concat(u):c=-1,u.length&&n()}function n(){if(!p){var t=setTimeout(o);p=!0;for(var e=u.length;e;){for(s=u,u=[];++c<e;)s&&s[c].run();c=-1,e=u.length}s=null,p=!1,clearTimeout(t)}}function r(t,e){this.fun=t,this.array=e}function i(){}var s,a=t.exports={},u=[],p=!1,c=-1;a.nextTick=function(t){var e=new Array(arguments.length-1);if(arguments.length>1)for(var o=1;o<arguments.length;o++)e[o-1]=arguments[o];u.push(new r(t,e)),1!==u.length||p||setTimeout(n,0)},r.prototype.run=function(){this.fun.apply(null,this.array)},a.title="browser",a.browser=!0,a.env={},a.argv=[],a.version="",a.versions={},a.on=i,a.addListener=i,a.once=i,a.off=i,a.removeListener=i,a.removeAllListeners=i,a.emit=i,a.binding=function(t){throw new Error("process.binding is not supported")},a.cwd=function(){return"/"},a.chdir=function(t){throw new Error("process.chdir is not supported")},a.umask=function(){return 0}},function(t,e){"use strict";var o=Object.prototype.hasOwnProperty,n=Object.prototype.toString,r=function(t){return"function"==typeof Array.isArray?Array.isArray(t):"[object Array]"===n.call(t)},i=function(t){if(!t||"[object Object]"!==n.call(t))return!1;var e=o.call(t,"constructor"),r=t.constructor&&t.constructor.prototype&&o.call(t.constructor.prototype,"isPrototypeOf");if(t.constructor&&!e&&!r)return!1;var i;for(i in t);return"undefined"==typeof i||o.call(t,i)};t.exports=function s(){var t,e,o,n,a,u,p=arguments[0],c=1,d=arguments.length,f=!1;for("boolean"==typeof p?(f=p,p=arguments[1]||{},c=2):("object"!=typeof p&&"function"!=typeof p||null==p)&&(p={});d>c;++c)if(t=arguments[c],null!=t)for(e in t)o=p[e],n=t[e],p!==n&&(f&&n&&(i(n)||(a=r(n)))?(a?(a=!1,u=o&&r(o)?o:[]):u=o&&i(o)?o:{},p[e]=s(f,u,n)):"undefined"!=typeof n&&(p[e]=n));return p}}])});
//# sourceMappingURL=ingest.js.map