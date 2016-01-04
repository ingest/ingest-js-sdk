!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.IngestAPI=t():e.IngestAPI=t()}(this,function(){return function(e){function t(r){if(o[r])return o[r].exports;var n=o[r]={exports:{},id:r,loaded:!1};return e[r].call(n.exports,n,n.exports,t),n.loaded=!0,n.exports}var o={};return t.m=e,t.c=o,t.p="",t(0)}([function(e,t,o){e.exports=o(1)},function(e,t,o){function r(e){this.defaults={host:"https://api.ingest.io",networks:"/networks",networksKeys:"/networks/keys",networksKeysById:"/networks/keys/<%=id%>",inputs:"/encoding/inputs",inputsById:"/encoding/inputs/<%=id%>",inputsUpload:"/encoding/inputs/<%=id%>/upload<%=method%>",inputsUploadSign:"/encoding/inputs/<%=id%>/upload/sign<%=method%>",inputsUploadComplete:"/encoding/inputs/<%=id%>/upload/complete",inputsUploadAbort:"/encoding/inputs/<%=id%>/upload/abort",uploadMethods:{param:"?type=",singlePart:"amazon",multiPart:"amazonMP"},currentUserInfo:"/users/me"},this.config=s(!0,{},this.defaults,e),this.token=null,this.config.token&&this.setToken(this.config.token),this.request=n,this.JWTUtils=i,this.utils=a,this.resource=u,this.videos=new u({host:this.config.host,resource:"videos",tokenSource:this.getToken.bind(this)}),this.playlists=new u({host:this.config.host,resource:"playlists",tokenSource:this.getToken.bind(this)})}var n=o(2),s=(o(3),o(7)),i=o(8),a=o(9),u=o(10);r.prototype.setToken=function(e){if("string"!=typeof e)throw new Error("IngestAPI requires an authentication token passed as a string.");this.token=e},r.prototype.getToken=function(){return this.token},r.prototype.signUploadBlob=function(e){var t,o,r=this.validateUploadObject(e),s="";return r.valid?(e.method||(s=this.config.uploadMethods.param+this.config.uploadMethods.singlePart),o={id:e.id,method:s},t=a.parseTokens(this.config.host+this.config.inputsUploadSign,o),new n({url:t,token:this.getToken(),method:"POST",data:e})):a.promisify(!1,r.message)},r.prototype._validateUploadIds=function(e){var t={valid:!0,message:""};return"object"!=typeof e&&(t.valid=!1,t.message="The passed value was not an object."),"string"!=typeof e.key&&(t.valid=!1,t.message="Missing or invalid property : key."),"string"!=typeof e.uploadId&&(t.valid=!1,t.message="Missing or invalid property : uploadId"),t},r.prototype.validateUploadObject=function(e){var t=this._validateUploadIds(e),o={valid:!0,message:""};return"object"!=typeof e&&(o.valid=!1,o.message="The passed value was not an object."),t.valid||(o=t),"string"!=typeof e.id&&(o.valid=!1,o.message="Missing or invalid property : id."),"number"!=typeof e.partNumber&&(o.valid=!1,o.message="Missing or invalid property : partNumber"),e.hasOwnProperty("method")&&"boolean"==typeof e.method||(o.valid=!1,o.message="Missing or invalid property : method"),!e.hasOwnProperty("method")||e.method||e.uploadId||(o.valid=!0,o.message=""),o},r.prototype.getInputs=function(e){return new n({url:this.config.host+this.config.inputs,token:this.getToken(),headers:e})},r.prototype.getInputsById=function(e){var t,o;return"string"!=typeof e?a.promisify(!1,"IngestAPI getInputsById requires a valid inputId as a string."):(o={id:e},t=a.parseTokens(this.config.host+this.config.inputsById,o),new n({url:t,token:this.getToken()}))},r.prototype.addInputs=function(e){return Array.isArray(e)?new n({url:this.config.host+this.config.inputs,token:this.getToken(),method:"POST",data:e}):a.promisify(!1,"IngestAPI addInput requires an array of input objects.")},r.prototype.deleteInput=function(e){var t,o;return"string"!=typeof e?a.promisify(!1,"IngestAPI deleteInput requires a video ID passed as a string."):(o={id:e},t=a.parseTokens(this.config.host+this.config.inputsById,o),new n({url:t,token:this.getToken(),method:"DELETE"}))},r.prototype.deleteInputs=function(e){var t;return Array.isArray(e)?(t=this.config.host+this.config.inputs,new n({url:t,token:this.getToken(),method:"DELETE",data:e})):a.promisify(!1,"IngestAPI deleteInputs requires an array of input Ids")},r.prototype.initializeInputUpload=function(e,t){var o,r,s="";return"string"!=typeof e?a.promisify(!1,"IngestAPI initializeUploadInput requires a valid input ID passed as a string."):"string"!=typeof t.type?a.promisify(!1,"Missing or invalid property : type."):"number"!=typeof t.size?a.promisify(!1,"Missing or invalid property : size"):(t.method||(s=this.config.uploadMethods.param+this.config.uploadMethods.singlePart),r={id:e,method:s},o=a.parseTokens(this.config.host+this.config.inputsUpload,r),new n({url:o,token:this.getToken(),method:"POST",data:t}))},r.prototype.completeInputUpload=function(e,t){var o,r,s=this._validateUploadIds(t);return"string"!=typeof e?a.promisify(!1,"IngestAPI initializeUploadInput requires a valid input ID passed as a string."):s.valid?(r={id:e},o=a.parseTokens(this.config.host+this.config.inputsUploadComplete,r),new n({url:o,token:this.getToken(),method:"POST",data:t})):a.promisify(!1,s.message)},r.prototype.abortInputUpload=function(e,t){var o,r,s=this._validateUploadIds(t);return"string"!=typeof e?a.promisify(!1,"IngestAPI initializeUploadInput requires a valid input ID passed as a string."):s.valid?(r={id:e},o=a.parseTokens(this.config.host+this.config.inputsUploadAbort,r),new n({url:o,token:this.getToken(),method:"POST",data:t})):a.promisify(!1,s.message)},r.prototype.getNetworkSecureKeys=function(){return new n({url:this.config.host+this.config.networksKeys,token:this.getToken()})},r.prototype.addNetworkSecureKey=function(e){return"object"!=typeof e?a.promisify(!1,"IngestAPI addNetworkSecureKey requires data to be passed as an object."):("string"!=typeof e.title&&(e.title=""),"string"!=typeof e.key?a.promisify(!1,"IngestAPI addNetworkSecureKey requires that the key be a string in RSA public key format."):new n({url:this.config.host+this.config.networksKeys,token:this.getToken(),method:"POST",data:e}))},r.prototype.getNetworkSecureKeyById=function(e){var t,o;return"string"!=typeof e?a.promisify(!1,"IngestAPI getNetworkSecureKeyById requires an id to be passed as a string."):(t={id:e},o=a.parseTokens(this.config.host+this.config.networksKeysById,t),new n({url:o,token:this.getToken()}))},r.prototype.updateNetworkSecureKey=function(e){var t,o;return"object"!=typeof e?a.promisify(!1,"IngestAPI updateNetworkSecureKeyById requires data to be passed as an object."):"string"!=typeof e.id?a.promisify(!1,'IngestAPI updateNetworkSecureKeyById requires a param "id" to be a string.'):("string"!=typeof e.title&&(e.title=""),t={id:e.id},o=a.parseTokens(this.config.host+this.config.networksKeysById,t),new n({url:o,token:this.getToken(),method:"PATCH",data:e}))},r.prototype.deleteNetworkSecureKeyById=function(e){var t,o;return"string"!=typeof e?a.promisify(!1,"IngestAPI deleteNetworkSecureKeyById requires an id to be passed as a string."):(t={id:e},o=a.parseTokens(this.config.host+this.config.networksKeysById,t),new n({url:o,token:this.getToken(),method:"DELETE"}))},r.prototype.getCurrentUserInfo=function(){return new n({url:this.config.host+this.config.currentUserInfo,token:this.getToken()})},e.exports=r},function(e,t,o){var r=o(3),n=o(7),s=o(8),i=[200,201,202,204],a=function(e){return this.defaults={async:!0,method:"GET"},this.promise=r(),this.request=new XMLHttpRequest,this.setupListeners(),this.options=n(!0,this.defaults,e),this.options.url?(this.makeRequest(),this.promise):(this.requestError("Request Error : a url is required to make the request."),this.promise)};a.prototype.setupListeners=function(){this.request.onreadystatechange=this.readyStateChange.bind(this)},a.prototype.makeRequest=function(){var e=this.preparePostData(this.options.data);if(!e.success)return void this.requestError("Request Error : error preparing post data.");if(this.request.open(this.options.method,this.options.url,this.options.async),this.options.headers&&this.applyRequestHeaders(this.options.headers),this.options.token){if(s.isExpired(this.options.token))return void this.requestError("Request Error : token is expired.");this.request.setRequestHeader("Authorization",this.options.token)}e.data?(this.request.setRequestHeader("Content-type","application/json; charset=utf-8"),this.request.send(e.data)):this.request.send()},a.prototype.preparePostData=function(e){var t={success:!0,data:e};if(e)try{t.data=JSON.stringify(e)}catch(o){t.success=!1,t.data=null}return t},a.prototype.applyRequestHeaders=function(e){var t,o,r=Object.keys(e),n=r.length;for(o=0;n>o;o++)t=r[o],this.request.setRequestHeader(t,e[t])},a.prototype.requestComplete=function(e){this.response=this.processResponse(e),this.promise(!this.response.data.error,[this.response])},a.prototype.processResponse=function(e){var t=this.request.getResponseHeader("Content-Type"),o=e;if(t&&-1!==t.indexOf("application/json"))try{o=JSON.parse(e)}catch(r){o={error:"JSON parsing failed. "+r.stack}}return{data:o,headers:this.request.getResponseHeader.bind(this.request),statusCode:this.request.status}},a.prototype.requestError=function(e){this.promise(!1,[e])},a.prototype.readyStateChange=function(){4===this.request.readyState&&(this.isValidResponseCode(this.request.status)?this.requestComplete(this.request.responseText):this.requestError("Invalid response code."))},a.prototype.isValidResponseCode=function(e){var t,o=!1,r=i.length;for(t=0;r>t;t++)if(e===i[t]){o=!0;break}return o},e.exports=a},function(e,t,o){(function(e,t,o){!function(e){function r(e){return"function"==typeof e}function n(e){return"object"==typeof e}function s(e){"undefined"!=typeof t?t(e):"undefined"!=typeof o&&o.nextTick?o.nextTick(e):setTimeout(e,0)}var i;e[0][e[1]]=function a(e){var t,o=[],u=[],p=function(e,r){return null==t&&null!=e&&(t=e,o=r,u.length&&s(function(){for(var e=0;e<u.length;e++)u[e]()})),t};return p.then=function(p,c){var d=a(e),h=function(){function e(t){var o,s=0;try{if(t&&(n(t)||r(t))&&r(o=t.then)){if(t===d)throw new TypeError;o.call(t,function(){s++||e.apply(i,arguments)},function(e){s++||d(!1,[e])})}else d(!0,arguments)}catch(a){s++||d(!1,[a])}}try{var s=t?p:c;r(s)?e(s.apply(i,o||[])):d(t,o)}catch(a){d(!1,[a])}};return null!=t?s(h):u.push(h),d},e&&(p=e(p)),p}}([e,"exports"])}).call(t,o(4)(e),o(5).setImmediate,o(6))},function(e,t){e.exports=function(e){return e.webpackPolyfill||(e.deprecate=function(){},e.paths=[],e.children=[],e.webpackPolyfill=1),e}},function(e,t,o){(function(e,r){function n(e,t){this._id=e,this._clearFn=t}var s=o(6).nextTick,i=Function.prototype.apply,a=Array.prototype.slice,u={},p=0;t.setTimeout=function(){return new n(i.call(setTimeout,window,arguments),clearTimeout)},t.setInterval=function(){return new n(i.call(setInterval,window,arguments),clearInterval)},t.clearTimeout=t.clearInterval=function(e){e.close()},n.prototype.unref=n.prototype.ref=function(){},n.prototype.close=function(){this._clearFn.call(window,this._id)},t.enroll=function(e,t){clearTimeout(e._idleTimeoutId),e._idleTimeout=t},t.unenroll=function(e){clearTimeout(e._idleTimeoutId),e._idleTimeout=-1},t._unrefActive=t.active=function(e){clearTimeout(e._idleTimeoutId);var t=e._idleTimeout;t>=0&&(e._idleTimeoutId=setTimeout(function(){e._onTimeout&&e._onTimeout()},t))},t.setImmediate="function"==typeof e?e:function(e){var o=p++,r=arguments.length<2?!1:a.call(arguments,1);return u[o]=!0,s(function(){u[o]&&(r?e.apply(null,r):e.call(null),t.clearImmediate(o))}),o},t.clearImmediate="function"==typeof r?r:function(e){delete u[e]}}).call(t,o(5).setImmediate,o(5).clearImmediate)},function(e,t){function o(){p=!1,i.length?u=i.concat(u):c=-1,u.length&&r()}function r(){if(!p){var e=setTimeout(o);p=!0;for(var t=u.length;t;){for(i=u,u=[];++c<t;)i&&i[c].run();c=-1,t=u.length}i=null,p=!1,clearTimeout(e)}}function n(e,t){this.fun=e,this.array=t}function s(){}var i,a=e.exports={},u=[],p=!1,c=-1;a.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var o=1;o<arguments.length;o++)t[o-1]=arguments[o];u.push(new n(e,t)),1!==u.length||p||setTimeout(r,0)},n.prototype.run=function(){this.fun.apply(null,this.array)},a.title="browser",a.browser=!0,a.env={},a.argv=[],a.version="",a.versions={},a.on=s,a.addListener=s,a.once=s,a.off=s,a.removeListener=s,a.removeAllListeners=s,a.emit=s,a.binding=function(e){throw new Error("process.binding is not supported")},a.cwd=function(){return"/"},a.chdir=function(e){throw new Error("process.chdir is not supported")},a.umask=function(){return 0}},function(e,t){"use strict";var o=Object.prototype.hasOwnProperty,r=Object.prototype.toString,n=function(e){return"function"==typeof Array.isArray?Array.isArray(e):"[object Array]"===r.call(e)},s=function(e){if(!e||"[object Object]"!==r.call(e))return!1;var t=o.call(e,"constructor"),n=e.constructor&&e.constructor.prototype&&o.call(e.constructor.prototype,"isPrototypeOf");if(e.constructor&&!t&&!n)return!1;var s;for(s in e);return"undefined"==typeof s||o.call(e,s)};e.exports=function i(){var e,t,o,r,a,u,p=arguments[0],c=1,d=arguments.length,h=!1;for("boolean"==typeof p?(h=p,p=arguments[1]||{},c=2):("object"!=typeof p&&"function"!=typeof p||null==p)&&(p={});d>c;++c)if(e=arguments[c],null!=e)for(t in e)o=p[t],r=e[t],p!==r&&(h&&r&&(s(r)||(a=n(r)))?(a?(a=!1,u=o&&n(o)?o:[]):u=o&&s(o)?o:{},p[t]=i(h,u,r)):"undefined"!=typeof r&&(p[t]=r));return p}},function(e,t){var o=function(e){var t=e.split(".");if(t.length<=1)return!1;var o=window.atob(t[1]);return o=JSON.parse(o)};e.exports.isExpired=function(e){var t,r,n,s;return t=o(e),n=!0,t?(r=t.exp,s=new Date,s=s.getTime()/1e3,r?(r>s&&(n=!1),n):n):n}},function(e,t,o){var r=o(3),n={};n.parseTokens=function(e,t){if(!e)return null;var o,r=Object.keys(t),n=r.length;for(o=0;n>o;o++)e=e.replace("<%="+r[o]+"%>",t[r[o]]);return e},n.promisify=function(e,t){var o=r();return o(e,[t]),o},e.exports=n},function(e,t,o){function r(e){this.defaults={host:"https://api.ingest.io",all:"/<%=resource%>",byId:"/<%=resource%>/<%=id%>",thumbnails:"/<%=resource%>/<%=id%>/thumbnails",trash:"/<%=resource%>?filter=trashed",deleteMethods:{permanent:"?permanent=1"},search:"/<%=resource%>?search=<%=input%>",tokenSource:null,resource:null},this.config=s(!0,{},this.defaults,e)}var n=o(2),s=(o(3),o(7)),i=o(9);r.prototype._tokenSource=function(){var e=null;return this.config.tokenSource&&(e=this.config.tokenSource.call()),e},r.prototype.getAll=function(e){var t=i.parseTokens(this.config.host+this.config.all,{resource:this.config.resource});return new n({url:t,token:this._tokenSource(),headers:e})},r.prototype.getById=function(e){var t;return"string"!=typeof e?i.promisify(!1,"IngestAPI Resource getById requires a valid id passed as a string."):(t=i.parseTokens(this.config.host+this.config.byId,{resource:this.config.resource,id:e}),new n({url:t,token:this._tokenSource()}))},r.prototype.getTrashed=function(e){var t=i.parseTokens(this.config.host+this.config.trash,{resource:this.config.resource});return new n({url:t,token:this._tokenSource(),headers:e})},r.prototype.getThumbnails=function(e){var t;return"string"!=typeof e?i.promisify(!1,"IngestAPI Resource getThumbnails requires an id to be passed as a string."):(t=i.parseTokens(this.config.host+this.config.thumbnails,{resource:this.config.resource,id:e}),new n({url:t,token:this._tokenSource()}))},r.prototype.add=function(e){var t;return"object"!=typeof e?i.promisify(!1,"IngestAPI Resource add requires a resource passed as an object."):(t=i.parseTokens(this.config.host+this.config.all,{resource:this.config.resource}),new n({url:t,token:this._tokenSource(),method:"POST",data:e}))},r.prototype.update=function(e){return"object"!=typeof e?i.promisify(!1,"IngestAPI Resource update requires a resource to be passed either as an object or an array of objects."):Array.isArray(e)?this._updateResourceArray(e):this._updateResource(e)},r.prototype._updateResource=function(e){var t=i.parseTokens(this.config.host+this.config.byId,{resource:this.config.resource,id:e.id});return new n({url:t,token:this._tokenSource(),method:"PATCH",data:e})},r.prototype._updateResourceArray=function(e){var t=i.parseTokens(this.config.host+this.config.all,{resource:this.config.resource});return new n({url:t,token:this._tokenSource(),method:"PATCH",data:e})},r.prototype["delete"]=function(e){return"string"!=typeof e?Array.isArray(e)?this._deleteResourceArray(e):i.promisify(!1,"IngestAPI Resource delete requires a resource to be passed either as a string or an array of strings."):this._deleteResource(e)},r.prototype.permanentDelete=function(e){return"string"!=typeof e?Array.isArray(e)?this._deleteResourceArray(e,!0):i.promisify(!1,"IngestAPI Resource delete requires a resource to be passed either as a string or an array of strings."):this._deleteResource(e,!0)},r.prototype._deleteResource=function(e,t){var o=i.parseTokens(this.config.host+this.config.byId,{resource:this.config.resource,id:e});return t===!0&&(o+=this.config.deleteMethods.permanent),new n({url:o,token:this._tokenSource(),method:"DELETE"})},r.prototype._deleteResourceArray=function(e,t){var o=i.parseTokens(this.config.host+this.config.all,{resource:this.config.resource});return t===!0&&(o+=this.config.deleteMethods.permanent),new n({url:o,token:this._tokenSource(),method:"DELETE",data:e})},r.prototype.search=function(e,t){var o;return"string"!=typeof e?i.promisify(!1,"IngestAPI Resource search requires search input to be passed as a string."):(o=i.parseTokens(this.config.host+this.config.search,{resource:this.config.resource,input:e}),new n({url:o,token:this._tokenSource(),headers:t}))},r.prototype.count=function(){var e=i.parseTokens(this.config.host+this.config.all,{resource:this.config.resource});return new n({url:e,token:this._tokenSource(),method:"HEAD"}).then(this._handleCountResponse)},r.prototype.trashCount=function(){var e=i.parseTokens(this.config.host+this.config.trash,{resource:this.config.resource});return new n({url:e,token:this._tokenSource(),method:"HEAD"}).then(this._handleCountResponse)},r.prototype._handleCountResponse=function(e){return parseInt(e.headers("Resource-Count"),10)},e.exports=r}])});
//# sourceMappingURL=ingest.js.map