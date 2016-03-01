!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.IngestAPI=t():e.IngestAPI=t()}(this,function(){return function(e){function t(i){if(o[i])return o[i].exports;var r=o[i]={exports:{},id:i,loaded:!1};return e[i].call(r.exports,r,r.exports,t),r.loaded=!0,r.exports}var o={};return t.m=e,t.c=o,t.p="",t(0)}([function(e,t,o){e.exports=o(1)},function(e,t,o){function i(e){this.defaults={host:"https://api.ingest.io",cacheAge:3e5,networks:"/networks",networksKeys:"/networks/keys",networksKeysById:"/networks/keys/<%=id%>",inputs:"/encoding/inputs",inputsById:"/encoding/inputs/<%=id%>",inputsUpload:"/encoding/inputs/<%=id%>/upload<%=method%>",inputsUploadSign:"/encoding/inputs/<%=id%>/upload/sign<%=method%>",inputsUploadComplete:"/encoding/inputs/<%=id%>/upload/complete",inputsUploadAbort:"/encoding/inputs/<%=id%>/upload/abort",uploadMethods:{param:"?type=",singlePart:"amazon",multiPart:"amazonMP"}},this.config=r(!0,{},this.defaults,e),this.token=null,this.config.token&&this.setToken(this.config.token),this.request=s,this.JWTUtils=n,this.utils=a,this.resource=h,this.usersResource=p,this.networksResource=d,this.uploader=u,this.cache=new c(this.config.cacheAge),this.videos=new h({host:this.config.host,resource:"videos",tokenSource:this.getToken.bind(this),cache:this.cache}),this.playlists=new h({host:this.config.host,resource:"playlists",tokenSource:this.getToken.bind(this),cache:this.cache}),this.inputs=new h({host:this.config.host,resource:"encoding/inputs",tokenSource:this.getToken.bind(this),cache:this.cache}),this.users=new p({host:this.config.host,resource:"users",tokenSource:this.getToken.bind(this),cache:this.cache,currentUser:"/users/me",transfer:"/users/<%=oldId%>/transfer/<%=newId%>",revoke:"/revoke"}),this.networks=new d({host:this.config.host,resource:"networks",tokenSource:this.getToken.bind(this),cache:this.cache,invite:"/networks/invite"})}var r=o(2),s=o(3),n=o(8),a=o(9),u=o(10),c=o(11),h=o(12),p=o(13),d=o(14);i.prototype.setToken=function(e){if("string"!=typeof e)throw new Error("IngestAPI requires an authentication token passed as a string.");this.token=e},i.prototype.getToken=function(){return this.token},i.prototype.getNetworkSecureKeys=function(){return new s({url:this.config.host+this.config.networksKeys,token:this.getToken()})},i.prototype.addNetworkSecureKey=function(e){return"object"!=typeof e?a.promisify(!1,"IngestAPI addNetworkSecureKey requires data to be passed as an object."):("string"!=typeof e.title&&(e.title=""),"string"!=typeof e.key?a.promisify(!1,"IngestAPI addNetworkSecureKey requires that the key be a string in RSA public key format."):new s({url:this.config.host+this.config.networksKeys,token:this.getToken(),method:"POST",data:e}))},i.prototype.getNetworkSecureKeyById=function(e){var t,o;return"string"!=typeof e?a.promisify(!1,"IngestAPI getNetworkSecureKeyById requires an id to be passed as a string."):(t={id:e},o=a.parseTokens(this.config.host+this.config.networksKeysById,t),new s({url:o,token:this.getToken()}))},i.prototype.updateNetworkSecureKey=function(e){var t,o;return"object"!=typeof e?a.promisify(!1,"IngestAPI updateNetworkSecureKeyById requires data to be passed as an object."):"string"!=typeof e.id?a.promisify(!1,'IngestAPI updateNetworkSecureKeyById requires a param "id" to be a string.'):("string"!=typeof e.title&&(e.title=""),t={id:e.id},o=a.parseTokens(this.config.host+this.config.networksKeysById,t),new s({url:o,token:this.getToken(),method:"PATCH",data:e}))},i.prototype.deleteNetworkSecureKeyById=function(e){var t,o;return"string"!=typeof e?a.promisify(!1,"IngestAPI deleteNetworkSecureKeyById requires an id to be passed as a string."):(t={id:e},o=a.parseTokens(this.config.host+this.config.networksKeysById,t),new s({url:o,token:this.getToken(),method:"DELETE"}))},i.prototype.upload=function(e){return new u({file:e,api:this,host:this.config.host})},e.exports=i},function(e,t){"use strict";var o=Object.prototype.hasOwnProperty,i=Object.prototype.toString,r=function(e){return"function"==typeof Array.isArray?Array.isArray(e):"[object Array]"===i.call(e)},s=function(e){if(!e||"[object Object]"!==i.call(e))return!1;var t=o.call(e,"constructor"),r=e.constructor&&e.constructor.prototype&&o.call(e.constructor.prototype,"isPrototypeOf");if(e.constructor&&!t&&!r)return!1;var s;for(s in e);return"undefined"==typeof s||o.call(e,s)};e.exports=function n(){var e,t,o,i,a,u,c=arguments[0],h=1,p=arguments.length,d=!1;for("boolean"==typeof c?(d=c,c=arguments[1]||{},h=2):("object"!=typeof c&&"function"!=typeof c||null==c)&&(c={});p>h;++h)if(e=arguments[h],null!=e)for(t in e)o=c[t],i=e[t],c!==i&&(d&&i&&(s(i)||(a=r(i)))?(a?(a=!1,u=o&&r(o)?o:[]):u=o&&s(o)?o:{},c[t]=n(d,u,i)):"undefined"!=typeof i&&(c[t]=i));return c}},function(e,t,o){var i=o(4),r=o(2),s=o(8),n=[200,201,202,204],a=function(e){return this.defaults={async:!0,method:"GET"},this.promise=i(),this.request=new XMLHttpRequest,this.setupListeners(),this.options=r(!0,this.defaults,e),this.options.url?(this.makeRequest(),this.promise):(this.requestError("Request Error : a url is required to make the request."),this.promise)};a.prototype.setupListeners=function(){this.request.onreadystatechange=this.readyStateChange.bind(this)},a.prototype.makeRequest=function(){var e=this.preparePostData(this.options.data),t=this.options.headers,o=t&&t.hasOwnProperty("Content-Type");if(!e.success)return void this.requestError("Request Error : error preparing post data.");if(this.request.open(this.options.method,this.options.url,this.options.async),t&&this.applyRequestHeaders(t),this.options.token){if(s.isExpired(this.options.token))return void this.requestError("Request Error : token is expired.");this.request.setRequestHeader("Authorization",this.options.token)}e.data&&"JSON"===e.type&&!o&&this.request.setRequestHeader("Content-Type","application/json; charset=utf-8"),e.data?this.request.send(e.data):this.request.send()},a.prototype.preparePostData=function(e){var t={success:!0,data:e,type:"JSON"};if(e instanceof FormData)return t.type="FormData",t;if(e instanceof Blob)return t.type="File",t;if(e)try{t.data=JSON.stringify(e)}catch(o){t.success=!1,t.data=null}return t},a.prototype.applyRequestHeaders=function(e){var t,o,i=Object.keys(e),r=i.length;for(o=0;r>o;o++)t=i[o],this.request.setRequestHeader(t,e[t])},a.prototype.requestComplete=function(e){this.response=this.processResponse(e),this.promise(!this.response.data.error,[this.response])},a.prototype.processResponse=function(e){var t=this.request.getResponseHeader("Content-Type"),o=e;if(t&&-1!==t.indexOf("application/json"))try{o=JSON.parse(e)}catch(i){o={error:"JSON parsing failed. "+i.stack}}return{data:o,headers:this.request.getResponseHeader.bind(this.request),statusCode:this.request.status}},a.prototype.requestError=function(e){this.promise(!1,[e])},a.prototype.readyStateChange=function(){4===this.request.readyState&&(this.isValidResponseCode(this.request.status)?this.requestComplete(this.request.responseText):this.requestError("Invalid response code."))},a.prototype.isValidResponseCode=function(e){var t,o=!1,i=n.length;for(t=0;i>t;t++)if(e===n[t]){o=!0;break}return o},e.exports=a},function(e,t,o){(function(e,t,o){!function(e){function i(e){return"function"==typeof e}function r(e){return"object"==typeof e}function s(e){"undefined"!=typeof t?t(e):"undefined"!=typeof o&&o.nextTick?o.nextTick(e):setTimeout(e,0)}var n;e[0][e[1]]=function a(e){var t,o=[],u=[],c=function(e,i){return null==t&&null!=e&&(t=e,o=i,u.length&&s(function(){for(var e=0;e<u.length;e++)u[e]()})),t};return c.then=function(c,h){var p=a(e),d=function(){function e(t){var o,s=0;try{if(t&&(r(t)||i(t))&&i(o=t.then)){if(t===p)throw new TypeError;o.call(t,function(){s++||e.apply(n,arguments)},function(e){s++||p(!1,[e])})}else p(!0,arguments)}catch(a){s++||p(!1,[a])}}try{var s=t?c:h;i(s)?e(s.apply(n,o||[])):p(t,o)}catch(a){p(!1,[a])}};return null!=t?s(d):u.push(d),p},e&&(c=e(c)),c}}([e,"exports"])}).call(t,o(5)(e),o(6).setImmediate,o(7))},function(e,t){e.exports=function(e){return e.webpackPolyfill||(e.deprecate=function(){},e.paths=[],e.children=[],e.webpackPolyfill=1),e}},function(e,t,o){(function(e,i){function r(e,t){this._id=e,this._clearFn=t}var s=o(7).nextTick,n=Function.prototype.apply,a=Array.prototype.slice,u={},c=0;t.setTimeout=function(){return new r(n.call(setTimeout,window,arguments),clearTimeout)},t.setInterval=function(){return new r(n.call(setInterval,window,arguments),clearInterval)},t.clearTimeout=t.clearInterval=function(e){e.close()},r.prototype.unref=r.prototype.ref=function(){},r.prototype.close=function(){this._clearFn.call(window,this._id)},t.enroll=function(e,t){clearTimeout(e._idleTimeoutId),e._idleTimeout=t},t.unenroll=function(e){clearTimeout(e._idleTimeoutId),e._idleTimeout=-1},t._unrefActive=t.active=function(e){clearTimeout(e._idleTimeoutId);var t=e._idleTimeout;t>=0&&(e._idleTimeoutId=setTimeout(function(){e._onTimeout&&e._onTimeout()},t))},t.setImmediate="function"==typeof e?e:function(e){var o=c++,i=arguments.length<2?!1:a.call(arguments,1);return u[o]=!0,s(function(){u[o]&&(i?e.apply(null,i):e.call(null),t.clearImmediate(o))}),o},t.clearImmediate="function"==typeof i?i:function(e){delete u[e]}}).call(t,o(6).setImmediate,o(6).clearImmediate)},function(e,t){function o(){c=!1,n.length?u=n.concat(u):h=-1,u.length&&i()}function i(){if(!c){var e=setTimeout(o);c=!0;for(var t=u.length;t;){for(n=u,u=[];++h<t;)n&&n[h].run();h=-1,t=u.length}n=null,c=!1,clearTimeout(e)}}function r(e,t){this.fun=e,this.array=t}function s(){}var n,a=e.exports={},u=[],c=!1,h=-1;a.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var o=1;o<arguments.length;o++)t[o-1]=arguments[o];u.push(new r(e,t)),1!==u.length||c||setTimeout(i,0)},r.prototype.run=function(){this.fun.apply(null,this.array)},a.title="browser",a.browser=!0,a.env={},a.argv=[],a.version="",a.versions={},a.on=s,a.addListener=s,a.once=s,a.off=s,a.removeListener=s,a.removeAllListeners=s,a.emit=s,a.binding=function(e){throw new Error("process.binding is not supported")},a.cwd=function(){return"/"},a.chdir=function(e){throw new Error("process.chdir is not supported")},a.umask=function(){return 0}},function(e,t){var o=function(e){var t=e.split(".");if(t.length<=1)return!1;var o=window.atob(t[1]);return o=JSON.parse(o)};e.exports.isExpired=function(e){var t,i,r,s;return t=o(e),r=!0,t?(i=t.exp,s=new Date,s=s.getTime()/1e3,i?(i>s&&(r=!1),r):r):r}},function(e,t,o){var i=o(4),r={};r.parseTokens=function(e,t){if(!e)return null;var o,i=Object.keys(t),r=i.length;for(o=0;r>o;o++)e=e.replace("<%="+i[o]+"%>",t[i[o]]);return e},r.promisify=function(e,t){var o=i();return o(e,[t]),o},r.series=function(e,t){var o=e.length,s=i(),n={total:o,complete:0,responses:[],promises:e,paused:!0};return s.pause=r._seriesPause.bind(void 0,s,n),s.resume=r._seriesResume.bind(void 0,s,n),t||(n.paused=!1,r._seriesCallPromise(e[0],n,s)),s},r._seriesCallPromise=function(e,t,o){t.paused||e().then(r._seriesComplete.bind(void 0,o,t),r._seriesError.bind(void 0,o,t))},r._seriesComplete=function(e,t,o){t.complete++,t.responses.push(o),t.complete>=t.total?e(!0,t.responses):t.paused||r._seriesCallPromise(t.promises[t.complete],t,e)},r._seriesError=function(e,t,o){e(!1,[o])},r._seriesPause=function(e,t){t.paused=!0},r._seriesResume=function(e,t){t.paused=!1,t.complete!==t.total&&r._seriesCallPromise(t.promises[t.complete],t,e)},e.exports=r},function(e,t,o){function i(e){this.defaults={api:null,file:null,upload:"/encoding/inputs/<%=id%>/upload<%=method%>",sign:"/encoding/inputs/<%=id%>/upload/sign<%=method%>",uploadComplete:"/encoding/inputs/<%=id%>/upload/complete",uploadAbort:"/encoding/inputs/<%=id%>/upload/abort<%=method%>",uploadMethods:{param:"?type=",singlePart:"amazon",multiPart:"amazonMP"}},this.config=r(!0,{},this.defaults,e),this.api=this.config.api,this.file=this.config.file,this.chunks=[],this.chunkSize=0,this.chunkCount=0,this.chunksComplete=0,this.uploadedBytes=0,this.aborted=!1,this.paused=!1,this.created=!1,this.initialized=!1,this.fileRecord={filename:this.file.name,type:this.file.type,size:this.file.size,method:this._checkMultipart(this.file)}}var r=o(2),s=o(3),n=o(9);o(8);i.prototype.progress=function(e){this.config.progress=e.bind(this)},i.prototype.save=function(){return this._create(this.fileRecord).then(this._initialize.bind(this)).then(this._prepareUpload.bind(this))},i.prototype._updateProgress=function(e,t){this.config.progress&&this.config.progress.call(this,e,t)},i.prototype._create=function(e){return this.aborted?n.promisify(!1,"upload aborted"):this.api.inputs.add([e]).then(this._createSuccess.bind(this))},i.prototype._createSuccess=function(e){return this.created=!0,this._updateProgress(0,0),this.fileRecord.id=e.data[0].id,this.fileRecord.id},i.prototype._initialize=function(){var e,t,o="";return this.aborted?n.promisify(!1,"upload aborted"):(this.fileRecord.method||(o=this.config.uploadMethods.param+this.config.uploadMethods.singlePart),t={id:this.fileRecord.id,method:o},e=n.parseTokens(this.api.config.host+this.config.upload,t),new s({url:e,token:this.api.getToken(),method:"POST",data:this.fileRecord}).then(this._initializeComplete.bind(this)))},i.prototype._initializeComplete=function(e){this.initialized=!0,this.fileRecord.key=e.data.key,this.fileRecord.uploadId=e.data.uploadId,this.chunkSize=e.data.pieceSize,this.chunkCount=e.data.pieceCount},i.prototype._prepareUpload=function(){return this.fileRecord.method?this._createChunks().then(this._completeUpload.bind(this)):this._uploadFile().then(this._onCompleteUpload.bind(this))},i.prototype._createChunks=function(){var e,t,o,i,r,s=this._getSliceMethod(this.file),a=[];if(this.aborted)return this.abort(),n.promisify(!1,"upload aborted");for(e=0;e<this.chunkCount;e++)i=e*this.chunkSize,r=Math.min((e+1)*this.chunkSize,this.fileRecord.size),t=this.file[s](i,r),o={partNumber:e+1,data:t},this.chunks.push(o),a.push(this._uploadChunk.bind(this,o));return this.currentUpload=n.series(a,this.paused),this.currentUpload},i.prototype._uploadChunk=function(e){return this._signUpload(e).then(this._sendUpload.bind(this,e)).then(this._completeChunk.bind(this,e))},i.prototype._uploadFile=function(){var e={data:this.file};return this._signUpload(e).then(this._sendUpload.bind(this,e)).then(this._sendSinglepartComplete.bind(this)).then(this._updateProgress.bind(this,100,this.fileRecord.size))},i.prototype._signUpload=function(e){var t,o="",i={};return e.partNumber&&(this.fileRecord.partNumber=e.partNumber),i["Content-Type"]="multipart/form-data",this.fileRecord.method||(o=this.config.uploadMethods.param+this.config.uploadMethods.singlePart),t=n.parseTokens(this.api.config.host+this.config.sign,{id:this.fileRecord.id,method:o}),new s({url:t,token:this.api.getToken(),method:"POST",headers:i,data:this.fileRecord})},i.prototype._sendUpload=function(e,t){var o={};return o["Content-Type"]="multipart/form-data",o.Authorization=t.data.authHeader,o["x-amz-date"]=t.data.dateHeader,new s({url:t.data.url,method:"PUT",headers:o,data:e.data})},i.prototype._sendSinglepartComplete=function(){this.uploadedBytes=this.fileRecord.size},i.prototype._completeChunk=function(e){var t;this.chunksComplete++,e.complete=!0,this.uploadedBytes+=e.data.size,t=this.uploadedBytes/this.fileRecord.size,t=100*t,t=Math.round(t),this._updateProgress(t,e.data.size)},i.prototype._completeUpload=function(){var e,t;return this.aborted?(this.abort(),n.promisify(!1,"upload aborted")):(t={id:this.fileRecord.id},e=n.parseTokens(this.api.config.host+this.config.uploadComplete,t),new s({url:e,token:this.api.getToken(),method:"POST",data:this.fileRecord}).then(this._onCompleteUpload.bind(this)))},i.prototype._onCompleteUpload=function(){return this.currentUpload=null,this.fileRecord.id},i.prototype.abort=function(e){var t,o,i="";return"undefined"==typeof e&&(e=!0),this.aborted=!0,this.initialized?(this.currentUpload&&(this.currentUpload.pause(),this.currentUpload=null),this.fileRecord.method||(i=this.config.uploadMethods.param+this.config.uploadMethods.singlePart),o={id:this.fileRecord.id,method:i},t=n.parseTokens(this.api.config.host+this.config.uploadAbort,o),new s({url:t,async:e,token:this.api.getToken(),method:"POST",data:this.fileRecord}).then(this._abortComplete.bind(this,e))):this.created?this.api.inputs["delete"](this.fileRecord.id,e):n.promisify(!0)},i.prototype._abortComplete=function(e){return this.api.inputs["delete"](this.fileRecord.id,e)},i.prototype.pause=function(){this.paused=!0,this.currentUpload&&this.currentUpload.pause()},i.prototype.resume=function(){this.paused=!1,this.currentUpload&&this.currentUpload.resume()},i.prototype._checkMultipart=function(e){return e?!(e.size<=5242880):void 0},i.prototype._getSliceMethod=function(e){var t;return t="mozSlice"in e?"mozSlice":"webkitSlice"in e?"webkitSlice":"slice"},e.exports=i},function(e,t){var o=function(e){this.cacheAge=e,this.enabled=this._checkCacheSupport()};o.prototype._checkCacheSupport=function(){var e="support";try{return window.localStorage.setItem(e,e),window.localStorage.removeItem(e),!0}catch(t){return!1}},o.prototype.retrieve=function(e){var t,o=null;try{if(t=window.localStorage.getItem(e),t=JSON.parse(t),!t)return o;o=t.value,t.expiry<Date.now()&&(window.localStorage.removeItem(e),o=null)}catch(i){o=null}return o},o.prototype.remove=function(e){var t=!0;try{window.localStorage.removeItem(e)}catch(o){t=!1}return t},o.prototype.save=function(e,t){var o,i=!0,r={};try{r.expiry=Date.now()+this.cacheAge,r.value=t,o=JSON.stringify(r),window.localStorage.setItem(e,o)}catch(s){i=!1}return i},o.prototype.diff=function(e,t,o){var i,r,s,n,a,u,c=this.retrieve(e),h=null;if(o&&(a=o.length),r=Object.keys(t),s=r.length,!c)return t;for(n=0;s>n;n++)i=r[n],c.hasOwnProperty(i)&&t[i]===c[i]||(h||(h={}),h[i]=t[i]);if(h)for(u=0;a>u;u++)i=o[u],h[i]=t[i];return h},o.prototype.diffArray=function(e,t,o){var i,r,s=t.length,n=null,a=[];for(i=0;s>i;i++)r=t[i],n=this.diff(r[e],r,o),null!==n&&a.push(n);return a},e.exports=o},function(e,t,o){function i(e){this.defaults={host:"https://api.ingest.io",all:"/<%=resource%>",byId:"/<%=resource%>/<%=id%>",thumbnails:"/<%=resource%>/<%=id%>/thumbnails",trash:"/<%=resource%>?filter=trashed",deleteMethods:{permanent:"?permanent=1"},search:"/<%=resource%>?search=<%=input%>",tokenSource:null,resource:null},this.config=r(!0,{},this.defaults,e),this.cache=this.config.cache}var r=o(2),s=o(3),n=o(9);i.prototype._tokenSource=function(){var e=null;return this.config.tokenSource&&(e=this.config.tokenSource.call()),e},i.prototype.getAll=function(e){var t=n.parseTokens(this.config.host+this.config.all,{resource:this.config.resource});return new s({url:t,token:this._tokenSource(),headers:e}).then(this._updateCachedResources.bind(this))},i.prototype.getById=function(e){var t,o;return"string"!=typeof e?n.promisify(!1,"IngestAPI Resource getById requires a valid id passed as a string."):(t=n.parseTokens(this.config.host+this.config.byId,{resource:this.config.resource,id:e}),this.cache&&this.cache.enabled&&(o=this.cache.retrieve(e)),o?n.promisify(!0,{data:o}):new s({url:t,token:this._tokenSource()}))},i.prototype.getTrashed=function(e){var t=n.parseTokens(this.config.host+this.config.trash,{resource:this.config.resource});return new s({url:t,token:this._tokenSource(),headers:e})},i.prototype.getThumbnails=function(e){var t;return"string"!=typeof e?n.promisify(!1,"IngestAPI Resource getThumbnails requires an id to be passed as a string."):(t=n.parseTokens(this.config.host+this.config.thumbnails,{resource:this.config.resource,id:e}),new s({url:t,token:this._tokenSource()}))},i.prototype.add=function(e){var t;return"object"!=typeof e?n.promisify(!1,"IngestAPI Resource add requires a resource passed as an object."):(t=n.parseTokens(this.config.host+this.config.all,{resource:this.config.resource}),new s({url:t,token:this._tokenSource(),method:"POST",data:e}).then(this._updateCachedResource.bind(this)))},i.prototype.update=function(e){return"object"!=typeof e?n.promisify(!1,"IngestAPI Resource update requires a resource to be passed either as an object or an array of objects."):Array.isArray(e)?this._updateResourceArray(e):this._updateResource(e)},i.prototype._updateResource=function(e){var t=e,o=n.parseTokens(this.config.host+this.config.byId,{resource:this.config.resource,id:e.id});return this.cache&&this.cache.enabled&&(t=this.cache.diff(e.id,e)),t?new s({url:o,token:this._tokenSource(),method:"PATCH",data:t}).then(this._updateCachedResource.bind(this)):n.promisify(!0,{data:this.cache.retrieve(e.id)})},i.prototype._updateResourceArray=function(e){var t=n.parseTokens(this.config.host+this.config.all,{resource:this.config.resource});return new s({url:t,token:this._tokenSource(),method:"PATCH",data:e}).then(this._updateCachedResources.bind(this))},i.prototype["delete"]=function(e,t){return"undefined"==typeof t&&(t=!0),"string"!=typeof e?Array.isArray(e)?this._deleteResourceArray(e,!1,t):n.promisify(!1,"IngestAPI Resource delete requires a resource to be passed either as a string or an array of strings."):this._deleteResource(e,!1,t)},i.prototype.permanentDelete=function(e,t){return"undefined"==typeof t&&(t=!0),"string"!=typeof e?Array.isArray(e)?this._deleteResourceArray(e,!0,t):n.promisify(!1,"IngestAPI Resource delete requires a resource to be passed either as a string or an array of strings."):this._deleteResource(e,!0,t)},i.prototype._deleteResource=function(e,t,o){var i=n.parseTokens(this.config.host+this.config.byId,{resource:this.config.resource,id:e});return t===!0&&(i+=this.config.deleteMethods.permanent),new s({url:i,async:o,token:this._tokenSource(),method:"DELETE"}).then(this._deleteCachedResource.bind(this,e))},i.prototype._deleteResourceArray=function(e,t){var o=n.parseTokens(this.config.host+this.config.all,{resource:this.config.resource});return t===!0&&(o+=this.config.deleteMethods.permanent),new s({url:o,token:this._tokenSource(),method:"DELETE",data:e}).then(this._deleteCachedResources.bind(this,e))},i.prototype.search=function(e,t){var o;return"string"!=typeof e?n.promisify(!1,"IngestAPI Resource search requires search input to be passed as a string."):(o=n.parseTokens(this.config.host+this.config.search,{resource:this.config.resource,input:e}),new s({url:o,token:this._tokenSource(),headers:t}))},i.prototype.count=function(){var e=n.parseTokens(this.config.host+this.config.all,{resource:this.config.resource});return new s({url:e,token:this._tokenSource(),method:"HEAD"}).then(this._handleCountResponse)},i.prototype.trashCount=function(){var e=n.parseTokens(this.config.host+this.config.trash,{resource:this.config.resource});return new s({url:e,token:this._tokenSource(),method:"HEAD"}).then(this._handleCountResponse)},i.prototype._handleCountResponse=function(e){return parseInt(e.headers("Resource-Count"),10)},i.prototype._updateCachedResource=function(e){return this.cache&&this.cache.enabled&&this.cache.save(e.data.id,e.data),e},i.prototype._updateCachedResources=function(e){var t,o=e.data,i=o.length;if(this.cache&&this.cache.enabled)for(t=0;i>t;t++)this.cache.save(o[t].id,o[t]);return e},i.prototype._deleteCachedResource=function(e,t){return this.cache&&this.cache.enabled&&this.cache.remove(e),t},i.prototype._deleteCachedResources=function(e,t){var o,i=e.length;if(this.cache&&this.cache.enabled)for(o=0;i>o;o++)this.cache.remove(e[o]);return t},e.exports=i},function(e,t,o){function i(e){r.call(this,e)}var r=o(12),s=o(3),n=o(9);i.prototype=Object.create(r.prototype),i.prototype.constructor=i,i.prototype.getCurrentUserInfo=function(){return new s({url:this.config.host+this.config.currentUser,token:this._tokenSource()})},i.prototype.transferUserAuthorship=function(e,t){var o,i;return"string"!=typeof e?n.promisify(!1,'IngestAPI transferUserAuthorship requires "oldId" to be passed as a string.'):"string"!=typeof t?n.promisify(!1,'IngestAPI transferUserAuthorship requires "newId" to be passed as a string'):(o={oldId:e,newId:t},i=n.parseTokens(this.config.host+this.config.transfer,o),new s({url:i,token:this._tokenSource(),method:"PATCH"}))},i.prototype.revokeCurrentUser=function(){return new s({url:this.config.host+this.config.currentUser+this.config.revoke,token:this._tokenSource(),method:"DELETE"})},e.exports=i},function(e,t,o){function i(e){r.call(this,e)}var r=o(12),s=o(3),n=o(9);i.prototype=Object.create(r.prototype),i.prototype.constructor=i,i.prototype.linkUser=function(e){var t;return"string"!=typeof e?n.promisify(!1,'IngestAPI linkUser requires "id" to be passed as a string.'):(t={user_id:e},new s({url:this.config.host+"/"+this.config.resource,data:t,token:this._tokenSource(),method:"LINK"}))},i.prototype.unlinkUser=function(e){var t;return"string"!=typeof e?n.promisify(!1,'IngestAPI unlinkUser requires "id" to be passed as a string.'):(t={user_id:e},new s({url:this.config.host+"/"+this.config.resource,data:t,token:this._tokenSource(),method:"UNLINK"}))},i.prototype.inviteUser=function(e,t){var o;return"string"!=typeof e?n.promisify(!1,'IngestAPI inviteUser requires "email" to be passed as a string.'):"string"!=typeof t?n.promisify(!1,'IngestAPI inviteUser requires "name" to be passed as a string.'):(o={email:e,name:t},new s({url:this.config.host+this.config.invite,data:o,token:this._tokenSource(),method:"POST"}))},e.exports=i}])});
//# sourceMappingURL=ingest.js.map