!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.IngestAPI=t():e.IngestAPI=t()}(this,function(){return function(e){function t(r){if(o[r])return o[r].exports;var i=o[r]={exports:{},id:r,loaded:!1};return e[r].call(i.exports,i,i.exports,t),i.loaded=!0,i.exports}var o={};return t.m=e,t.c=o,t.p="",t(0)}([function(e,t,o){e.exports=o(1)},function(e,t,o){function r(e){this.defaults={host:"https://api.ingest.io",networks:"/networks",networksKeys:"/networks/keys",networksKeysById:"/networks/keys/<%=id%>",inputs:"/encoding/inputs",inputsById:"/encoding/inputs/<%=id%>",inputsUpload:"/encoding/inputs/<%=id%>/upload<%=method%>",inputsUploadSign:"/encoding/inputs/<%=id%>/upload/sign<%=method%>",inputsUploadComplete:"/encoding/inputs/<%=id%>/upload/complete",inputsUploadAbort:"/encoding/inputs/<%=id%>/upload/abort",uploadMethods:{param:"?type=",singlePart:"amazon",multiPart:"amazonMP"},currentUserInfo:"/users/me"},this.config=n(!0,{},this.defaults,e),this.token=null,this.config.token&&this.setToken(this.config.token),this.request=i,this.JWTUtils=s,this.utils=u,this.resource=a,this.uploader=p,this.videos=new a({host:this.config.host,resource:"videos",tokenSource:this.getToken.bind(this)}),this.playlists=new a({host:this.config.host,resource:"playlists",tokenSource:this.getToken.bind(this)}),this.inputs=new a({host:this.config.host,resource:"encoding/inputs",tokenSource:this.getToken.bind(this)})}var i=o(2),n=(o(3),o(7)),s=o(8),u=o(9),a=o(10),p=o(11);r.prototype.setToken=function(e){if("string"!=typeof e)throw new Error("IngestAPI requires an authentication token passed as a string.");this.token=e},r.prototype.getToken=function(){return this.token},r.prototype.getNetworkSecureKeys=function(){return new i({url:this.config.host+this.config.networksKeys,token:this.getToken()})},r.prototype.addNetworkSecureKey=function(e){return"object"!=typeof e?u.promisify(!1,"IngestAPI addNetworkSecureKey requires data to be passed as an object."):("string"!=typeof e.title&&(e.title=""),"string"!=typeof e.key?u.promisify(!1,"IngestAPI addNetworkSecureKey requires that the key be a string in RSA public key format."):new i({url:this.config.host+this.config.networksKeys,token:this.getToken(),method:"POST",data:e}))},r.prototype.getNetworkSecureKeyById=function(e){var t,o;return"string"!=typeof e?u.promisify(!1,"IngestAPI getNetworkSecureKeyById requires an id to be passed as a string."):(t={id:e},o=u.parseTokens(this.config.host+this.config.networksKeysById,t),new i({url:o,token:this.getToken()}))},r.prototype.updateNetworkSecureKey=function(e){var t,o;return"object"!=typeof e?u.promisify(!1,"IngestAPI updateNetworkSecureKeyById requires data to be passed as an object."):"string"!=typeof e.id?u.promisify(!1,'IngestAPI updateNetworkSecureKeyById requires a param "id" to be a string.'):("string"!=typeof e.title&&(e.title=""),t={id:e.id},o=u.parseTokens(this.config.host+this.config.networksKeysById,t),new i({url:o,token:this.getToken(),method:"PATCH",data:e}))},r.prototype.deleteNetworkSecureKeyById=function(e){var t,o;return"string"!=typeof e?u.promisify(!1,"IngestAPI deleteNetworkSecureKeyById requires an id to be passed as a string."):(t={id:e},o=u.parseTokens(this.config.host+this.config.networksKeysById,t),new i({url:o,token:this.getToken(),method:"DELETE"}))},r.prototype.getCurrentUserInfo=function(){return new i({url:this.config.host+this.config.currentUserInfo,token:this.getToken()})},r.prototype.upload=function(e){return new p({file:e,api:this,host:this.config.host})},e.exports=r},function(e,t,o){var r=o(3),i=o(7),n=o(8),s=[200,201,202,204],u=function(e){return this.defaults={async:!0,method:"GET"},this.promise=r(),this.request=new XMLHttpRequest,this.setupListeners(),this.options=i(!0,this.defaults,e),this.options.url?(this.makeRequest(),this.promise):(this.requestError("Request Error : a url is required to make the request."),this.promise)};u.prototype.setupListeners=function(){this.request.onreadystatechange=this.readyStateChange.bind(this)},u.prototype.makeRequest=function(){var e=this.preparePostData(this.options.data),t=this.options.headers,o=t&&t.hasOwnProperty("Content-Type");if(!e.success)return void this.requestError("Request Error : error preparing post data.");if(this.request.open(this.options.method,this.options.url,this.options.async),t&&this.applyRequestHeaders(t),this.options.token){if(n.isExpired(this.options.token))return void this.requestError("Request Error : token is expired.");this.request.setRequestHeader("Authorization",this.options.token)}e.data&&"JSON"===e.type&&!o&&this.request.setRequestHeader("Content-Type","application/json; charset=utf-8"),e.data?this.request.send(e.data):this.request.send()},u.prototype.preparePostData=function(e){var t={success:!0,data:e,type:"JSON"};if(e instanceof FormData)return t.type="FormData",t;if(e)try{t.data=JSON.stringify(e)}catch(o){t.success=!1,t.data=null}return t},u.prototype.applyRequestHeaders=function(e){var t,o,r=Object.keys(e),i=r.length;for(o=0;i>o;o++)t=r[o],this.request.setRequestHeader(t,e[t])},u.prototype.requestComplete=function(e){this.response=this.processResponse(e),this.promise(!this.response.data.error,[this.response])},u.prototype.processResponse=function(e){var t=this.request.getResponseHeader("Content-Type"),o=e;if(t&&-1!==t.indexOf("application/json"))try{o=JSON.parse(e)}catch(r){o={error:"JSON parsing failed. "+r.stack}}return{data:o,headers:this.request.getResponseHeader.bind(this.request),statusCode:this.request.status}},u.prototype.requestError=function(e){this.promise(!1,[e])},u.prototype.readyStateChange=function(){4===this.request.readyState&&(this.isValidResponseCode(this.request.status)?this.requestComplete(this.request.responseText):this.requestError("Invalid response code."))},u.prototype.isValidResponseCode=function(e){var t,o=!1,r=s.length;for(t=0;r>t;t++)if(e===s[t]){o=!0;break}return o},e.exports=u},function(e,t,o){(function(e,t,o){!function(e){function r(e){return"function"==typeof e}function i(e){return"object"==typeof e}function n(e){"undefined"!=typeof t?t(e):"undefined"!=typeof o&&o.nextTick?o.nextTick(e):setTimeout(e,0)}var s;e[0][e[1]]=function u(e){var t,o=[],a=[],p=function(e,r){return null==t&&null!=e&&(t=e,o=r,a.length&&n(function(){for(var e=0;e<a.length;e++)a[e]()})),t};return p.then=function(p,c){var h=u(e),d=function(){function e(t){var o,n=0;try{if(t&&(i(t)||r(t))&&r(o=t.then)){if(t===h)throw new TypeError;o.call(t,function(){n++||e.apply(s,arguments)},function(e){n++||h(!1,[e])})}else h(!0,arguments)}catch(u){n++||h(!1,[u])}}try{var n=t?p:c;r(n)?e(n.apply(s,o||[])):h(t,o)}catch(u){h(!1,[u])}};return null!=t?n(d):a.push(d),h},e&&(p=e(p)),p}}([e,"exports"])}).call(t,o(4)(e),o(5).setImmediate,o(6))},function(e,t){e.exports=function(e){return e.webpackPolyfill||(e.deprecate=function(){},e.paths=[],e.children=[],e.webpackPolyfill=1),e}},function(e,t,o){(function(e,r){function i(e,t){this._id=e,this._clearFn=t}var n=o(6).nextTick,s=Function.prototype.apply,u=Array.prototype.slice,a={},p=0;t.setTimeout=function(){return new i(s.call(setTimeout,window,arguments),clearTimeout)},t.setInterval=function(){return new i(s.call(setInterval,window,arguments),clearInterval)},t.clearTimeout=t.clearInterval=function(e){e.close()},i.prototype.unref=i.prototype.ref=function(){},i.prototype.close=function(){this._clearFn.call(window,this._id)},t.enroll=function(e,t){clearTimeout(e._idleTimeoutId),e._idleTimeout=t},t.unenroll=function(e){clearTimeout(e._idleTimeoutId),e._idleTimeout=-1},t._unrefActive=t.active=function(e){clearTimeout(e._idleTimeoutId);var t=e._idleTimeout;t>=0&&(e._idleTimeoutId=setTimeout(function(){e._onTimeout&&e._onTimeout()},t))},t.setImmediate="function"==typeof e?e:function(e){var o=p++,r=arguments.length<2?!1:u.call(arguments,1);return a[o]=!0,n(function(){a[o]&&(r?e.apply(null,r):e.call(null),t.clearImmediate(o))}),o},t.clearImmediate="function"==typeof r?r:function(e){delete a[e]}}).call(t,o(5).setImmediate,o(5).clearImmediate)},function(e,t){function o(){p=!1,s.length?a=s.concat(a):c=-1,a.length&&r()}function r(){if(!p){var e=setTimeout(o);p=!0;for(var t=a.length;t;){for(s=a,a=[];++c<t;)s&&s[c].run();c=-1,t=a.length}s=null,p=!1,clearTimeout(e)}}function i(e,t){this.fun=e,this.array=t}function n(){}var s,u=e.exports={},a=[],p=!1,c=-1;u.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var o=1;o<arguments.length;o++)t[o-1]=arguments[o];a.push(new i(e,t)),1!==a.length||p||setTimeout(r,0)},i.prototype.run=function(){this.fun.apply(null,this.array)},u.title="browser",u.browser=!0,u.env={},u.argv=[],u.version="",u.versions={},u.on=n,u.addListener=n,u.once=n,u.off=n,u.removeListener=n,u.removeAllListeners=n,u.emit=n,u.binding=function(e){throw new Error("process.binding is not supported")},u.cwd=function(){return"/"},u.chdir=function(e){throw new Error("process.chdir is not supported")},u.umask=function(){return 0}},function(e,t){"use strict";var o=Object.prototype.hasOwnProperty,r=Object.prototype.toString,i=function(e){return"function"==typeof Array.isArray?Array.isArray(e):"[object Array]"===r.call(e)},n=function(e){if(!e||"[object Object]"!==r.call(e))return!1;var t=o.call(e,"constructor"),i=e.constructor&&e.constructor.prototype&&o.call(e.constructor.prototype,"isPrototypeOf");if(e.constructor&&!t&&!i)return!1;var n;for(n in e);return"undefined"==typeof n||o.call(e,n)};e.exports=function s(){var e,t,o,r,u,a,p=arguments[0],c=1,h=arguments.length,d=!1;for("boolean"==typeof p?(d=p,p=arguments[1]||{},c=2):("object"!=typeof p&&"function"!=typeof p||null==p)&&(p={});h>c;++c)if(e=arguments[c],null!=e)for(t in e)o=p[t],r=e[t],p!==r&&(d&&r&&(n(r)||(u=i(r)))?(u?(u=!1,a=o&&i(o)?o:[]):a=o&&n(o)?o:{},p[t]=s(d,a,r)):"undefined"!=typeof r&&(p[t]=r));return p}},function(e,t){var o=function(e){var t=e.split(".");if(t.length<=1)return!1;var o=window.atob(t[1]);return o=JSON.parse(o)};e.exports.isExpired=function(e){var t,r,i,n;return t=o(e),i=!0,t?(r=t.exp,n=new Date,n=n.getTime()/1e3,r?(r>n&&(i=!1),i):i):i}},function(e,t,o){var r=o(3),i={};i.parseTokens=function(e,t){if(!e)return null;var o,r=Object.keys(t),i=r.length;for(o=0;i>o;o++)e=e.replace("<%="+r[o]+"%>",t[r[o]]);return e},i.promisify=function(e,t){var o=r();return o(e,[t]),o},i.series=function(e,t){var o=e.length,n=r(),s={total:o,complete:0,responses:[],promises:e,paused:!0};return n.pause=i._seriesPause.bind(void 0,n,s),n.resume=i._seriesResume.bind(void 0,n,s),t||(s.paused=!1,i._seriesCallPromise(e[0],s,n)),n},i._seriesCallPromise=function(e,t,o){t.paused||e().then(i._seriesComplete.bind(void 0,o,t),i._seriesError.bind(void 0,o,t))},i._seriesComplete=function(e,t,o){t.complete++,t.responses.push(o),t.complete>=t.total?e(!0,t.responses):t.paused||i._seriesCallPromise(t.promises[t.complete],t,e)},i._seriesError=function(e,t,o){e(!1,[o])},i._seriesPause=function(e,t){t.paused=!0},i._seriesResume=function(e,t){t.paused=!1,t.complete!==t.total&&i._seriesCallPromise(t.promises[t.complete],t,e)},e.exports=i},function(e,t,o){function r(e){this.defaults={host:"https://api.ingest.io",all:"/<%=resource%>",byId:"/<%=resource%>/<%=id%>",thumbnails:"/<%=resource%>/<%=id%>/thumbnails",trash:"/<%=resource%>?filter=trashed",deleteMethods:{permanent:"?permanent=1"},search:"/<%=resource%>?search=<%=input%>",tokenSource:null,resource:null},this.config=n(!0,{},this.defaults,e)}var i=o(2),n=(o(3),o(7)),s=o(9);r.prototype._tokenSource=function(){var e=null;return this.config.tokenSource&&(e=this.config.tokenSource.call()),e},r.prototype.getAll=function(e){var t=s.parseTokens(this.config.host+this.config.all,{resource:this.config.resource});return new i({url:t,token:this._tokenSource(),headers:e})},r.prototype.getById=function(e){var t;return"string"!=typeof e?s.promisify(!1,"IngestAPI Resource getById requires a valid id passed as a string."):(t=s.parseTokens(this.config.host+this.config.byId,{resource:this.config.resource,id:e}),new i({url:t,token:this._tokenSource()}))},r.prototype.getTrashed=function(e){var t=s.parseTokens(this.config.host+this.config.trash,{resource:this.config.resource});return new i({url:t,token:this._tokenSource(),headers:e})},r.prototype.getThumbnails=function(e){var t;return"string"!=typeof e?s.promisify(!1,"IngestAPI Resource getThumbnails requires an id to be passed as a string."):(t=s.parseTokens(this.config.host+this.config.thumbnails,{resource:this.config.resource,id:e}),new i({url:t,token:this._tokenSource()}))},r.prototype.add=function(e){var t;return"object"!=typeof e?s.promisify(!1,"IngestAPI Resource add requires a resource passed as an object."):(t=s.parseTokens(this.config.host+this.config.all,{resource:this.config.resource}),new i({url:t,token:this._tokenSource(),method:"POST",data:e}))},r.prototype.update=function(e){return"object"!=typeof e?s.promisify(!1,"IngestAPI Resource update requires a resource to be passed either as an object or an array of objects."):Array.isArray(e)?this._updateResourceArray(e):this._updateResource(e)},r.prototype._updateResource=function(e){var t=s.parseTokens(this.config.host+this.config.byId,{resource:this.config.resource,id:e.id});return new i({url:t,token:this._tokenSource(),method:"PATCH",data:e})},r.prototype._updateResourceArray=function(e){var t=s.parseTokens(this.config.host+this.config.all,{resource:this.config.resource});return new i({url:t,token:this._tokenSource(),method:"PATCH",data:e})},r.prototype["delete"]=function(e){return"string"!=typeof e?Array.isArray(e)?this._deleteResourceArray(e):s.promisify(!1,"IngestAPI Resource delete requires a resource to be passed either as a string or an array of strings."):this._deleteResource(e)},r.prototype.permanentDelete=function(e){return"string"!=typeof e?Array.isArray(e)?this._deleteResourceArray(e,!0):s.promisify(!1,"IngestAPI Resource delete requires a resource to be passed either as a string or an array of strings."):this._deleteResource(e,!0)},r.prototype._deleteResource=function(e,t){var o=s.parseTokens(this.config.host+this.config.byId,{resource:this.config.resource,id:e});return t===!0&&(o+=this.config.deleteMethods.permanent),new i({url:o,token:this._tokenSource(),method:"DELETE"})},r.prototype._deleteResourceArray=function(e,t){var o=s.parseTokens(this.config.host+this.config.all,{resource:this.config.resource});return t===!0&&(o+=this.config.deleteMethods.permanent),new i({url:o,token:this._tokenSource(),method:"DELETE",data:e})},r.prototype.search=function(e,t){var o;return"string"!=typeof e?s.promisify(!1,"IngestAPI Resource search requires search input to be passed as a string."):(o=s.parseTokens(this.config.host+this.config.search,{resource:this.config.resource,input:e}),new i({url:o,token:this._tokenSource(),headers:t}))},r.prototype.count=function(){var e=s.parseTokens(this.config.host+this.config.all,{resource:this.config.resource});return new i({url:e,token:this._tokenSource(),method:"HEAD"}).then(this._handleCountResponse)},r.prototype.trashCount=function(){var e=s.parseTokens(this.config.host+this.config.trash,{resource:this.config.resource});return new i({url:e,token:this._tokenSource(),method:"HEAD"}).then(this._handleCountResponse)},r.prototype._handleCountResponse=function(e){return parseInt(e.headers("Resource-Count"),10)},e.exports=r},function(e,t,o){function r(e){this.defaults={api:null,file:null,upload:"/encoding/inputs/<%=id%>/upload<%=method%>",sign:"/encoding/inputs/<%=id%>/upload/sign<%=method%>",uploadComplete:"/encoding/inputs/<%=id%>/upload/complete",uploadAbort:"/encoding/inputs/<%=id%>/upload/abort",uploadMethods:{param:"?type=",singlePart:"amazon",multiPart:"amazonMP"}},this.config=n(!0,{},this.defaults,e),this.api=this.config.api,this.file=this.config.file,this.chunks=[],this.chunkSize=0,this.chunkCount=0,this.chunksComplete=0,this.aborted=!1,this.paused=!1,this.fileRecord={filename:this.file.name,type:this.file.type,size:this.file.size,method:this._checkMultipart(this.file)}}var i=o(2),n=(o(3),o(7)),s=o(9);o(8);r.prototype.progress=function(e){this.config.progress=e.bind(this)},r.prototype.save=function(){return this._create(this.fileRecord).then(this._initialize.bind(this)).then(this._prepareUpload.bind(this))},r.prototype._updateProgress=function(e){this.config.progress&&this.config.progress.call(this,e)},r.prototype._create=function(e){return this.aborted?void 0:this.api.inputs.add([e]).then(this._createSuccess.bind(this))},r.prototype._createSuccess=function(e){return this._updateProgress(0),this.fileRecord.id=e.data[0].id,this.fileRecord.id},r.prototype._initialize=function(){var e,t,o="";return this.aborted?void 0:(this.fileRecord.method||(o=this.config.uploadMethods.param+this.config.uploadMethods.singlePart),t={id:this.fileRecord.id,method:o},e=s.parseTokens(this.api.config.host+this.config.upload,t),new i({url:e,token:this.api.getToken(),method:"POST",data:this.fileRecord}).then(this._initializeComplete.bind(this)))},r.prototype._initializeComplete=function(e){this.fileRecord.key=e.data.key,this.fileRecord.uploadId=e.data.uploadId,this.chunkSize=e.data.pieceSize,this.chunkCount=e.data.pieceCount},r.prototype._prepareUpload=function(){return this.fileRecord.method?this._createChunks().then(this._completeUpload.bind(this)):this._uploadFile().then(this._onCompleteUpload.bind(this))},r.prototype._createChunks=function(){var e,t,o,r=this._getSliceMethod(this.file),i=[];if(this.aborted)return void this.abort();for(e=0;e<this.chunkCount-1;e++)t=this.file[r](e*this.chunkSize,(e+1)*this.chunkSize),o={partNumber:e+1,data:t},this.chunks.push(o),i.push(this._uploadChunk.bind(this,o));return this.currentUpload=s.series(i,this.paused),this.currentUpload},r.prototype._uploadChunk=function(e){return this._signUpload(e).then(this._sendUpload.bind(this,e)).then(this._completeChunk.bind(this,e))},r.prototype._uploadFile=function(){var e={data:this.file};return this._signUpload(e).then(this._sendUpload.bind(this,e)).then(this._updateProgress.bind(this,100))},r.prototype._signUpload=function(e){var t,o="",r={};return e.partNumber&&(this.fileRecord.partNumber=e.partNumber),r["Content-Type"]="multipart/form-data",this.fileRecord.method||(o=this.config.uploadMethods.param+this.config.uploadMethods.singlePart),t=s.parseTokens(this.api.config.host+this.config.sign,{id:this.fileRecord.id,method:o}),new i({url:t,token:this.api.getToken(),method:"POST",headers:r,data:this.fileRecord})},r.prototype._sendUpload=function(e,t){var o={},r=new FormData;return r.append("file",e.data),o["Content-Type"]="multipart/form-data",o.Authorization=t.data.authHeader,o["x-amz-date"]=t.data.dateHeader,new i({url:t.data.url,method:"PUT",headers:o,data:r})},r.prototype._completeChunk=function(e){var t;this.chunksComplete++,e.complete=!0,t=this.chunksComplete*this.chunkSize,t/=this.fileRecord.size,t=100*t,t=Math.round(t),this._updateProgress(t)},r.prototype._completeUpload=function(){var e,t;return this.aborted?void this.abort():(t={id:this.fileRecord.id},e=s.parseTokens(this.api.config.host+this.config.uploadComplete,t),new i({url:e,token:this.api.getToken(),method:"POST",data:this.fileRecord}).then(this._onCompleteUpload.bind(this)))},r.prototype._onCompleteUpload=function(){return this.currentUpload=null,this.fileRecord.id},r.prototype.abort=function(){var e,t,o="";return this.currentUpload&&(this.currentUpload.pause(),this.currentUpload=null),this.fileRecord.method||(o=this.config.uploadMethods.param+this.config.uploadMethods.singlePart),t={id:this.fileRecord.id,method:o},e=s.parseTokens(this.api.config.host+this.config.uploadAbort,t),new i({url:e,token:this.api.getToken(),method:"POST",data:this.fileRecord})},r.prototype.pause=function(){this.paused=!0,this.currentUpload&&this.currentUpload.pause()},r.prototype.resume=function(){this.paused=!1,this.currentUpload&&this.currentUpload.resume()},r.prototype._checkMultipart=function(e){return e?e.size<=5242880?!1:!0:void 0},r.prototype._getSliceMethod=function(e){var t;return t="mozSlice"in e?"mozSlice":"webkitSlice"in e?"webkitSlice":"slice"},e.exports=r}])});
//# sourceMappingURL=ingest.js.map