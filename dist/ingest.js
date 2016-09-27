!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.IngestAPI=t():e.IngestAPI=t()}(this,function(){return function(e){function t(o){if(s[o])return s[o].exports;var r=s[o]={exports:{},id:o,loaded:!1};return e[o].call(r.exports,r,r.exports,t),r.loaded=!0,r.exports}var s={};return t.m=e,t.c=s,t.p="",t(0)}([function(e,t,s){"use strict";e.exports=s(1)},function(e,t,s){"use strict";function o(e){this.defaults={host:"https://api.ingest.io",cacheAge:3e5,inputs:"/encoding/inputs",inputsById:"/encoding/inputs/<%=id%>",inputsUpload:"/encoding/inputs/<%=id%>/upload<%=method%>",inputsUploadSign:"/encoding/inputs/<%=id%>/upload/sign<%=method%>",inputsUploadComplete:"/encoding/inputs/<%=id%>/upload/complete",inputsUploadAbort:"/encoding/inputs/<%=id%>/upload/abort"},this.config=r(!0,{},this.defaults,e),this.token=null,this.config.token&&this.setToken(this.config.token),this.request=i,this.JWTUtils=n,this.utils=a,this.resource=p,this.playbackContent=h,this.usersResource=d,this.networksResource=l,this.videosResource=f,this.playlistsResource=g,this.jobsResource=y,this.uploader=u,this.cache=new c(this.config.cacheAge),this.cache.enabled=!1,this._getToken=this.getToken.bind(this),this.videos=new f({host:this.config.host,resource:"videos",tokenSource:this._getToken,cache:this.cache}),this.playlists=new g({host:this.config.host,resource:"playlists",tokenSource:this._getToken}),this.inputs=new p({host:this.config.host,resource:"encoding/inputs",tokenSource:this._getToken,cache:this.cache}),this.users=new d({host:this.config.host,resource:"users",tokenSource:this._getToken}),this.networks=new l({host:this.config.host,resource:"networks",tokenSource:this._getToken}),this.profiles=new p({host:this.config.host,resource:"encoding/profiles",tokenSource:this._getToken}),this.jobs=new y({host:this.config.host,resource:"encoding/jobs",tokenSource:this._getToken,cache:this.cache})}var r=s(2),i=s(3),n=s(8),a=s(9),u=s(10),c=s(11),p=s(12),h=s(13),d=s(14),l=s(15),f=s(16),g=s(17),y=s(18);o.prototype.setToken=function(e){if("string"!=typeof e)throw new Error("IngestAPI requires an authentication token passed as a string.");this.token=e},o.prototype.getToken=function(){return this.token},o.prototype.upload=function(e){return new u({file:e,api:this,host:this.config.host})},e.exports=o},function(e,t){"use strict";var s=Object.prototype.hasOwnProperty,o=Object.prototype.toString,r=function(e){return"function"==typeof Array.isArray?Array.isArray(e):"[object Array]"===o.call(e)},i=function(e){if(!e||"[object Object]"!==o.call(e))return!1;var t=s.call(e,"constructor"),r=e.constructor&&e.constructor.prototype&&s.call(e.constructor.prototype,"isPrototypeOf");if(e.constructor&&!t&&!r)return!1;var i;for(i in e);return"undefined"==typeof i||s.call(e,i)};e.exports=function n(){var e,t,s,o,a,u,c=arguments[0],p=1,h=arguments.length,d=!1;for("boolean"==typeof c?(d=c,c=arguments[1]||{},p=2):("object"!=typeof c&&"function"!=typeof c||null==c)&&(c={});h>p;++p)if(e=arguments[p],null!=e)for(t in e)s=c[t],o=e[t],c!==o&&(d&&o&&(i(o)||(a=r(o)))?(a?(a=!1,u=s&&r(s)?s:[]):u=s&&i(s)?s:{},c[t]=n(d,u,o)):"undefined"!=typeof o&&(c[t]=o));return c}},function(e,t,s){"use strict";var o=s(4),r=s(2),i=s(8),n=[200,201,202,204],a=function(e){this.defaults={async:!0,method:"GET",ignoreAcceptHeader:!1},this.request=new XMLHttpRequest,this.setupListeners(),this.options=r(!0,this.defaults,e)};a.prototype.send=function(){return this.promise=o(),this.options.url?this.makeRequest():this.requestError("Request Error : a url is required to make the request."),this.promise},a.prototype.setupListeners=function(){this.request.onreadystatechange=this.readyStateChange.bind(this)},a.prototype.makeRequest=function(){var e=this.preparePostData(this.options.data),t=this.options.headers,s=t&&t.hasOwnProperty("Content-Type");if(!e.success)return void this.requestError("Request Error : error preparing post data.");if(this.request.open(this.options.method,this.options.url,this.options.async),this.options.ignoreAcceptHeader||this.request.setRequestHeader("Accept","application/vnd.ingest.v1+json"),t&&this.applyRequestHeaders(t),this.options.token){if(i.isExpired(this.options.token))return void this.requestError("Request Error : token is expired.");this.request.setRequestHeader("Authorization",this.options.token)}e.data&&"JSON"===e.type&&!s&&this.request.setRequestHeader("Content-Type","application/vnd.ingest.v1+json"),e.data?this.request.send(e.data):this.request.send()},a.prototype.preparePostData=function(e){var t={success:!0,data:e,type:"JSON"};if(e instanceof FormData)return t.type="FormData",t;if(e instanceof Blob)return t.type="File",t;if(e)try{t.data=JSON.stringify(e)}catch(s){t.success=!1,t.data=null}return t},a.prototype.applyRequestHeaders=function(e){var t,s,o=Object.keys(e),r=o.length;for(s=0;r>s;s++)t=o[s],this.request.setRequestHeader(t,e[t])},a.prototype.requestComplete=function(e){this.response=this.processResponse(e),this.promise(!this.response.data.error,[this.response])},a.prototype.processResponse=function(e){var t=this.request.getResponseHeader("Content-Type"),s=e;if(t&&-1!==t.indexOf("json"))try{s=JSON.parse(e)}catch(o){s={error:"JSON parsing failed. "+o.stack}}return{data:s,headers:this.request.getResponseHeader.bind(this.request),statusCode:this.request.status}},a.prototype.requestError=function(e){this.promise(!1,[{message:e,headers:this.request.getAllResponseHeaders(),statusCode:this.request.status}])},a.prototype.readyStateChange=function(){switch(this.request.readyState){case 4:if(this.isValidResponseCode(this.request.status))return this.requestComplete(this.request.responseText);if("0"===this.request.getResponseHeader("Content-Length"))return this.requestError("Invalid response code");var e=this.processResponse(this.request.response);this.requestError(e.data.error)}},a.prototype.isValidResponseCode=function(e){var t,s=!1,o=n.length;for(t=0;o>t;t++)if(e===n[t]){s=!0;break}return s},a.prototype.cancel=function(){this.request.onreadystatechange=null,this.request.abort(),this.requestError("Request has been canceled.")},e.exports=a},function(e,t,s){(function(e,t,s){!function(e){function o(e){return"function"==typeof e}function r(e){return"object"==typeof e}function i(e){"undefined"!=typeof t?t(e):"undefined"!=typeof s&&s.nextTick?s.nextTick(e):setTimeout(e,0)}var n;e[0][e[1]]=function a(e){var t,s=[],u=[],c=function(e,o){return null==t&&null!=e&&(t=e,s=o,u.length&&i(function(){for(var e=0;e<u.length;e++)u[e]()})),t};return c.then=function(c,p){var h=a(e),d=function(){function e(t){var s,i=0;try{if(t&&(r(t)||o(t))&&o(s=t.then)){if(t===h)throw new TypeError;s.call(t,function(){i++||e.apply(n,arguments)},function(e){i++||h(!1,[e])})}else h(!0,arguments)}catch(a){i++||h(!1,[a])}}try{var i=t?c:p;o(i)?e(i.apply(n,s||[])):h(t,s)}catch(a){h(!1,[a])}};return null!=t?i(d):u.push(d),h},e&&(c=e(c)),c}}([e,"exports"])}).call(t,s(5)(e),s(6).setImmediate,s(7))},function(e,t){e.exports=function(e){return e.webpackPolyfill||(e.deprecate=function(){},e.paths=[],e.children=[],e.webpackPolyfill=1),e}},function(e,t,s){(function(e,o){function r(e,t){this._id=e,this._clearFn=t}var i=s(7).nextTick,n=Function.prototype.apply,a=Array.prototype.slice,u={},c=0;t.setTimeout=function(){return new r(n.call(setTimeout,window,arguments),clearTimeout)},t.setInterval=function(){return new r(n.call(setInterval,window,arguments),clearInterval)},t.clearTimeout=t.clearInterval=function(e){e.close()},r.prototype.unref=r.prototype.ref=function(){},r.prototype.close=function(){this._clearFn.call(window,this._id)},t.enroll=function(e,t){clearTimeout(e._idleTimeoutId),e._idleTimeout=t},t.unenroll=function(e){clearTimeout(e._idleTimeoutId),e._idleTimeout=-1},t._unrefActive=t.active=function(e){clearTimeout(e._idleTimeoutId);var t=e._idleTimeout;t>=0&&(e._idleTimeoutId=setTimeout(function(){e._onTimeout&&e._onTimeout()},t))},t.setImmediate="function"==typeof e?e:function(e){var s=c++,o=arguments.length<2?!1:a.call(arguments,1);return u[s]=!0,i(function(){u[s]&&(o?e.apply(null,o):e.call(null),t.clearImmediate(s))}),s},t.clearImmediate="function"==typeof o?o:function(e){delete u[e]}}).call(t,s(6).setImmediate,s(6).clearImmediate)},function(e,t){function s(){c=!1,n.length?u=n.concat(u):p=-1,u.length&&o()}function o(){if(!c){var e=setTimeout(s);c=!0;for(var t=u.length;t;){for(n=u,u=[];++p<t;)n&&n[p].run();p=-1,t=u.length}n=null,c=!1,clearTimeout(e)}}function r(e,t){this.fun=e,this.array=t}function i(){}var n,a=e.exports={},u=[],c=!1,p=-1;a.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var s=1;s<arguments.length;s++)t[s-1]=arguments[s];u.push(new r(e,t)),1!==u.length||c||setTimeout(o,0)},r.prototype.run=function(){this.fun.apply(null,this.array)},a.title="browser",a.browser=!0,a.env={},a.argv=[],a.version="",a.versions={},a.on=i,a.addListener=i,a.once=i,a.off=i,a.removeListener=i,a.removeAllListeners=i,a.emit=i,a.binding=function(e){throw new Error("process.binding is not supported")},a.cwd=function(){return"/"},a.chdir=function(e){throw new Error("process.chdir is not supported")},a.umask=function(){return 0}},function(e,t){"use strict";var s=function(e){var t=e.split(".");if(t.length<=1)return!1;var s=window.atob(t[1]);return s=JSON.parse(s)};e.exports.isExpired=function(e){var t,o,r,i;return t=s(e),r=!0,t?(o=t.exp,i=new Date,i=i.getTime()/1e3,o?(o>i&&(r=!1),r):r):r}},function(e,t,s){"use strict";var o=s(4),r={};r.parseTokens=function(e,t){if(!e)return null;var s,o=Object.keys(t),r=o.length;for(s=0;r>s;s++)e=e.replace("<%="+o[s]+"%>",t[o[s]]);return e},r.promisify=function(e,t){var s=o();return s(e,[t]),s},r.series=function(e,t){var s=e.length,i=o(),n={total:s,complete:0,responses:[],promises:e,paused:!0};return i.pause=r._seriesPause.bind(void 0,i,n),i.resume=r._seriesResume.bind(void 0,i,n),i.cancel=r._seriesCancel.bind(void 0,i,n),t||(n.paused=!1,r._seriesCallPromise(e[0],n,i)),i},r._seriesCallPromise=function(e,t,s){t.paused||e().then(r._seriesComplete.bind(void 0,s,t),r._seriesError.bind(void 0,s,t))},r._seriesComplete=function(e,t,s){t.canceled||(t.complete++,t.responses.push(s),t.complete>=t.total?e(!0,t.responses):t.paused||r._seriesCallPromise(t.promises[t.complete],t,e))},r._seriesError=function(e,t,s){e(!1,[s])},r._seriesPause=function(e,t){t.paused=!0},r._seriesResume=function(e,t){t.paused=!1,t.complete!==t.total&&r._seriesCallPromise(t.promises[t.complete],t,e)},r._seriesCancel=function(e,t){t.canceled=!0,e(!0,[])},r.isImage=function(e){return-1!==e.type.indexOf("image")},e.exports=r},function(e,t,s){"use strict";function o(e){this.defaults={api:null,file:null,upload:"/encoding/inputs/<%=id%>/upload<%=method%>",sign:"/encoding/inputs/<%=id%>/upload/sign<%=method%>",uploadComplete:"/encoding/inputs/<%=id%>/upload/complete",uploadAbort:"/encoding/inputs/<%=id%>/upload/abort<%=method%>",uploadMethods:{param:"?type=",singlePart:"amazon",multiPart:"amazonMP"}},this.config=r(!0,{},this.defaults,e),this.api=this.config.api,this.file=this.config.file,this.chunks=[],this.chunkSize=0,this.chunkCount=0,this.chunksComplete=0,this.uploadedBytes=0,this.aborted=!1,this.paused=!1,this.created=!1,this.initialized=!1,this.uploadComplete=!1,this.fileRecord={filename:this.file.name,type:this.file.type,size:this.file.size,method:this._checkMultipart(this.file)}}var r=s(2),i=s(3),n=s(4),a=s(9);s(8);o.prototype.progress=function(e){this.config.progress=e.bind(this)},o.prototype.save=function(){return this._create(this.fileRecord).then(this._initialize.bind(this)).then(this._prepareUpload.bind(this))},o.prototype._updateProgress=function(e,t){this.config.progress&&this.config.progress.call(this,e,t)},o.prototype._create=function(e){return this.created?a.promisify(!0,this.fileRecord.id):this.aborted?a.promisify(!1,"upload aborted"):this.api.inputs.add(e).then(this._createSuccess.bind(this))},o.prototype._createSuccess=function(e){return this.created=!0,this._updateProgress(0,0),this.input=e.data,this.fileRecord.id=e.data.id,this.fileRecord.id},o.prototype._initialize=function(){var e,t,s,o="";return this.aborted?a.promisify(!1,"upload aborted"):(this.fileRecord.method||(o=this.config.uploadMethods.param+this.config.uploadMethods.singlePart),t={id:this.fileRecord.id,method:o},e=a.parseTokens(this.api.config.host+this.config.upload,t),s=new i({url:e,token:this.api.getToken(),method:"POST",data:this.fileRecord}),s.send().then(this._initializeComplete.bind(this)))},o.prototype._initializeComplete=function(e){this.initialized=!0,this.fileRecord.key=e.data.key,this.fileRecord.uploadId=e.data.uploadId,this.chunkSize=e.data.pieceSize,this.chunkCount=e.data.pieceCount},o.prototype._prepareUpload=function(){return this.fileRecord.method?this._createChunks().then(this._completeUpload.bind(this)):this._uploadFile().then(this._onCompleteUpload.bind(this))},o.prototype._createChunks=function(){var e,t,s,o,r,i=this._getSliceMethod(this.file),n=[];if(this.aborted)return this.abort(),a.promisify(!1,"upload aborted");for(e=0;e<this.chunkCount;e++)o=e*this.chunkSize,r=Math.min((e+1)*this.chunkSize,this.fileRecord.size),t=this.file[i](o,r),s={partNumber:e+1,data:t},this.chunks.push(s),n.push(this._uploadChunk.bind(this,s));return this.multiPartPromise=a.series(n,this.paused),this.multiPartPromise},o.prototype._uploadChunk=function(e){var t=n();return this._signUpload(e).then(this._sendUpload.bind(this,e)).then(this._completeChunk.bind(this,e,t)),t},o.prototype._uploadFile=function(){var e={data:this.file};return this.singlePartPromise||(this.singlePartPromise=n()),this._signUpload(e).then(this._sendUpload.bind(this,e)).then(this._sendSinglepartComplete.bind(this)).then(this._updateProgress.bind(this,100,this.fileRecord.size)).then(this._uploadFileComplete.bind(this)),this.singlePartPromise},o.prototype._uploadFileComplete=function(){this.singlePartPromise(!0,[])},o.prototype._signUpload=function(e){var t,s,o="",r={};return e.partNumber&&(this.fileRecord.partNumber=e.partNumber),r["Content-Type"]="multipart/form-data",this.fileRecord.method||(o=this.config.uploadMethods.param+this.config.uploadMethods.singlePart),t=a.parseTokens(this.api.config.host+this.config.sign,{id:this.fileRecord.id,method:o}),s=new i({url:t,token:this.api.getToken(),method:"POST",headers:r,data:this.fileRecord}),s.send()},o.prototype._sendUpload=function(e,t){var s,o={};return o["Content-Type"]="multipart/form-data",o.authorization=t.data.authHeader,o["x-amz-date"]=t.data.dateHeader,o["x-amz-security-token"]=t.data.securityToken,s=new i({url:t.data.url,method:"PUT",headers:o,data:e.data,ignoreAcceptHeader:!0}),this.requestPromise=s,s.send()},o.prototype._sendSinglepartComplete=function(){this.uploadComplete=!0,this.uploadedBytes=this.fileRecord.size},o.prototype._completeChunk=function(e,t){var s;this.chunksComplete++,e.complete=!0,this.uploadedBytes+=e.data.size,this.chunksComplete===this.chunkCount&&(this.uploadComplete=!0),s=this.uploadedBytes/this.fileRecord.size,s=99*s,s=Math.round(s),this._updateProgress(s,e.data.size),t(!0,[])},o.prototype._completeUpload=function(){var e,t,s;return this.aborted?a.promisify(!1,"Upload Aborted."):(t={id:this.fileRecord.id},e=a.parseTokens(this.api.config.host+this.config.uploadComplete,t),s=new i({url:e,token:this.api.getToken(),method:"POST",data:this.fileRecord}),s.send().then(this._onCompleteUpload.bind(this)))},o.prototype._onCompleteUpload=function(){return this._updateProgress(100),this.uploadComplete=!0,this.multiPartPromise=null,this.requestPromise=null,this.singlePartPromise=null,this.fileRecord.id},o.prototype.abort=function(e){var t,s,o;return"undefined"==typeof e&&(e=!0),this.aborted=!0,this.initialized?(this.requestPromise&&(this.requestPromise.cancel(),this.requestPromise=null),this.singlePartPromise?(this.singlePartPromise=null,this._abortComplete(e)):(this.multiPartPromise.cancel(),this.multiPartPromise=null,s={id:this.fileRecord.id,method:""},t=a.parseTokens(this.api.config.host+this.config.uploadAbort,s),o=new i({url:t,async:e,token:this.api.getToken(),method:"POST",data:this.fileRecord}),o.send().then(this._abortComplete.bind(this,e)))):this.created?this.api.inputs["delete"](this.fileRecord.id,e):a.promisify(!0)},o.prototype._abortComplete=function(e){return this.api.inputs["delete"](this.fileRecord.id,e)},o.prototype.pause=function(){this.uploadComplete||(this.paused=!0,this.multiPartPromise?(this.multiPartPromise.pause(),this.requestPromise.cancel()):this.requestPromise&&this.requestPromise.cancel())},o.prototype.resume=function(){this.paused=!1,this.multiPartPromise?this.multiPartPromise.resume():this.requestPromise&&this._uploadFile()},o.prototype._checkMultipart=function(e){return e?e.size<=5242880?!1:!0:void 0},o.prototype._getSliceMethod=function(e){var t;return t="mozSlice"in e?"mozSlice":"webkitSlice"in e?"webkitSlice":"slice"},e.exports=o},function(e,t){"use strict";var s=function(e){this.cacheAge=e,this.enabled=this._checkCacheSupport()};s.prototype._checkCacheSupport=function(){var e="support";try{return window.sessionStorage.setItem(e,e),window.sessionStorage.removeItem(e),!0}catch(t){return!1}},s.prototype.retrieve=function(e){var t,s=null;try{if(t=window.sessionStorage.getItem(e),t=JSON.parse(t),!t)return s;s=t.value,t.expiry<Date.now()&&(window.sessionStorage.removeItem(e),s=null)}catch(o){s=null}return s},s.prototype.remove=function(e){var t=!0;try{window.sessionStorage.removeItem(e)}catch(s){t=!1}return t},s.prototype.save=function(e,t){var s,o=!0,r={};try{r.expiry=Date.now()+this.cacheAge,r.value=t,s=JSON.stringify(r),window.sessionStorage.setItem(e,s)}catch(i){o=!1}return o},s.prototype.diff=function(e,t,s){var o,r,i,n,a,u,c=this.retrieve(e),p=null;if(s&&(a=s.length),r=Object.keys(t),i=r.length,!c)return t;for(n=0;i>n;n++)o=r[n],c.hasOwnProperty(o)&&t[o]===c[o]||(p||(p={}),p[o]=t[o]);if(p)for(u=0;a>u;u++)o=s[u],p[o]=t[o];return p},s.prototype.diffArray=function(e,t,s){var o,r,i=t.length,n=null,a=[];for(o=0;i>o;o++)r=t[o],n=this.diff(r[e],r,s),null!==n&&a.push(n);return a},e.exports=s},function(e,t,s){"use strict";function o(e){this.defaults={host:"https://api.ingest.io",all:"/<%=resource%>",byId:"/<%=resource%>/<%=id%>",trash:"/<%=resource%>?filter=trashed",deleteMethods:{permanent:"?permanent=1"},search:"/<%=resource%>?search=<%=input%>",tokenSource:null,resource:null},this.config=r(!0,{},this.defaults,e),this.cache=this.config.cache}var r=s(2),i=s(3),n=s(9);o.prototype._tokenSource=function(){var e=null;return this.config.tokenSource&&(e=this.config.tokenSource.call()),e},o.prototype.getAll=function(e){var t,s=n.parseTokens(this.config.host+this.config.all,{resource:this.config.resource});return t=new i({url:s,token:this._tokenSource(),headers:e}),t.send().then(this._updateCachedResources.bind(this))},o.prototype.getById=function(e){var t,s,o;return"string"!=typeof e||e.length<=0?n.promisify(!1,"IngestAPI Resource getById requires a valid id passed as a string."):(t=n.parseTokens(this.config.host+this.config.byId,{resource:this.config.resource,id:e}),this.cache&&this.cache.enabled&&(s=this.cache.retrieve(e)),s?n.promisify(!0,{data:s}):(o=new i({url:t,token:this._tokenSource()}),o.send().then(this._updateCachedResource.bind(this))))},o.prototype.getTrashed=function(e){var t,s=n.parseTokens(this.config.host+this.config.trash,{resource:this.config.resource});return t=new i({url:s,token:this._tokenSource(),headers:e}),t.send()},o.prototype.add=function(e){var t,s;return"object"!=typeof e?n.promisify(!1,"IngestAPI Resource add requires a resource passed as an object."):(t=n.parseTokens(this.config.host+this.config.all,{resource:this.config.resource}),s=new i({url:t,token:this._tokenSource(),method:"POST",data:e}),s.send().then(this._updateCachedResource.bind(this)))},o.prototype.update=function(e){var t,s,o;return"object"!=typeof e?n.promisify(!1,"IngestAPI Resource update requires a resource to be passed as an object."):(s=e,o=n.parseTokens(this.config.host+this.config.byId,{resource:this.config.resource,id:e.id}),this.cache&&this.cache.enabled&&(s=this.cache.diff(e.id,e)),s?(t=new i({url:o,token:this._tokenSource(),method:"PATCH",data:s}),t.send().then(this._updateCachedResource.bind(this))):n.promisify(!0,{data:this.cache.retrieve(e.id)}))},o.prototype["delete"]=function(e,t){return"boolean"!=typeof t&&(t=!0),"string"!=typeof e?n.promisify(!1,"IngestAPI Resource delete requires a resource to be passed as a string."):this._deleteResource(e,!1,t)},o.prototype.permanentDelete=function(e,t){return"boolean"!=typeof t&&(t=!0),"string"!=typeof e?n.promisify(!1,"IngestAPI Resource delete requires a resource to be passed as a string."):this._deleteResource(e,!0,t)},o.prototype._deleteResource=function(e,t,s){var o,r=n.parseTokens(this.config.host+this.config.byId,{resource:this.config.resource,id:e});return t===!0&&(r+=this.config.deleteMethods.permanent),o=new i({url:r,async:s,token:this._tokenSource(),method:"DELETE"}),o.send().then(this._deleteCachedResource.bind(this,e))},o.prototype.search=function(e,t,s){var o,r;return"string"!=typeof e?n.promisify(!1,"IngestAPI Resource search requires search input to be passed as a string."):(o=n.parseTokens(this.config.host+this.config.search,{resource:this.config.resource,input:encodeURIComponent(e)}),s&&(o+="&filter=trashed"),r=new i({url:o,token:this._tokenSource(),headers:t}),r.send())},o.prototype.searchTrash=function(e,t){return this.search(e,t,!0)},o.prototype.count=function(){var e,t=n.parseTokens(this.config.host+this.config.all,{resource:this.config.resource});return e=new i({url:t,token:this._tokenSource(),method:"HEAD"}),e.send().then(this._handleCountResponse)},o.prototype.trashCount=function(){var e,t=n.parseTokens(this.config.host+this.config.trash,{resource:this.config.resource});return e=new i({url:t,token:this._tokenSource(),method:"HEAD"}),e.send().then(this._handleCountResponse)},o.prototype._handleCountResponse=function(e){return parseInt(e.headers("Resource-Count"),10)},o.prototype._updateCachedResource=function(e){return this.cache&&this.cache.enabled&&this.cache.save(e.data.id,e.data),e},o.prototype._updateCachedResources=function(e){var t,s=e.data,o=s.length;if(this.cache&&this.cache.enabled)for(t=0;o>t;t++)this.cache.save(s[t].id,s[t]);return e},o.prototype._deleteCachedResource=function(e,t){return this.cache&&this.cache.enabled&&this.cache.remove(e),t},e.exports=o},function(e,t,s){"use strict";function o(e){var t={thumbnail:"/<%=resource%>/<%=id%>/thumbnail",thumbnails:"/<%=resource%>/<%=id%>/thumbnails",deleteThumbnail:"/<%=resource%>/<%=id%>/thumbnail/<%=thumbnailId%>"};e=a(!0,{},t,e),r.call(this,e)}var r=s(12),i=s(3),n=s(9),a=s(2);o.prototype=Object.create(r.prototype),o.prototype.constructor=o,o.prototype.getThumbnails=function(e){var t,s;return"string"!=typeof e?n.promisify(!1,"IngestAPI PlaybackContent getThumbnails requires an id to be passed as a string."):(t=n.parseTokens(this.config.host+this.config.thumbnails,{resource:this.config.resource,id:e}),s=new i({url:t,token:this._tokenSource()}),s.send())},o.prototype.addExternalThumbnails=function(e,t){var s,o,r=[];return"string"!=typeof e?n.promisify(!1,"IngestAPI PlaybackContent addExternal requires an id to be passed as a string."):Array.isArray(t)||"string"==typeof t?(Array.isArray(t)?r=t:r.push(t),s=n.parseTokens(this.config.host+this.config.thumbnails,{resource:this.config.resource,id:e}),o=new i({method:"POST",url:s,token:this._tokenSource(),data:r}),o.send()):n.promisify(!1,"IngestAPI PlaybackContent addExternal requires images as a string or an array of strings.")},o.prototype.uploadThumbnail=function(e,t){var s,o,r;return"string"!=typeof e?n.promisify(!1,"IngestAPI PlaybackContent uploadThumbnail requires an id to be passed as a string."):t&&t instanceof File&&n.isImage(t)?(o=n.parseTokens(this.config.host+this.config.thumbnail,{resource:this.config.resource,id:e}),r=new FormData,r.append("image",t),s=new i({method:"POST",url:o,token:this._tokenSource(),data:r}),s.send()):n.promisify(!1,"IngestAPI PlaybackContent uploadThumbnail requires a valid image.")},o.prototype.deleteThumbnail=function(e,t){var s,o;return"string"!=typeof e?n.promisify(!1,"IngestAPI PlaybackContent deleteThumbnail requires an id to be passed as a string."):"string"!=typeof t?n.promisify(!1,"IngestAPI PlaybackContent deleteThumbanil requires a thumbnailId to be passed as a string."):(o=n.parseTokens(this.config.host+this.config.deleteThumbnail,{resource:this.config.resource,id:e,thumbnailId:t}),s=new i({method:"DELETE",url:o,token:this._tokenSource()}),s.send())},e.exports=o},function(e,t,s){"use strict";function o(e){var t={currentUser:"/users/me",transfer:"/users/<%=oldId%>/transfer/<%=newId%>",revoke:"/revoke"};e=a(!0,{},t,e),r.call(this,e)}var r=s(12),i=s(3),n=s(9),a=s(2);o.prototype=Object.create(r.prototype),o.prototype.constructor=o,o.prototype.getCurrentUserInfo=function(){var e=new i({url:this.config.host+this.config.currentUser,token:this._tokenSource()});return e.send()},o.prototype.transferUserAuthorship=function(e,t){var s,o,r;return"string"!=typeof e?n.promisify(!1,'IngestAPI transferUserAuthorship requires "oldId" to be passed as a string.'):"string"!=typeof t?n.promisify(!1,'IngestAPI transferUserAuthorship requires "newId" to be passed as a string'):(s={oldId:e,newId:t},o=n.parseTokens(this.config.host+this.config.transfer,s),r=new i({url:o,token:this._tokenSource(),method:"PATCH"}),r.send())},o.prototype.revokeCurrentUser=function(){var e=new i({url:this.config.host+this.config.currentUser+this.config.revoke,token:this._tokenSource(),method:"DELETE"});return e.send()},e.exports=o},function(e,t,s){"use strict";function o(e){var t={keys:"/<%=resource%>/<%=networkId%>/keys",keysById:"/<%=resource%>/<%=networkId%>/keys/<%=keyId%>",invite:"/<%=resource%>/<%=networkId%>/invite",invoices:"/<%=resource%>/<%=networkId%>/invoices",invoicesById:"/<%=resource%>/<%=networkId%>/invoices/<%=invoiceId%>",customers:"/<%=resource%>/<%=networkId%>/customers",customerById:"/<%=resource%>/<%=networkId%>/customers/<%=cusId%>",customerCardInformation:"/<%=resource%>/<%=networkId%>/customers/<%=cusId%>/card"};e=a(!0,{},t,e),r.call(this,e)}var r=s(12),i=s(3),n=s(9),a=s(2);o.prototype=Object.create(r.prototype),o.prototype.constructor=o,o.prototype.linkUser=function(e,t){var s,o,r;return"string"!=typeof e?n.promisify(!1,'IngestAPI linkUser requires "networkId" to be passed as a string.'):"string"!=typeof t?n.promisify(!1,'IngestAPI linkUser requires "userId" to be passed as a string.'):(s={id:t},r=n.parseTokens(this.config.host+this.config.byId,{resource:this.config.resource,id:e}),o=new i({url:r,data:s,token:this._tokenSource(),method:"LINK"}),o.send())},o.prototype.unlinkUser=function(e,t){var s,o,r;return"string"!=typeof e?n.promisify(!1,'IngestAPI unlinkUser requires "networkId" to be passed as a string.'):"string"!=typeof t?n.promisify(!1,'IngestAPI unlinkUser requires "userId" to be passed as a string.'):(s={id:t},r=n.parseTokens(this.config.host+this.config.byId,{resource:this.config.resource,id:e}),o=new i({url:r,data:s,token:this._tokenSource(),method:"UNLINK"}),o.send())},o.prototype.inviteUser=function(e,t,s){var o,r,a;return"string"!=typeof e?n.promisify(!1,'IngestAPI inviteUser requires "networkId" to be passed as a string.'):"string"!=typeof t?n.promisify(!1,'IngestAPI inviteUser requires "email" to be passed as a string.'):"string"!=typeof s?n.promisify(!1,'IngestAPI inviteUser requires "name" to be passed as a string.'):(o={email:t,name:s},a=n.parseTokens(this.config.host+this.config.invite,{resource:this.config.resource,networkId:e}),r=new i({url:a,data:o,token:this._tokenSource(),method:"POST"}),r.send())},o.prototype.getSecureKeys=function(e){var t,s;return"string"!=typeof e?n.promisify(!1,'IngestAPI getSecureKeys requires "networkId" to be passed as a string.'):(s=n.parseTokens(this.config.host+this.config.keys,{resource:this.config.resource,networkId:e}),t=new i({url:s,token:this._tokenSource()}),t.send())},o.prototype.addSecureKey=function(e,t){var s,o;return"string"!=typeof e?n.promisify(!1,'IngestAPI addSecureKey requires "networkId" to be passed as a string.'):"object"!=typeof t?n.promisify(!1,'IngestAPI addSecureKey requires "data" to be passed as an object.'):"string"!=typeof t.key?n.promisify(!1,"IngestAPI addSecureKey requires that the key be a string in RSA public key format."):("string"!=typeof t.title&&(t.title=""),o=n.parseTokens(this.config.host+this.config.keys,{resource:this.config.resource,networkId:e}),s=new i({url:o,token:this._tokenSource(),method:"POST",data:t}),s.send())},o.prototype.getSecureKeyById=function(e,t){var s,o;return"string"!=typeof e?n.promisify(!1,'IngestAPI getSecureKeyById requires a "networkId" to be passed as a string.'):"string"!=typeof t?n.promisify(!1,'IngestAPI getSecureKeyById requires a "keyId" to be passed as a string.'):(s=n.parseTokens(this.config.host+this.config.keysById,{resource:this.config.resource,networkId:e,keyId:t}),o=new i({url:s,token:this._tokenSource()}),o.send())},o.prototype.updateSecureKey=function(e,t){var s,o;return"string"!=typeof e?n.promisify(!1,'IngestAPI updateSecureKeyById requires "networkId" to be passed as a string.'):"object"!=typeof t?n.promisify(!1,'IngestAPI updateSecureKeyById requires "data" to be passed as an object.'):"string"!=typeof t.id?n.promisify(!1,'IngestAPI updateSecureKeyById requires param "data.id" to be a string.'):("string"!=typeof t.title&&(t.title=""),s=n.parseTokens(this.config.host+this.config.keysById,{resource:this.config.resource,networkId:e,keyId:t.id}),o=new i({url:s,token:this._tokenSource(),method:"PATCH",data:t}),o.send())},o.prototype.deleteSecureKey=function(e,t){var s,o;return"string"!=typeof e?n.promisify(!1,'IngestAPI deleteSecureKeyById requires a "networkId" to be passed as a string.'):"string"!=typeof t?n.promisify(!1,'IngestAPI deleteSecureKeyById requires a "keyId" to be passed as a string.'):(s=n.parseTokens(this.config.host+this.config.keysById,{resource:this.config.resource,networkId:e,keyId:t}),o=new i({url:s,token:this._tokenSource(),method:"DELETE"}),o.send())},o.prototype.createCustomer=function(e,t){var s,o,r;return"string"!=typeof e||"string"!=typeof t?n.promisify(!1,"IngestAPI Networks createCustomer requires stripeToken and networkId to be strings."):(s=n.parseTokens(this.config.host+this.config.customers,{networkId:t,resource:this.config.resource}),r={stripeToken:e},o=new i({url:s,data:r,token:this._tokenSource(),method:"POST"}),o.send())},o.prototype.updateCustomer=function(e,t,s,o){var r,a,u;return"string"!=typeof e||"string"!=typeof t?n.promisify(!1,"IngestAPI Networks updateCustomer requires `networkId` and `cusID` to be a string."):"string"!=typeof s&&"string"!=typeof o?n.promisify(!1,"IngestAPI Networks updateCustomer requires either networkName or stripeToken passed as a string."):(r=n.parseTokens(this.config.host+this.config.customerById,{resource:this.config.resource,networkId:e,cusId:t}),u={networkName:s,stripeToken:o},a=new i({url:r,data:u,token:this._tokenSource(),method:"PATCH"}),a.send())},o.prototype.deleteCustomer=function(e,t){var s,o;return"string"!=typeof e||"string"!=typeof t?n.promisify(!1,"IngestAPI Networks deleteCustomer requires `networkId` and `cusId` to be strings."):(s=n.parseTokens(this.config.host+this.config.customerById,{resource:this.config.resource,networkId:e,cusId:t}),o=new i({url:s,token:this._tokenSource(),method:"DELETE"}),o.send())},o.prototype.getCustomerCardInformation=function(e,t){var s,o;return"string"!=typeof t||"string"!=typeof e?n.promisify(!1,"IngestAPI Networks getCustomerCardInformation requires networkId and customerId to be strings"):(s=n.parseTokens(this.config.host+this.config.customerCardInformation,{resource:this.config.resource,networkId:e,cusId:t}),o=new i({url:s,token:this._tokenSource(),method:"GET"}),o.send())},o.prototype.getInvoices=function(e){var t,s;return"string"!=typeof e?n.promisify(!1,"IngestAPI Networks getInvoices requires networkId to be a string"):(t=n.parseTokens(this.config.host+this.config.invoices,{
resource:this.config.resource,networkId:e}),s=new i({url:t,token:this._tokenSource(),method:"GET"}),s.send())},o.prototype.getInvoiceById=function(e,t){var s,o;return"string"!=typeof e?n.promisify(!1,"IngestAPI getInvoiceById requires networkId to be passed as a string."):"string"!=typeof t?n.promisify(!1,"IngestAPI getInvoiceById requires invoiceId to be passed as a string."):(s=n.parseTokens(this.config.host+this.config.invoicesById,{resource:this.config.resource,networkId:e,invoiceId:t}),o=new i({url:s,token:this._tokenSource()}),o.send())},e.exports=o},function(e,t,s){"use strict";function o(e){var t={playlists:"/<%=resource%>/<%=id%>/playlists",variants:"/<%=resource%>/<%=id%>/variants",withVariants:"/<%=resource%>?filter=variants",missingVariants:"/<%=resource%>?filter=missing_variants"};e=a(!0,{},t,e),r.call(this,e)}var r=s(13),i=s(3),n=s(9),a=s(2);o.prototype=Object.create(r.prototype),o.prototype.constructor=o,o.prototype.getPlaylists=function(e){var t,s;return"string"!=typeof e?n.promisify(!1,"IngestAPI Resource getPlaylists requires a valid video id passed as a string."):(t=n.parseTokens(this.config.host+this.config.playlists,{resource:this.config.resource,id:e}),s=new i({url:t,token:this._tokenSource()}),s.send())},o.prototype.getVariants=function(e){var t,s;return"string"!=typeof e?n.promisify(!1,"IngestAPI Resource getPlaylists requires a valid video id passed as a string."):(t=n.parseTokens(this.config.host+this.config.variants,{resource:this.config.resource,id:e}),s=new i({url:t,token:this._tokenSource()}),s.send())},o.prototype.getVideosWithVariants=function(e){var t,s=n.parseTokens(this.config.host+this.config.withVariants,{resource:this.config.resource});return t=new i({url:s,token:this._tokenSource(),headers:e}),t.send().then(this._updateCachedResources.bind(this))},o.prototype.getVideosMissingVariants=function(e){var t,s=n.parseTokens(this.config.host+this.config.missingVariants,{resource:this.config.resource});return t=new i({url:s,token:this._tokenSource(),headers:e}),t.send().then(this._updateCachedResources.bind(this))},e.exports=o},function(e,t,s){function o(e){var t={playlistVideoById:"/<%=resource%>/<%=playlistId%>/video/<%=videoId%>",playlistReorder:"/<%=resource%>/<%=playlistId%>/reorder/<%=videoId%>"};e=a(!0,{},t,e),r.call(this,e)}var r=s(13),i=s(3),n=s(9),a=s(2);o.prototype=Object.create(r.prototype),o.prototype.constructor=o,o.prototype.addVideo=function(e,t,s){var o,r,a;return"string"!=typeof e||"string"!=typeof t?n.promisify(!1,'IngestAPI Playlists addVideo requires "playlistId" and "videoId" to both be strings.'):(r=n.parseTokens(this.config.host+this.config.playlistVideoById,{resource:this.config.resource,playlistId:e,videoId:t}),a={},"number"==typeof s&&(a.position=s),o=new i({method:"POST",url:r,token:this._tokenSource(),data:a}),o.send().then(this._updateCachedResources.bind(this)))},o.prototype.removeVideo=function(e,t,s){var o,r,a;return"string"!=typeof e||"string"!=typeof t?n.promisify(!1,'IngestAPI Playlists removeVideo requires "playlistId" and "videoId" to both be strings.'):"number"!=typeof s?n.promisify(!1,'IngestAPI Playlists removeVideo requires "position" to be a number'):(a={position:s},r=n.parseTokens(this.config.host+this.config.playlistVideoById,{resource:this.config.resource,playlistId:e,videoId:t}),o=new i({method:"DELETE",url:r,token:this._tokenSource(),data:a}),o.send().then(this._updateCachedResources.bind(this)))},o.prototype.reorderVideo=function(e,t,s,o){var r,a,u;return"string"!=typeof e?n.promisify(!1,'IngestAPI Playlists reorderVideo requires "playlistId" to be a string'):"string"!=typeof t?n.promisify(!1,'IngestAPI Playlists reorderVideo requires "videoId" to be a string'):"number"!=typeof s||"number"!=typeof o?n.promisify(!1,'IngestAPI Playlists reorderVideo requires "oldPosition" and "newPosition" to be numbers.'):(a=n.parseTokens(this.config.host+this.config.playlistReorder,{resource:this.config.resource,playlistId:e,videoId:t}),u={old_position:s,new_position:o},r=new i({method:"PUT",url:a,token:this._tokenSource(),data:u}),r.send().then(this._updateCachedResources.bind(this)))},e.exports=o},function(e,t,s){"use strict";function o(e){r.call(this,e)}var r=s(12),i=s(3),n=s(9);s(2);o.prototype=Object.create(r.prototype),o.prototype.constructor=o,o.prototype.add=function(e){var t,s;return"object"!=typeof e?n.promisify(!1,"IngestAPI Jobs `add` requires a resource passed as an object."):(t=n.parseTokens(this.config.host+this.config.all,{resource:this.config.resource}),e.hasOwnProperty("video")&&"string"==typeof e.video&&this._deleteCachedResource(e.video),s=new i({url:t,token:this._tokenSource(),method:"POST",data:e}),s.send().then(this._updateCachedResource.bind(this)))},e.exports=o}])});
//# sourceMappingURL=ingest.js.map