!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.IngestAPI=t():e.IngestAPI=t()}(this,function(){return function(e){function t(i){if(o[i])return o[i].exports;var s=o[i]={exports:{},id:i,loaded:!1};return e[i].call(s.exports,s,s.exports,t),s.loaded=!0,s.exports}var o={};return t.m=e,t.c=o,t.p="",t(0)}([function(e,t,o){e.exports=o(1)},function(e,t,o){function i(e){this.defaults={host:"https://api.ingest.io",cacheAge:3e5,networks:"/networks",networksKeys:"/networks/keys",networksKeysById:"/networks/keys/<%=id%>",inputs:"/encoding/inputs",inputsById:"/encoding/inputs/<%=id%>",inputsUpload:"/encoding/inputs/<%=id%>/upload<%=method%>",inputsUploadSign:"/encoding/inputs/<%=id%>/upload/sign<%=method%>",inputsUploadComplete:"/encoding/inputs/<%=id%>/upload/complete",inputsUploadAbort:"/encoding/inputs/<%=id%>/upload/abort",uploadMethods:{param:"?type=",singlePart:"amazon",multiPart:"amazonMP"}},this.config=s(!0,{},this.defaults,e),this.token=null,this.config.token&&this.setToken(this.config.token),this.request=r,this.JWTUtils=n,this.utils=a,this.resource=h,this.usersResource=p,this.networksResource=d,this.uploader=u,this.cache=new c(this.config.cacheAge),this.videos=new h({host:this.config.host,resource:"videos",tokenSource:this.getToken.bind(this),cache:this.cache}),this.playlists=new h({host:this.config.host,resource:"playlists",tokenSource:this.getToken.bind(this)}),this.inputs=new h({host:this.config.host,resource:"encoding/inputs",tokenSource:this.getToken.bind(this),cache:this.cache}),this.users=new p({host:this.config.host,resource:"users",tokenSource:this.getToken.bind(this),cache:this.cache}),this.networks=new d({host:this.config.host,resource:"networks",tokenSource:this.getToken.bind(this),cache:this.cache}),this.profiles=new h({host:this.config.host,resource:"encoding/profiles",tokenSource:this.getToken.bind(this),cache:this.cache}),this.jobs=new h({host:this.config.host,resource:"encoding/jobs",tokenSource:this.getToken.bind(this),cache:this.cache})}var s=o(2),r=o(3),n=o(8),a=o(9),u=o(10),c=o(11),h=o(12),p=o(13),d=o(14);i.prototype.setToken=function(e){if("string"!=typeof e)throw new Error("IngestAPI requires an authentication token passed as a string.");this.token=e},i.prototype.getToken=function(){return this.token},i.prototype.getNetworkSecureKeys=function(){var e=new r({url:this.config.host+this.config.networksKeys,token:this.getToken()});return e.send()},i.prototype.addNetworkSecureKey=function(e){var t;return"object"!=typeof e?a.promisify(!1,"IngestAPI addNetworkSecureKey requires data to be passed as an object."):("string"!=typeof e.title&&(e.title=""),"string"!=typeof e.key?a.promisify(!1,"IngestAPI addNetworkSecureKey requires that the key be a string in RSA public key format."):(t=new r({url:this.config.host+this.config.networksKeys,token:this.getToken(),method:"POST",data:e}),t.send()))},i.prototype.getNetworkSecureKeyById=function(e){var t,o,i;return"string"!=typeof e?a.promisify(!1,"IngestAPI getNetworkSecureKeyById requires an id to be passed as a string."):(t={id:e},o=a.parseTokens(this.config.host+this.config.networksKeysById,t),i=new r({url:o,token:this.getToken()}),i.send())},i.prototype.updateNetworkSecureKey=function(e){var t,o,i;return"object"!=typeof e?a.promisify(!1,"IngestAPI updateNetworkSecureKeyById requires data to be passed as an object."):"string"!=typeof e.id?a.promisify(!1,'IngestAPI updateNetworkSecureKeyById requires a param "id" to be a string.'):("string"!=typeof e.title&&(e.title=""),t={id:e.id},o=a.parseTokens(this.config.host+this.config.networksKeysById,t),i=new r({url:o,token:this.getToken(),method:"PATCH",data:e}),i.send())},i.prototype.deleteNetworkSecureKeyById=function(e){var t,o,i;return"string"!=typeof e?a.promisify(!1,"IngestAPI deleteNetworkSecureKeyById requires an id to be passed as a string."):(t={id:e},o=a.parseTokens(this.config.host+this.config.networksKeysById,t),i=new r({url:o,token:this.getToken(),method:"DELETE"}),i.send())},i.prototype.upload=function(e){return new u({file:e,api:this,host:this.config.host})},e.exports=i},function(e,t){"use strict";var o=Object.prototype.hasOwnProperty,i=Object.prototype.toString,s=function(e){return"function"==typeof Array.isArray?Array.isArray(e):"[object Array]"===i.call(e)},r=function(e){if(!e||"[object Object]"!==i.call(e))return!1;var t=o.call(e,"constructor"),s=e.constructor&&e.constructor.prototype&&o.call(e.constructor.prototype,"isPrototypeOf");if(e.constructor&&!t&&!s)return!1;var r;for(r in e);return"undefined"==typeof r||o.call(e,r)};e.exports=function n(){var e,t,o,i,a,u,c=arguments[0],h=1,p=arguments.length,d=!1;for("boolean"==typeof c?(d=c,c=arguments[1]||{},h=2):("object"!=typeof c&&"function"!=typeof c||null==c)&&(c={});p>h;++h)if(e=arguments[h],null!=e)for(t in e)o=c[t],i=e[t],c!==i&&(d&&i&&(r(i)||(a=s(i)))?(a?(a=!1,u=o&&s(o)?o:[]):u=o&&r(o)?o:{},c[t]=n(d,u,i)):"undefined"!=typeof i&&(c[t]=i));return c}},function(e,t,o){var i=o(4),s=o(2),r=o(8),n=[200,201,202,204],a=function(e){this.defaults={async:!0,method:"GET",ignoreAcceptHeader:!1},this.request=new XMLHttpRequest,this.setupListeners(),this.options=s(!0,this.defaults,e)};a.prototype.send=function(){return this.promise=i(),this.options.url?this.makeRequest():this.requestError("Request Error : a url is required to make the request."),this.promise},a.prototype.setupListeners=function(){this.request.onreadystatechange=this.readyStateChange.bind(this)},a.prototype.makeRequest=function(){var e=this.preparePostData(this.options.data),t=this.options.headers,o=t&&t.hasOwnProperty("Content-Type");if(!e.success)return void this.requestError("Request Error : error preparing post data.");if(this.request.open(this.options.method,this.options.url,this.options.async),this.options.ignoreAcceptHeader||this.request.setRequestHeader("Accept","application/vnd.ingest.v1+json"),t&&this.applyRequestHeaders(t),this.options.token){if(r.isExpired(this.options.token))return void this.requestError("Request Error : token is expired.");this.request.setRequestHeader("Authorization",this.options.token)}e.data&&"JSON"===e.type&&!o&&this.request.setRequestHeader("Content-Type","application/vnd.ingest.v1+json"),e.data?this.request.send(e.data):this.request.send()},a.prototype.preparePostData=function(e){var t={success:!0,data:e,type:"JSON"};if(e instanceof FormData)return t.type="FormData",t;if(e instanceof Blob)return t.type="File",t;if(e)try{t.data=JSON.stringify(e)}catch(o){t.success=!1,t.data=null}return t},a.prototype.applyRequestHeaders=function(e){var t,o,i=Object.keys(e),s=i.length;for(o=0;s>o;o++)t=i[o],this.request.setRequestHeader(t,e[t])},a.prototype.requestComplete=function(e){this.response=this.processResponse(e),this.promise(!this.response.data.error,[this.response])},a.prototype.processResponse=function(e){var t=this.request.getResponseHeader("Content-Type"),o=e;if(t&&-1!==t.indexOf("json"))try{o=JSON.parse(e)}catch(i){o={error:"JSON parsing failed. "+i.stack}}return{data:o,headers:this.request.getResponseHeader.bind(this.request),statusCode:this.request.status}},a.prototype.requestError=function(e){this.promise(!1,[e])},a.prototype.readyStateChange=function(){4===this.request.readyState&&(this.isValidResponseCode(this.request.status)?this.requestComplete(this.request.responseText):this.requestError("Invalid response code."))},a.prototype.isValidResponseCode=function(e){var t,o=!1,i=n.length;for(t=0;i>t;t++)if(e===n[t]){o=!0;break}return o},a.prototype.cancel=function(){this.request.onreadystatechange=null,this.request.abort(),this.requestError("Request has been canceled.")},e.exports=a},function(e,t,o){(function(e,t,o){!function(e){function i(e){return"function"==typeof e}function s(e){return"object"==typeof e}function r(e){"undefined"!=typeof t?t(e):"undefined"!=typeof o&&o.nextTick?o.nextTick(e):setTimeout(e,0)}var n;e[0][e[1]]=function a(e){var t,o=[],u=[],c=function(e,i){return null==t&&null!=e&&(t=e,o=i,u.length&&r(function(){for(var e=0;e<u.length;e++)u[e]()})),t};return c.then=function(c,h){var p=a(e),d=function(){function e(t){var o,r=0;try{if(t&&(s(t)||i(t))&&i(o=t.then)){if(t===p)throw new TypeError;o.call(t,function(){r++||e.apply(n,arguments)},function(e){r++||p(!1,[e])})}else p(!0,arguments)}catch(a){r++||p(!1,[a])}}try{var r=t?c:h;i(r)?e(r.apply(n,o||[])):p(t,o)}catch(a){p(!1,[a])}};return null!=t?r(d):u.push(d),p},e&&(c=e(c)),c}}([e,"exports"])}).call(t,o(5)(e),o(6).setImmediate,o(7))},function(e,t){e.exports=function(e){return e.webpackPolyfill||(e.deprecate=function(){},e.paths=[],e.children=[],e.webpackPolyfill=1),e}},function(e,t,o){(function(e,i){function s(e,t){this._id=e,this._clearFn=t}var r=o(7).nextTick,n=Function.prototype.apply,a=Array.prototype.slice,u={},c=0;t.setTimeout=function(){return new s(n.call(setTimeout,window,arguments),clearTimeout)},t.setInterval=function(){return new s(n.call(setInterval,window,arguments),clearInterval)},t.clearTimeout=t.clearInterval=function(e){e.close()},s.prototype.unref=s.prototype.ref=function(){},s.prototype.close=function(){this._clearFn.call(window,this._id)},t.enroll=function(e,t){clearTimeout(e._idleTimeoutId),e._idleTimeout=t},t.unenroll=function(e){clearTimeout(e._idleTimeoutId),e._idleTimeout=-1},t._unrefActive=t.active=function(e){clearTimeout(e._idleTimeoutId);var t=e._idleTimeout;t>=0&&(e._idleTimeoutId=setTimeout(function(){e._onTimeout&&e._onTimeout()},t))},t.setImmediate="function"==typeof e?e:function(e){var o=c++,i=arguments.length<2?!1:a.call(arguments,1);return u[o]=!0,r(function(){u[o]&&(i?e.apply(null,i):e.call(null),t.clearImmediate(o))}),o},t.clearImmediate="function"==typeof i?i:function(e){delete u[e]}}).call(t,o(6).setImmediate,o(6).clearImmediate)},function(e,t){function o(){c=!1,n.length?u=n.concat(u):h=-1,u.length&&i()}function i(){if(!c){var e=setTimeout(o);c=!0;for(var t=u.length;t;){for(n=u,u=[];++h<t;)n&&n[h].run();h=-1,t=u.length}n=null,c=!1,clearTimeout(e)}}function s(e,t){this.fun=e,this.array=t}function r(){}var n,a=e.exports={},u=[],c=!1,h=-1;a.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var o=1;o<arguments.length;o++)t[o-1]=arguments[o];u.push(new s(e,t)),1!==u.length||c||setTimeout(i,0)},s.prototype.run=function(){this.fun.apply(null,this.array)},a.title="browser",a.browser=!0,a.env={},a.argv=[],a.version="",a.versions={},a.on=r,a.addListener=r,a.once=r,a.off=r,a.removeListener=r,a.removeAllListeners=r,a.emit=r,a.binding=function(e){throw new Error("process.binding is not supported")},a.cwd=function(){return"/"},a.chdir=function(e){throw new Error("process.chdir is not supported")},a.umask=function(){return 0}},function(e,t){var o=function(e){var t=e.split(".");if(t.length<=1)return!1;var o=window.atob(t[1]);return o=JSON.parse(o)};e.exports.isExpired=function(e){var t,i,s,r;return t=o(e),s=!0,t?(i=t.exp,r=new Date,r=r.getTime()/1e3,i?(i>r&&(s=!1),s):s):s}},function(e,t,o){var i=o(4),s={};s.parseTokens=function(e,t){if(!e)return null;var o,i=Object.keys(t),s=i.length;for(o=0;s>o;o++)e=e.replace("<%="+i[o]+"%>",t[i[o]]);return e},s.promisify=function(e,t){var o=i();return o(e,[t]),o},s.series=function(e,t){var o=e.length,r=i(),n={total:o,complete:0,responses:[],promises:e,paused:!0};return r.pause=s._seriesPause.bind(void 0,r,n),r.resume=s._seriesResume.bind(void 0,r,n),r.cancel=s._seriesCancel.bind(void 0,r,"The Series has been canceled."),t||(n.paused=!1,s._seriesCallPromise(e[0],n,r)),r},s._seriesCallPromise=function(e,t,o){t.paused||e().then(s._seriesComplete.bind(void 0,o,t),s._seriesError.bind(void 0,o,t))},s._seriesComplete=function(e,t,o){t.canceled||(t.complete++,t.responses.push(o),t.complete>=t.total?e(!0,t.responses):t.paused||s._seriesCallPromise(t.promises[t.complete],t,e))},s._seriesError=function(e,t,o){e(!1,[o])},s._seriesPause=function(e,t){t.paused=!0},s._seriesResume=function(e,t){t.paused=!1,t.complete!==t.total&&s._seriesCallPromise(t.promises[t.complete],t,e)},s._seriesCancel=function(e,t){t.canceled=!0,e(!0,[])},e.exports=s},function(e,t,o){function i(e){this.defaults={api:null,file:null,upload:"/encoding/inputs/<%=id%>/upload<%=method%>",sign:"/encoding/inputs/<%=id%>/upload/sign<%=method%>",uploadComplete:"/encoding/inputs/<%=id%>/upload/complete",uploadAbort:"/encoding/inputs/<%=id%>/upload/abort<%=method%>",uploadMethods:{param:"?type=",singlePart:"amazon",multiPart:"amazonMP"}},this.config=s(!0,{},this.defaults,e),this.api=this.config.api,this.file=this.config.file,this.chunks=[],this.chunkSize=0,this.chunkCount=0,this.chunksComplete=0,this.uploadedBytes=0,this.aborted=!1,this.paused=!1,this.created=!1,this.initialized=!1,this.uploadComplete=!1,this.fileRecord={filename:this.file.name,type:this.file.type,size:this.file.size,method:this._checkMultipart(this.file)}}var s=o(2),r=o(3),n=o(4),a=o(9);o(8);i.prototype.progress=function(e){this.config.progress=e.bind(this)},i.prototype.save=function(){return this._create(this.fileRecord).then(this._initialize.bind(this)).then(this._prepareUpload.bind(this))},i.prototype._updateProgress=function(e,t){this.config.progress&&this.config.progress.call(this,e,t)},i.prototype._create=function(e){return this.created?a.promisify(!0,this.fileRecord.id):this.aborted?a.promisify(!1,"upload aborted"):this.api.inputs.add([e]).then(this._createSuccess.bind(this))},i.prototype._createSuccess=function(e){return this.created=!0,this._updateProgress(0,0),this.fileRecord.id=e.data[0].id,this.fileRecord.id},i.prototype._initialize=function(){var e,t,o,i="";return this.aborted?a.promisify(!1,"upload aborted"):(this.fileRecord.method||(i=this.config.uploadMethods.param+this.config.uploadMethods.singlePart),t={id:this.fileRecord.id,method:i},e=a.parseTokens(this.api.config.host+this.config.upload,t),o=new r({url:e,token:this.api.getToken(),method:"POST",data:this.fileRecord}),o.send().then(this._initializeComplete.bind(this)))},i.prototype._initializeComplete=function(e){this.initialized=!0,this.fileRecord.key=e.data.key,this.fileRecord.uploadId=e.data.uploadId,this.chunkSize=e.data.pieceSize,this.chunkCount=e.data.pieceCount},i.prototype._prepareUpload=function(){return this.fileRecord.method?this._createChunks().then(this._completeUpload.bind(this)):this._uploadFile().then(this._onCompleteUpload.bind(this))},i.prototype._createChunks=function(){var e,t,o,i,s,r=this._getSliceMethod(this.file),n=[];if(this.aborted)return this.abort(),a.promisify(!1,"upload aborted");for(e=0;e<this.chunkCount;e++)i=e*this.chunkSize,s=Math.min((e+1)*this.chunkSize,this.fileRecord.size),t=this.file[r](i,s),o={partNumber:e+1,data:t},this.chunks.push(o),n.push(this._uploadChunk.bind(this,o));return this.multiPartPromise=a.series(n,this.paused),this.multiPartPromise},i.prototype._uploadChunk=function(e){var t=n();return this._signUpload(e).then(this._sendUpload.bind(this,e)).then(this._completeChunk.bind(this,e,t)),t},i.prototype._uploadFile=function(){var e={data:this.file};return this.singlePartPromise||(this.singlePartPromise=n()),this._signUpload(e).then(this._sendUpload.bind(this,e)).then(this._sendSinglepartComplete.bind(this)).then(this._updateProgress.bind(this,100,this.fileRecord.size)).then(this._uploadFileComplete.bind(this)),this.singlePartPromise},i.prototype._uploadFileComplete=function(){this.singlePartPromise(!0,[])},i.prototype._signUpload=function(e){var t,o,i="",s={};return e.partNumber&&(this.fileRecord.partNumber=e.partNumber),s["Content-Type"]="multipart/form-data",this.fileRecord.method||(i=this.config.uploadMethods.param+this.config.uploadMethods.singlePart),t=a.parseTokens(this.api.config.host+this.config.sign,{id:this.fileRecord.id,method:i}),o=new r({url:t,token:this.api.getToken(),method:"POST",headers:s,data:this.fileRecord}),o.send()},i.prototype._sendUpload=function(e,t){var o,i={};return i["Content-Type"]="multipart/form-data",i.authorization=t.data.authHeader,i["x-amz-date"]=t.data.dateHeader,o=new r({url:t.data.url,method:"PUT",headers:i,data:e.data,ignoreAcceptHeader:!0}),this.requestPromise=o,o.send()},i.prototype._sendSinglepartComplete=function(){this.uploadComplete=!0,this.uploadedBytes=this.fileRecord.size},i.prototype._completeChunk=function(e,t){var o;this.chunksComplete++,e.complete=!0,this.uploadedBytes+=e.data.size,this.chunksComplete===this.chunkCount&&(this.uploadComplete=!0),o=this.uploadedBytes/this.fileRecord.size,o=99*o,o=Math.round(o),this._updateProgress(o,e.data.size),t(!0,[])},i.prototype._completeUpload=function(){var e,t,o;return this.aborted?a.promisify(!1,"Upload Aborted."):(t={id:this.fileRecord.id},e=a.parseTokens(this.api.config.host+this.config.uploadComplete,t),o=new r({url:e,token:this.api.getToken(),method:"POST",data:this.fileRecord}),o.send().then(this._onCompleteUpload.bind(this)))},i.prototype._onCompleteUpload=function(){return this._updateProgress(100),this.uploadComplete=!0,this.multiPartPromise=null,this.requestPromise=null,this.singlePartPromise=null,this.fileRecord.id},i.prototype.abort=function(e){var t,o,i;return"undefined"==typeof e&&(e=!0),this.aborted=!0,this.initialized?(this.requestPromise&&(this.requestPromise.cancel(),this.requestPromise=null),this.singlePartPromise?(this.singelPartPromise=null,this._abortComplete(e)):(this.multiPartPromise.cancel(),this.multiPartPromise=null,o={id:this.fileRecord.id,method:""},t=a.parseTokens(this.api.config.host+this.config.uploadAbort,o),i=new r({url:t,async:e,token:this.api.getToken(),method:"POST",data:this.fileRecord}),i.send().then(this._abortComplete.bind(this,e)))):this.created?this.api.inputs["delete"](this.fileRecord.id,e):a.promisify(!0)},i.prototype._abortComplete=function(e){return this.api.inputs["delete"](this.fileRecord.id,e)},i.prototype.pause=function(){this.uploadComplete||(this.paused=!0,this.multiPartPromise?(this.multiPartPromise.pause(),this.requestPromise.cancel()):this.requestPromise&&this.requestPromise.cancel())},i.prototype.resume=function(){this.paused=!1,this.multiPartPromise?this.multiPartPromise.resume():this.requestPromise&&this._uploadFile()},i.prototype._checkMultipart=function(e){return e?!(e.size<=5242880):void 0},i.prototype._getSliceMethod=function(e){var t;return t="mozSlice"in e?"mozSlice":"webkitSlice"in e?"webkitSlice":"slice"},e.exports=i},function(e,t){var o=function(e){this.cacheAge=e,this.enabled=this._checkCacheSupport()};o.prototype._checkCacheSupport=function(){var e="support";try{return window.localStorage.setItem(e,e),window.localStorage.removeItem(e),!0}catch(t){return!1}},o.prototype.retrieve=function(e){var t,o=null;try{if(t=window.localStorage.getItem(e),t=JSON.parse(t),!t)return o;o=t.value,t.expiry<Date.now()&&(window.localStorage.removeItem(e),o=null)}catch(i){o=null}return o},o.prototype.remove=function(e){var t=!0;try{window.localStorage.removeItem(e)}catch(o){t=!1}return t},o.prototype.save=function(e,t){var o,i=!0,s={};try{s.expiry=Date.now()+this.cacheAge,s.value=t,o=JSON.stringify(s),window.localStorage.setItem(e,o)}catch(r){i=!1}return i},o.prototype.diff=function(e,t,o){var i,s,r,n,a,u,c=this.retrieve(e),h=null;if(o&&(a=o.length),s=Object.keys(t),r=s.length,!c)return t;for(n=0;r>n;n++)i=s[n],c.hasOwnProperty(i)&&t[i]===c[i]||(h||(h={}),h[i]=t[i]);if(h)for(u=0;a>u;u++)i=o[u],h[i]=t[i];return h},o.prototype.diffArray=function(e,t,o){var i,s,r=t.length,n=null,a=[];for(i=0;r>i;i++)s=t[i],n=this.diff(s[e],s,o),null!==n&&a.push(n);return a},e.exports=o},function(e,t,o){function i(e){this.defaults={host:"https://api.ingest.io",all:"/<%=resource%>",byId:"/<%=resource%>/<%=id%>",thumbnails:"/<%=resource%>/<%=id%>/thumbnails",trash:"/<%=resource%>?filter=trashed",deleteMethods:{permanent:"?permanent=1"},search:"/<%=resource%>?search=<%=input%>",tokenSource:null,resource:null},this.config=s(!0,{},this.defaults,e),this.cache=this.config.cache}var s=o(2),r=o(3),n=o(9);i.prototype._tokenSource=function(){var e=null;return this.config.tokenSource&&(e=this.config.tokenSource.call()),e},i.prototype.getAll=function(e){var t,o=n.parseTokens(this.config.host+this.config.all,{resource:this.config.resource});return t=new r({url:o,token:this._tokenSource(),headers:e}),t.send().then(this._updateCachedResources.bind(this))},i.prototype.getById=function(e){var t,o,i;return"string"!=typeof e?n.promisify(!1,"IngestAPI Resource getById requires a valid id passed as a string."):(t=n.parseTokens(this.config.host+this.config.byId,{resource:this.config.resource,id:e}),this.cache&&this.cache.enabled&&(o=this.cache.retrieve(e)),o?n.promisify(!0,{data:o}):(i=new r({url:t,token:this._tokenSource()}),i.send()))},i.prototype.getTrashed=function(e){var t,o=n.parseTokens(this.config.host+this.config.trash,{resource:this.config.resource});return t=new r({url:o,token:this._tokenSource(),headers:e}),t.send()},i.prototype.getThumbnails=function(e){var t,o;return"string"!=typeof e?n.promisify(!1,"IngestAPI Resource getThumbnails requires an id to be passed as a string."):(t=n.parseTokens(this.config.host+this.config.thumbnails,{resource:this.config.resource,id:e}),o=new r({url:t,token:this._tokenSource()}),o.send())},i.prototype.add=function(e){var t,o;return"object"!=typeof e?n.promisify(!1,"IngestAPI Resource add requires a resource passed as an object."):(t=n.parseTokens(this.config.host+this.config.all,{resource:this.config.resource}),o=new r({url:t,token:this._tokenSource(),method:"POST",data:e}),o.send().then(this._updateCachedResource.bind(this)))},i.prototype.update=function(e){return"object"!=typeof e?n.promisify(!1,"IngestAPI Resource update requires a resource to be passed either as an object or an array of objects."):Array.isArray(e)?this._updateResourceArray(e):this._updateResource(e)},i.prototype._updateResource=function(e){var t,o=e,i=n.parseTokens(this.config.host+this.config.byId,{resource:this.config.resource,id:e.id});return this.cache&&this.cache.enabled&&(o=this.cache.diff(e.id,e)),o?(t=new r({url:i,token:this._tokenSource(),method:"PATCH",data:o}),t.send().then(this._updateCachedResource.bind(this))):n.promisify(!0,{data:this.cache.retrieve(e.id)})},i.prototype._updateResourceArray=function(e){var t,o=n.parseTokens(this.config.host+this.config.all,{resource:this.config.resource});return t=new r({url:o,token:this._tokenSource(),method:"PATCH",data:e}),t.send().then(this._updateCachedResources.bind(this))},i.prototype["delete"]=function(e,t){return"undefined"==typeof t&&(t=!0),"string"!=typeof e?Array.isArray(e)?this._deleteResourceArray(e,!1,t):n.promisify(!1,"IngestAPI Resource delete requires a resource to be passed either as a string or an array of strings."):this._deleteResource(e,!1,t)},i.prototype.permanentDelete=function(e,t){return"undefined"==typeof t&&(t=!0),"string"!=typeof e?Array.isArray(e)?this._deleteResourceArray(e,!0,t):n.promisify(!1,"IngestAPI Resource delete requires a resource to be passed either as a string or an array of strings."):this._deleteResource(e,!0,t)},i.prototype._deleteResource=function(e,t,o){var i,s=n.parseTokens(this.config.host+this.config.byId,{resource:this.config.resource,id:e});return t===!0&&(s+=this.config.deleteMethods.permanent),i=new r({url:s,async:o,token:this._tokenSource(),method:"DELETE"}),i.send().then(this._deleteCachedResource.bind(this,e))},i.prototype._deleteResourceArray=function(e,t){var o,i=n.parseTokens(this.config.host+this.config.all,{resource:this.config.resource});return t===!0&&(i+=this.config.deleteMethods.permanent),o=new r({url:i,token:this._tokenSource(),method:"DELETE",data:e}),o.send().then(this._deleteCachedResources.bind(this,e))},i.prototype.search=function(e,t){var o,i;return"string"!=typeof e?n.promisify(!1,"IngestAPI Resource search requires search input to be passed as a string."):(o=n.parseTokens(this.config.host+this.config.search,{resource:this.config.resource,input:e}),i=new r({url:o,token:this._tokenSource(),headers:t}),i.send())},i.prototype.count=function(){var e,t=n.parseTokens(this.config.host+this.config.all,{resource:this.config.resource});return e=new r({url:t,token:this._tokenSource(),method:"HEAD"}),e.send().then(this._handleCountResponse)},i.prototype.trashCount=function(){var e,t=n.parseTokens(this.config.host+this.config.trash,{resource:this.config.resource});return e=new r({url:t,token:this._tokenSource(),method:"HEAD"}),e.send().then(this._handleCountResponse)},i.prototype._handleCountResponse=function(e){return parseInt(e.headers("Resource-Count"),10)},i.prototype._updateCachedResource=function(e){return this.cache&&this.cache.enabled&&this.cache.save(e.data.id,e.data),e},i.prototype._updateCachedResources=function(e){var t,o=e.data,i=o.length;if(this.cache&&this.cache.enabled)for(t=0;i>t;t++)this.cache.save(o[t].id,o[t]);return e},i.prototype._deleteCachedResource=function(e,t){return this.cache&&this.cache.enabled&&this.cache.remove(e),t},i.prototype._deleteCachedResources=function(e,t){var o,i=e.length;if(this.cache&&this.cache.enabled)for(o=0;i>o;o++)this.cache.remove(e[o]);return t},e.exports=i},function(e,t,o){function i(e){var t={currentUser:"/users/me",transfer:"/users/<%=oldId%>/transfer/<%=newId%>",revoke:"/revoke"};e=a(!0,{},t,e),s.call(this,e)}var s=o(12),r=o(3),n=o(9),a=o(2);i.prototype=Object.create(s.prototype),i.prototype.constructor=i,i.prototype.getCurrentUserInfo=function(){var e=new r({url:this.config.host+this.config.currentUser,token:this._tokenSource()});return e.send()},i.prototype.transferUserAuthorship=function(e,t){var o,i,s;return"string"!=typeof e?n.promisify(!1,'IngestAPI transferUserAuthorship requires "oldId" to be passed as a string.'):"string"!=typeof t?n.promisify(!1,'IngestAPI transferUserAuthorship requires "newId" to be passed as a string'):(o={oldId:e,newId:t},i=n.parseTokens(this.config.host+this.config.transfer,o),s=new r({url:i,token:this._tokenSource(),method:"PATCH"}),s.send())},i.prototype.revokeCurrentUser=function(){var e=new r({url:this.config.host+this.config.currentUser+this.config.revoke,token:this._tokenSource(),method:"DELETE"});return e.send()},e.exports=i},function(e,t,o){function i(e){var t={invite:"/networks/invite"};e=a(!0,{},t,e),s.call(this,e)}var s=o(12),r=o(3),n=o(9),a=o(2);i.prototype=Object.create(s.prototype),i.prototype.constructor=i,i.prototype.linkUser=function(e){var t,o;return"string"!=typeof e?n.promisify(!1,'IngestAPI linkUser requires "id" to be passed as a string.'):(t={user_id:e},o=new r({url:this.config.host+"/"+this.config.resource,data:t,token:this._tokenSource(),method:"LINK"}),o.send())},i.prototype.unlinkUser=function(e){var t,o;return"string"!=typeof e?n.promisify(!1,'IngestAPI unlinkUser requires "id" to be passed as a string.'):(t={user_id:e},o=new r({url:this.config.host+"/"+this.config.resource,data:t,token:this._tokenSource(),method:"UNLINK"}),o.send())},i.prototype.inviteUser=function(e,t){var o,i;return"string"!=typeof e?n.promisify(!1,'IngestAPI inviteUser requires "email" to be passed as a string.'):"string"!=typeof t?n.promisify(!1,'IngestAPI inviteUser requires "name" to be passed as a string.'):(o={email:e,name:t},i=new r({url:this.config.host+this.config.invite,data:o,token:this._tokenSource(),method:"POST"}),i.send())},e.exports=i}])});
//# sourceMappingURL=ingest.js.map