!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.IngestAPI=t():e.IngestAPI=t()}(this,function(){return function(e){function t(n){if(o[n])return o[n].exports;var r=o[n]={exports:{},id:n,loaded:!1};return e[n].call(r.exports,r,r.exports,t),r.loaded=!0,r.exports}var o={};return t.m=e,t.c=o,t.p="",t(0)}([function(e,t,o){e.exports=o(1)},function(e,t,o){function n(e){this.defaults={host:"https://api.ingest.io",videos:"/videos",videoById:"/videos/<%=id%>",uploadSign:"/videos/<%=id%>/upload/sign<%=method%>",trash:"/videos?filter=trashed",networks:"/networks",networksKey:"/networks/key",uploadMethods:{param:"?type=",singlePart:"amazon",multiPart:"amazonMP"},search:"/<%=resource%>?search=<%=input%>"},this.config=s(!0,{},this.defaults,e),this.config.token&&this.setToken(this.config.token),this.request=r}var r=o(2),i=o(3),s=o(7);n.prototype.setToken=function(e){if(!e||"string"!=typeof e)throw new Error("IngestAPI requires an authentication token passed as a string.");this.token=e},n.prototype.getToken=function(){if(!this.token)throw new Error("IngestAPI requires a token to be set.");return this.token},n.prototype.getVideos=function(e){return new r({url:this.config.host+this.config.videos,token:this.getToken(),headers:e})},n.prototype.getVideoById=function(e){var t,o;return e&&"string"==typeof e?(o={id:e},t=this.parseTokens(this.config.host+this.config.videoById,o),new r({url:t,token:this.getToken()})):this.promisify(!1,"IngestAPI getVideoById requires a valid videoId as a string.")},n.prototype.addVideo=function(e){return e&&"object"==typeof e?new r({url:this.config.host+this.config.videos,token:this.getToken(),method:"POST",data:e}):this.promisify(!1,"IngestAPI addVideo requires a video object.")},n.prototype.updateVideo=function(e){var t,o;return e&&"object"==typeof e?(o={id:e.id},t=this.parseTokens(this.config.host+this.config.videoById,o),new r({url:t,token:this.getToken(),method:"PATCH",data:e})):this.promisify(!1,"IngestAPI update requires a video to be passed as an object.")},n.prototype._deleteVideo=function(e,t){var o,n;return e&&"string"==typeof e?(n={id:e},o=this.parseTokens(this.config.host+this.config.videoById,n),t===!0&&(o+="?permanent=1"),new r({url:o,token:this.getToken(),method:"DELETE"})):this.promisify(!1,"IngestAPI deleteVideo requires a video ID passed as a string.")},n.prototype.deleteVideo=function(e){return this._deleteVideo(e)},n.prototype.permanentlyDeleteVideo=function(e){return this._deleteVideo(e,!0)},n.prototype.searchVideos=function(e,t,o){var n;return e&&"string"==typeof e?t&&"string"==typeof t?(n=this.parseTokens(this.config.host+this.config.search,{resource:e,input:t}),new r({url:n,token:this.getToken(),headers:o})):this.promisify(!1,"IngestAPI searchVideos requires search input to be passed as a string."):this.promisify(!1,"IngestAPI searchVideos requires a resource type to be passed as a string.")},n.prototype.getVideosCount=function(){return new r({url:this.config.host+this.config.videos,token:this.getToken(),method:"HEAD"}).then(this.getCountResponse.bind(this))},n.prototype.getTrashedVideosCount=function(){return new r({url:this.config.host+this.config.trash,token:this.getToken(),method:"HEAD"}).then(this.getCountResponse.bind(this))},n.prototype.getCountResponse=function(e){return parseInt(e.headers("Resource-Count"),10)},n.prototype.signUploadBlob=function(e){var t,o,n=this.validateUploadObject(e),i="";return n.valid?(e.method||(i=this.config.uploadMethods.param+this.config.uploadMethods.singlePart),o={id:e.id,method:i},t=this.parseTokens(this.config.host+this.config.uploadSign,o),new r({url:t,token:this.getToken(),method:"POST",data:e})):this.promisify(!1,n.message)},n.prototype.validateUploadObject=function(e){var t={valid:!0,message:""};return e&&"object"==typeof e||(t.valid=!1,t.message="The passed value was not an object."),e.id&&"string"==typeof e.id||(t.valid=!1,t.message="Missing or invalid property : id."),e.key&&"string"==typeof e.key||(t.valid=!1,t.message="Missing or invalid property : key."),e.uploadId&&"string"==typeof e.uploadId||(t.valid=!1,t.message="Missing or invalid property : uploadId"),e.partNumber&&"number"==typeof e.partNumber||(t.valid=!1,t.message="Missing or invalid property : partNumber"),e.hasOwnProperty("method")&&"boolean"==typeof e.method||(t.valid=!1,t.message="Missing or invalid property : method"),!e.hasOwnProperty("method")||e.method||e.uploadId||(t.valid=!0,t.message=""),t},n.prototype.parseTokens=function(e,t){var o,n=Object.keys(t),r=n.length;for(o=0;r>o;o++)e=e.replace("<%="+n[o]+"%>",t[n[o]]);return e},n.prototype.promisify=function(e,t){var o=i();return o(e,[t]),o},n.prototype.getNetworkKey=function(){return new r({url:this.config.host+this.config.networksKey,token:this.getToken()}).then(this.getNetworkKeyResponse.bind(this))},n.prototype.getNetworkKeyResponse=function(e){return e.data.key},n.prototype.setNetworkKey=function(e,t){var o,n;return e&&"string"==typeof e?(o="POST",t&&(o="PATCH"),n={key:e},new r({url:this.config.host+this.config.networksKey,token:this.getToken(),method:o,data:n})):this.promisify(!1,"IngestAPI setNetworkKey requires a key to be passed as a string.")},e.exports=n},function(e,t,o){var n=o(3),r=o(7),i=[200,201,202,204],s=function(e){return this.defaults={async:!0,method:"GET"},this.promise=n(),this.request=new XMLHttpRequest,this.setupListeners(),this.options=r(!0,this.defaults,e),this.options.url?(this.makeRequest(),this.promise):(this.requestError("Request Error : a url is required to make the request."),this.promise)};s.prototype.setupListeners=function(){this.request.onreadystatechange=this.readyStateChange.bind(this)},s.prototype.makeRequest=function(){var e=this.preparePostData(this.options.data);return e.success?(this.request.open(this.options.method,this.options.url,this.options.async),this.options.headers&&this.applyRequestHeaders(this.options.headers),this.options.token&&this.request.setRequestHeader("Authorization",this.options.token),void(e.data?(this.request.setRequestHeader("Content-type","application/json; charset=utf-8"),this.request.send(e.data)):this.request.send())):void this.requestError("Request Error : error preparing post data.")},s.prototype.preparePostData=function(e){var t={success:!0,data:e};if(e)try{t.data=JSON.stringify(e)}catch(o){t.success=!1,t.data=null}return t},s.prototype.applyRequestHeaders=function(e){var t,o,n=Object.keys(e),r=n.length;for(o=0;r>o;o++)t=n[o],this.request.setRequestHeader(t,e[t])},s.prototype.requestComplete=function(e){this.response=this.processResponse(e),this.promise(!this.response.data.error,[this.response])},s.prototype.processResponse=function(e){var t=this.request.getResponseHeader("Content-Type"),o=e;if(t&&-1!==t.indexOf("application/json"))try{o=JSON.parse(e)}catch(n){o={error:"JSON parsing failed. "+n.stack}}return{data:o,headers:this.request.getResponseHeader.bind(this.request),statusCode:this.request.status}},s.prototype.requestError=function(e){this.promise(!1,[e])},s.prototype.readyStateChange=function(){4===this.request.readyState&&(this.isValidResponseCode(this.request.status)?this.requestComplete(this.request.responseText):this.requestError("Invalid response code."))},s.prototype.isValidResponseCode=function(e){var t,o=!1,n=i.length;for(t=0;n>t;t++)if(e===i[t]){o=!0;break}return o},e.exports=s},function(e,t,o){(function(e,t,o){!function(e){function n(e){return"function"==typeof e}function r(e){return"object"==typeof e}function i(e){"undefined"!=typeof t?t(e):"undefined"!=typeof o&&o.nextTick?o.nextTick(e):setTimeout(e,0)}var s;e[0][e[1]]=function a(e){var t,o=[],u=[],p=function(e,n){return null==t&&null!=e&&(t=e,o=n,u.length&&i(function(){for(var e=0;e<u.length;e++)u[e]()})),t};return p.then=function(p,c){var d=a(e),h=function(){function e(t){var o,i=0;try{if(t&&(r(t)||n(t))&&n(o=t.then)){if(t===d)throw new TypeError;o.call(t,function(){i++||e.apply(s,arguments)},function(e){i++||d(!1,[e])})}else d(!0,arguments)}catch(a){i++||d(!1,[a])}}try{var i=t?p:c;n(i)?e(i.apply(s,o||[])):d(t,o)}catch(a){d(!1,[a])}};return null!=t?i(h):u.push(h),d},e&&(p=e(p)),p}}([e,"exports"])}).call(t,o(4)(e),o(5).setImmediate,o(6))},function(e,t){e.exports=function(e){return e.webpackPolyfill||(e.deprecate=function(){},e.paths=[],e.children=[],e.webpackPolyfill=1),e}},function(e,t,o){(function(e,n){function r(e,t){this._id=e,this._clearFn=t}var i=o(6).nextTick,s=Function.prototype.apply,a=Array.prototype.slice,u={},p=0;t.setTimeout=function(){return new r(s.call(setTimeout,window,arguments),clearTimeout)},t.setInterval=function(){return new r(s.call(setInterval,window,arguments),clearInterval)},t.clearTimeout=t.clearInterval=function(e){e.close()},r.prototype.unref=r.prototype.ref=function(){},r.prototype.close=function(){this._clearFn.call(window,this._id)},t.enroll=function(e,t){clearTimeout(e._idleTimeoutId),e._idleTimeout=t},t.unenroll=function(e){clearTimeout(e._idleTimeoutId),e._idleTimeout=-1},t._unrefActive=t.active=function(e){clearTimeout(e._idleTimeoutId);var t=e._idleTimeout;t>=0&&(e._idleTimeoutId=setTimeout(function(){e._onTimeout&&e._onTimeout()},t))},t.setImmediate="function"==typeof e?e:function(e){var o=p++,n=arguments.length<2?!1:a.call(arguments,1);return u[o]=!0,i(function(){u[o]&&(n?e.apply(null,n):e.call(null),t.clearImmediate(o))}),o},t.clearImmediate="function"==typeof n?n:function(e){delete u[e]}}).call(t,o(5).setImmediate,o(5).clearImmediate)},function(e,t){function o(){p=!1,s.length?u=s.concat(u):c=-1,u.length&&n()}function n(){if(!p){var e=setTimeout(o);p=!0;for(var t=u.length;t;){for(s=u,u=[];++c<t;)s&&s[c].run();c=-1,t=u.length}s=null,p=!1,clearTimeout(e)}}function r(e,t){this.fun=e,this.array=t}function i(){}var s,a=e.exports={},u=[],p=!1,c=-1;a.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var o=1;o<arguments.length;o++)t[o-1]=arguments[o];u.push(new r(e,t)),1!==u.length||p||setTimeout(n,0)},r.prototype.run=function(){this.fun.apply(null,this.array)},a.title="browser",a.browser=!0,a.env={},a.argv=[],a.version="",a.versions={},a.on=i,a.addListener=i,a.once=i,a.off=i,a.removeListener=i,a.removeAllListeners=i,a.emit=i,a.binding=function(e){throw new Error("process.binding is not supported")},a.cwd=function(){return"/"},a.chdir=function(e){throw new Error("process.chdir is not supported")},a.umask=function(){return 0}},function(e,t){"use strict";var o=Object.prototype.hasOwnProperty,n=Object.prototype.toString,r=function(e){return"function"==typeof Array.isArray?Array.isArray(e):"[object Array]"===n.call(e)},i=function(e){if(!e||"[object Object]"!==n.call(e))return!1;var t=o.call(e,"constructor"),r=e.constructor&&e.constructor.prototype&&o.call(e.constructor.prototype,"isPrototypeOf");if(e.constructor&&!t&&!r)return!1;var i;for(i in e);return"undefined"==typeof i||o.call(e,i)};e.exports=function s(){var e,t,o,n,a,u,p=arguments[0],c=1,d=arguments.length,h=!1;for("boolean"==typeof p?(h=p,p=arguments[1]||{},c=2):("object"!=typeof p&&"function"!=typeof p||null==p)&&(p={});d>c;++c)if(e=arguments[c],null!=e)for(t in e)o=p[t],n=e[t],p!==n&&(h&&n&&(i(n)||(a=r(n)))?(a?(a=!1,u=o&&r(o)?o:[]):u=o&&i(o)?o:{},p[t]=s(h,u,n)):"undefined"!=typeof n&&(p[t]=n));return p}}])});
//# sourceMappingURL=ingest.js.map