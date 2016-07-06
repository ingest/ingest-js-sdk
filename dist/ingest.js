!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.IngestAPI=t():e.IngestAPI=t()}(this,function(){return function(e){function t(i){if(s[i])return s[i].exports;var o=s[i]={exports:{},id:i,loaded:!1};return e[i].call(o.exports,o,o.exports,t),o.loaded=!0,o.exports}var s={};return t.m=e,t.c=s,t.p="",t(0)}([function(e,t,s){"use strict";e.exports=s(1)},function(e,t,s){"use strict";function i(e){this.defaults={host:"https://api.ingest.io",cacheAge:3e5,inputs:"/encoding/inputs",inputsById:"/encoding/inputs/<%=id%>",inputsUpload:"/encoding/inputs/<%=id%>/upload<%=method%>",inputsUploadSign:"/encoding/inputs/<%=id%>/upload/sign<%=method%>",inputsUploadComplete:"/encoding/inputs/<%=id%>/upload/complete",inputsUploadAbort:"/encoding/inputs/<%=id%>/upload/abort"},this.config=o(!0,{},this.defaults,e),this.token=null,this.config.token&&this.setToken(this.config.token),this.request=r,this.JWTUtils=n,this.utils=a,this.resource=p,this.playbackContent=h,this.usersResource=d,this.networksResource=l,this.videosResource=f,this.playlistsResource=y,this.jobsResource=g,this.uploader=u,this.cache=new c(this.config.cacheAge),this._getToken=this.getToken.bind(this),this.videos=new f({host:this.config.host,resource:"videos",tokenSource:this._getToken,cache:this.cache}),this.playlists=new y({host:this.config.host,resource:"playlists",tokenSource:this._getToken}),this.inputs=new p({host:this.config.host,resource:"encoding/inputs",tokenSource:this._getToken,cache:this.cache}),this.users=new d({host:this.config.host,resource:"users",tokenSource:this._getToken}),this.networks=new l({host:this.config.host,resource:"networks",tokenSource:this._getToken}),this.profiles=new p({host:this.config.host,resource:"encoding/profiles",tokenSource:this._getToken}),this.jobs=new g({host:this.config.host,resource:"encoding/jobs",tokenSource:this._getToken,cache:this.cache})}var o=s(2),r=s(3),n=s(8),a=s(9),u=s(10),c=s(11),p=s(12),h=s(13),d=s(14),l=s(15),f=s(16),y=s(17),g=s(18);i.prototype.setToken=function(e){if("string"!=typeof e)throw new Error("IngestAPI requires an authentication token passed as a string.");this.token=e},i.prototype.getToken=function(){return this.token},i.prototype.upload=function(e){return new u({file:e,api:this,host:this.config.host})},e.exports=i},function(e,t){"use strict";var s=Object.prototype.hasOwnProperty,i=Object.prototype.toString,o=function(e){return"function"==typeof Array.isArray?Array.isArray(e):"[object Array]"===i.call(e)},r=function(e){if(!e||"[object Object]"!==i.call(e))return!1;var t=s.call(e,"constructor"),o=e.constructor&&e.constructor.prototype&&s.call(e.constructor.prototype,"isPrototypeOf");if(e.constructor&&!t&&!o)return!1;var r;for(r in e);return"undefined"==typeof r||s.call(e,r)};e.exports=function n(){var e,t,s,i,a,u,c=arguments[0],p=1,h=arguments.length,d=!1;for("boolean"==typeof c?(d=c,c=arguments[1]||{},p=2):("object"!=typeof c&&"function"!=typeof c||null==c)&&(c={});h>p;++p)if(e=arguments[p],null!=e)for(t in e)s=c[t],i=e[t],c!==i&&(d&&i&&(r(i)||(a=o(i)))?(a?(a=!1,u=s&&o(s)?s:[]):u=s&&r(s)?s:{},c[t]=n(d,u,i)):"undefined"!=typeof i&&(c[t]=i));return c}},function(e,t,s){"use strict";var i=s(4),o=s(2),r=s(8),n=[200,201,202,204],a=function(e){this.defaults={async:!0,method:"GET",ignoreAcceptHeader:!1},this.request=new XMLHttpRequest,this.setupListeners(),this.options=o(!0,this.defaults,e)};a.prototype.send=function(){return this.promise=i(),this.options.url?this.makeRequest():this.requestError("Request Error : a url is required to make the request."),this.promise},a.prototype.setupListeners=function(){this.request.onreadystatechange=this.readyStateChange.bind(this)},a.prototype.makeRequest=function(){var e=this.preparePostData(this.options.data),t=this.options.headers,s=t&&t.hasOwnProperty("Content-Type");if(!e.success)return void this.requestError("Request Error : error preparing post data.");if(this.request.open(this.options.method,this.options.url,this.options.async),this.options.ignoreAcceptHeader||this.request.setRequestHeader("Accept","application/vnd.ingest.v1+json"),t&&this.applyRequestHeaders(t),this.options.token){if(r.isExpired(this.options.token))return void this.requestError("Request Error : token is expired.");this.request.setRequestHeader("Authorization",this.options.token)}e.data&&"JSON"===e.type&&!s&&this.request.setRequestHeader("Content-Type","application/vnd.ingest.v1+json"),e.data?this.request.send(e.data):this.request.send()},a.prototype.preparePostData=function(e){var t={success:!0,data:e,type:"JSON"};if(e instanceof FormData)return t.type="FormData",t;if(e instanceof Blob)return t.type="File",t;if(e)try{t.data=JSON.stringify(e)}catch(s){t.success=!1,t.data=null}return t},a.prototype.applyRequestHeaders=function(e){var t,s,i=Object.keys(e),o=i.length;for(s=0;o>s;s++)t=i[s],this.request.setRequestHeader(t,e[t])},a.prototype.requestComplete=function(e){this.response=this.processResponse(e),this.promise(!this.response.data.error,[this.response])},a.prototype.processResponse=function(e){var t=this.request.getResponseHeader("Content-Type"),s=e;if(t&&-1!==t.indexOf("json"))try{s=JSON.parse(e)}catch(i){s={error:"JSON parsing failed. "+i.stack}}return{data:s,headers:this.request.getResponseHeader.bind(this.request),statusCode:this.request.status}},a.prototype.requestError=function(e){this.promise(!1,[{message:e,headers:this.request.getAllResponseHeaders(),statusCode:this.request.status}])},a.prototype.readyStateChange=function(){4===this.request.readyState&&(this.isValidResponseCode(this.request.status)?this.requestComplete(this.request.responseText):this.requestError("Invalid response code."))},a.prototype.isValidResponseCode=function(e){var t,s=!1,i=n.length;for(t=0;i>t;t++)if(e===n[t]){s=!0;break}return s},a.prototype.cancel=function(){this.request.onreadystatechange=null,this.request.abort(),this.requestError("Request has been canceled.")},e.exports=a},function(e,t,s){(function(e,t,s){!function(e){function i(e){return"function"==typeof e}function o(e){return"object"==typeof e}function r(e){"undefined"!=typeof t?t(e):"undefined"!=typeof s&&s.nextTick?s.nextTick(e):setTimeout(e,0)}var n;e[0][e[1]]=function a(e){var t,s=[],u=[],c=function(e,i){return null==t&&null!=e&&(t=e,s=i,u.length&&r(function(){for(var e=0;e<u.length;e++)u[e]()})),t};return c.then=function(c,p){var h=a(e),d=function(){function e(t){var s,r=0;try{if(t&&(o(t)||i(t))&&i(s=t.then)){if(t===h)throw new TypeError;s.call(t,function(){r++||e.apply(n,arguments)},function(e){r++||h(!1,[e])})}else h(!0,arguments)}catch(a){r++||h(!1,[a])}}try{var r=t?c:p;i(r)?e(r.apply(n,s||[])):h(t,s)}catch(a){h(!1,[a])}};return null!=t?r(d):u.push(d),h},e&&(c=e(c)),c}}([e,"exports"])}).call(t,s(5)(e),s(6).setImmediate,s(7))},function(e,t){e.exports=function(e){return e.webpackPolyfill||(e.deprecate=function(){},e.paths=[],e.children=[],e.webpackPolyfill=1),e}},function(e,t,s){(function(e,i){function o(e,t){this._id=e,this._clearFn=t}var r=s(7).nextTick,n=Function.prototype.apply,a=Array.prototype.slice,u={},c=0;t.setTimeout=function(){return new o(n.call(setTimeout,window,arguments),clearTimeout)},t.setInterval=function(){return new o(n.call(setInterval,window,arguments),clearInterval)},t.clearTimeout=t.clearInterval=function(e){e.close()},o.prototype.unref=o.prototype.ref=function(){},o.prototype.close=function(){this._clearFn.call(window,this._id)},t.enroll=function(e,t){clearTimeout(e._idleTimeoutId),e._idleTimeout=t},t.unenroll=function(e){clearTimeout(e._idleTimeoutId),e._idleTimeout=-1},t._unrefActive=t.active=function(e){clearTimeout(e._idleTimeoutId);var t=e._idleTimeout;t>=0&&(e._idleTimeoutId=setTimeout(function(){e._onTimeout&&e._onTimeout()},t))},t.setImmediate="function"==typeof e?e:function(e){var s=c++,i=arguments.length<2?!1:a.call(arguments,1);return u[s]=!0,r(function(){u[s]&&(i?e.apply(null,i):e.call(null),t.clearImmediate(s))}),s},t.clearImmediate="function"==typeof i?i:function(e){delete u[e]}}).call(t,s(6).setImmediate,s(6).clearImmediate)},function(e,t){function s(){c=!1,n.length?u=n.concat(u):p=-1,u.length&&i()}function i(){if(!c){var e=setTimeout(s);c=!0;for(var t=u.length;t;){for(n=u,u=[];++p<t;)n&&n[p].run();p=-1,t=u.length}n=null,c=!1,clearTimeout(e)}}function o(e,t){this.fun=e,this.array=t}function r(){}var n,a=e.exports={},u=[],c=!1,p=-1;a.nextTick=function(e){var t=new Array(arguments.length-1);if(arguments.length>1)for(var s=1;s<arguments.length;s++)t[s-1]=arguments[s];u.push(new o(e,t)),1!==u.length||c||setTimeout(i,0)},o.prototype.run=function(){this.fun.apply(null,this.array)},a.title="browser",a.browser=!0,a.env={},a.argv=[],a.version="",a.versions={},a.on=r,a.addListener=r,a.once=r,a.off=r,a.removeListener=r,a.removeAllListeners=r,a.emit=r,a.binding=function(e){throw new Error("process.binding is not supported")},a.cwd=function(){return"/"},a.chdir=function(e){throw new Error("process.chdir is not supported")},a.umask=function(){return 0}},function(e,t){"use strict";var s=function(e){var t=e.split(".");if(t.length<=1)return!1;var s=window.atob(t[1]);return s=JSON.parse(s)};e.exports.isExpired=function(e){var t,i,o,r;return t=s(e),o=!0,t?(i=t.exp,r=new Date,r=r.getTime()/1e3,i?(i>r&&(o=!1),o):o):o}},function(e,t,s){"use strict";var i=s(4),o={};o.parseTokens=function(e,t){if(!e)return null;var s,i=Object.keys(t),o=i.length;for(s=0;o>s;s++)e=e.replace("<%="+i[s]+"%>",t[i[s]]);return e},o.promisify=function(e,t){var s=i();return s(e,[t]),s},o.series=function(e,t){var s=e.length,r=i(),n={total:s,complete:0,responses:[],promises:e,paused:!0};return r.pause=o._seriesPause.bind(void 0,r,n),r.resume=o._seriesResume.bind(void 0,r,n),r.cancel=o._seriesCancel.bind(void 0,r,n),t||(n.paused=!1,o._seriesCallPromise(e[0],n,r)),r},o._seriesCallPromise=function(e,t,s){t.paused||e().then(o._seriesComplete.bind(void 0,s,t),o._seriesError.bind(void 0,s,t))},o._seriesComplete=function(e,t,s){t.canceled||(t.complete++,t.responses.push(s),t.complete>=t.total?e(!0,t.responses):t.paused||o._seriesCallPromise(t.promises[t.complete],t,e))},o._seriesError=function(e,t,s){e(!1,[s])},o._seriesPause=function(e,t){t.paused=!0},o._seriesResume=function(e,t){t.paused=!1,t.complete!==t.total&&o._seriesCallPromise(t.promises[t.complete],t,e)},o._seriesCancel=function(e,t){t.canceled=!0,e(!0,[])},o.isImage=function(e){return-1!==e.type.indexOf("image")},e.exports=o},function(e,t,s){"use strict";function i(e){this.defaults={api:null,file:null,upload:"/encoding/inputs/<%=id%>/upload<%=method%>",sign:"/encoding/inputs/<%=id%>/upload/sign<%=method%>",uploadComplete:"/encoding/inputs/<%=id%>/upload/complete",uploadAbort:"/encoding/inputs/<%=id%>/upload/abort<%=method%>",uploadMethods:{param:"?type=",singlePart:"amazon",multiPart:"amazonMP"}},this.config=o(!0,{},this.defaults,e),this.api=this.config.api,this.file=this.config.file,this.chunks=[],this.chunkSize=0,this.chunkCount=0,this.chunksComplete=0,this.uploadedBytes=0,this.aborted=!1,this.paused=!1,this.created=!1,this.initialized=!1,this.uploadComplete=!1,this.fileRecord={filename:this.file.name,type:this.file.type,size:this.file.size,method:this._checkMultipart(this.file)}}var o=s(2),r=s(3),n=s(4),a=s(9);s(8);i.prototype.progress=function(e){this.config.progress=e.bind(this)},i.prototype.save=function(){return this._create(this.fileRecord).then(this._initialize.bind(this)).then(this._prepareUpload.bind(this))},i.prototype._updateProgress=function(e,t){this.config.progress&&this.config.progress.call(this,e,t)},i.prototype._create=function(e){return this.created?a.promisify(!0,this.fileRecord.id):this.aborted?a.promisify(!1,"upload aborted"):this.api.inputs.add(e).then(this._createSuccess.bind(this))},i.prototype._createSuccess=function(e){return this.created=!0,this._updateProgress(0,0),this.input=e.data,this.fileRecord.id=e.data.id,this.fileRecord.id},i.prototype._initialize=function(){var e,t,s,i="";return this.aborted?a.promisify(!1,"upload aborted"):(this.fileRecord.method||(i=this.config.uploadMethods.param+this.config.uploadMethods.singlePart),t={id:this.fileRecord.id,method:i},e=a.parseTokens(this.api.config.host+this.config.upload,t),s=new r({url:e,token:this.api.getToken(),method:"POST",data:this.fileRecord}),s.send().then(this._initializeComplete.bind(this)))},i.prototype._initializeComplete=function(e){this.initialized=!0,this.fileRecord.key=e.data.key,this.fileRecord.uploadId=e.data.uploadId,this.chunkSize=e.data.pieceSize,this.chunkCount=e.data.pieceCount},i.prototype._prepareUpload=function(){return this.fileRecord.method?this._createChunks().then(this._completeUpload.bind(this)):this._uploadFile().then(this._onCompleteUpload.bind(this))},i.prototype._createChunks=function(){var e,t,s,i,o,r=this._getSliceMethod(this.file),n=[];if(this.aborted)return this.abort(),a.promisify(!1,"upload aborted");for(e=0;e<this.chunkCount;e++)i=e*this.chunkSize,o=Math.min((e+1)*this.chunkSize,this.fileRecord.size),t=this.file[r](i,o),s={partNumber:e+1,data:t},this.chunks.push(s),n.push(this._uploadChunk.bind(this,s));return this.multiPartPromise=a.series(n,this.paused),this.multiPartPromise},i.prototype._uploadChunk=function(e){var t=n();return this._signUpload(e).then(this._sendUpload.bind(this,e)).then(this._completeChunk.bind(this,e,t)),t},i.prototype._uploadFile=function(){var e={data:this.file};return this.singlePartPromise||(this.singlePartPromise=n()),this._signUpload(e).then(this._sendUpload.bind(this,e)).then(this._sendSinglepartComplete.bind(this)).then(this._updateProgress.bind(this,100,this.fileRecord.size)).then(this._uploadFileComplete.bind(this)),this.singlePartPromise},i.prototype._uploadFileComplete=function(){this.singlePartPromise(!0,[])},i.prototype._signUpload=function(e){var t,s,i="",o={};return e.partNumber&&(this.fileRecord.partNumber=e.partNumber),o["Content-Type"]="multipart/form-data",this.fileRecord.method||(i=this.config.uploadMethods.param+this.config.uploadMethods.singlePart),t=a.parseTokens(this.api.config.host+this.config.sign,{id:this.fileRecord.id,method:i}),s=new r({url:t,token:this.api.getToken(),method:"POST",headers:o,data:this.fileRecord}),s.send()},i.prototype._sendUpload=function(e,t){var s,i={};return i["Content-Type"]="multipart/form-data",i.authorization=t.data.authHeader,i["x-amz-date"]=t.data.dateHeader,i["x-amz-security-token"]=t.data.securityToken,s=new r({url:t.data.url,method:"PUT",headers:i,data:e.data,ignoreAcceptHeader:!0}),this.requestPromise=s,s.send()},i.prototype._sendSinglepartComplete=function(){this.uploadComplete=!0,this.uploadedBytes=this.fileRecord.size},i.prototype._completeChunk=function(e,t){var s;this.chunksComplete++,e.complete=!0,this.uploadedBytes+=e.data.size,this.chunksComplete===this.chunkCount&&(this.uploadComplete=!0),s=this.uploadedBytes/this.fileRecord.size,s=99*s,s=Math.round(s),this._updateProgress(s,e.data.size),t(!0,[])},i.prototype._completeUpload=function(){var e,t,s;return this.aborted?a.promisify(!1,"Upload Aborted."):(t={id:this.fileRecord.id},e=a.parseTokens(this.api.config.host+this.config.uploadComplete,t),s=new r({url:e,token:this.api.getToken(),method:"POST",data:this.fileRecord}),s.send().then(this._onCompleteUpload.bind(this)))},i.prototype._onCompleteUpload=function(){return this._updateProgress(100),this.uploadComplete=!0,this.multiPartPromise=null,this.requestPromise=null,this.singlePartPromise=null,this.fileRecord.id},i.prototype.abort=function(e){var t,s,i;return"undefined"==typeof e&&(e=!0),this.aborted=!0,this.initialized?(this.requestPromise&&(this.requestPromise.cancel(),this.requestPromise=null),this.singlePartPromise?(this.singelPartPromise=null,this._abortComplete(e)):(this.multiPartPromise.cancel(),this.multiPartPromise=null,s={id:this.fileRecord.id,method:""},t=a.parseTokens(this.api.config.host+this.config.uploadAbort,s),i=new r({url:t,async:e,token:this.api.getToken(),method:"POST",data:this.fileRecord}),i.send().then(this._abortComplete.bind(this,e)))):this.created?this.api.inputs["delete"](this.fileRecord.id,e):a.promisify(!0)},i.prototype._abortComplete=function(e){return this.api.inputs["delete"](this.fileRecord.id,e)},i.prototype.pause=function(){this.uploadComplete||(this.paused=!0,this.multiPartPromise?(this.multiPartPromise.pause(),this.requestPromise.cancel()):this.requestPromise&&this.requestPromise.cancel())},i.prototype.resume=function(){this.paused=!1,this.multiPartPromise?this.multiPartPromise.resume():this.requestPromise&&this._uploadFile()},i.prototype._checkMultipart=function(e){return e?!(e.size<=5242880):void 0},i.prototype._getSliceMethod=function(e){var t;return t="mozSlice"in e?"mozSlice":"webkitSlice"in e?"webkitSlice":"slice"},e.exports=i},function(e,t){"use strict";var s=function(e){this.cacheAge=e,this.enabled=this._checkCacheSupport()};s.prototype._checkCacheSupport=function(){var e="support";try{return window.sessionStorage.setItem(e,e),window.sessionStorage.removeItem(e),!0}catch(t){return!1}},s.prototype.retrieve=function(e){var t,s=null;try{if(t=window.sessionStorage.getItem(e),t=JSON.parse(t),!t)return s;s=t.value,t.expiry<Date.now()&&(window.sessionStorage.removeItem(e),s=null)}catch(i){s=null}return s},s.prototype.remove=function(e){var t=!0;try{window.sessionStorage.removeItem(e)}catch(s){t=!1}return t},s.prototype.save=function(e,t){var s,i=!0,o={};try{o.expiry=Date.now()+this.cacheAge,o.value=t,s=JSON.stringify(o),window.sessionStorage.setItem(e,s)}catch(r){i=!1}return i},s.prototype.diff=function(e,t,s){var i,o,r,n,a,u,c=this.retrieve(e),p=null;if(s&&(a=s.length),o=Object.keys(t),r=o.length,!c)return t;for(n=0;r>n;n++)i=o[n],c.hasOwnProperty(i)&&t[i]===c[i]||(p||(p={}),p[i]=t[i]);if(p)for(u=0;a>u;u++)i=s[u],p[i]=t[i];return p},s.prototype.diffArray=function(e,t,s){var i,o,r=t.length,n=null,a=[];for(i=0;r>i;i++)o=t[i],n=this.diff(o[e],o,s),null!==n&&a.push(n);return a},e.exports=s},function(e,t,s){"use strict";function i(e){this.defaults={host:"https://api.ingest.io",all:"/<%=resource%>",byId:"/<%=resource%>/<%=id%>",trash:"/<%=resource%>?filter=trashed",deleteMethods:{permanent:"?permanent=1"},search:"/<%=resource%>?search=<%=input%>",tokenSource:null,resource:null},this.config=o(!0,{},this.defaults,e),this.cache=this.config.cache}var o=s(2),r=s(3),n=s(9);i.prototype._tokenSource=function(){var e=null;return this.config.tokenSource&&(e=this.config.tokenSource.call()),e},i.prototype.getAll=function(e){var t,s=n.parseTokens(this.config.host+this.config.all,{resource:this.config.resource});return t=new r({url:s,token:this._tokenSource(),headers:e}),t.send().then(this._updateCachedResources.bind(this))},i.prototype.getById=function(e){var t,s,i;return"string"!=typeof e||e.length<=0?n.promisify(!1,"IngestAPI Resource getById requires a valid id passed as a string."):(t=n.parseTokens(this.config.host+this.config.byId,{resource:this.config.resource,id:e}),this.cache&&this.cache.enabled&&(s=this.cache.retrieve(e)),s?n.promisify(!0,{data:s}):(i=new r({url:t,token:this._tokenSource()}),i.send().then(this._updateCachedResource.bind(this))))},i.prototype.getTrashed=function(e){var t,s=n.parseTokens(this.config.host+this.config.trash,{resource:this.config.resource});return t=new r({url:s,token:this._tokenSource(),headers:e}),t.send()},i.prototype.add=function(e){var t,s;return"object"!=typeof e?n.promisify(!1,"IngestAPI Resource add requires a resource passed as an object."):(t=n.parseTokens(this.config.host+this.config.all,{resource:this.config.resource}),s=new r({url:t,token:this._tokenSource(),method:"POST",data:e}),s.send().then(this._updateCachedResource.bind(this)))},i.prototype.update=function(e){var t,s,i;return"object"!=typeof e?n.promisify(!1,"IngestAPI Resource update requires a resource to be passed as an object."):(s=e,i=n.parseTokens(this.config.host+this.config.byId,{resource:this.config.resource,id:e.id}),this.cache&&this.cache.enabled&&(s=this.cache.diff(e.id,e)),s?(t=new r({url:i,token:this._tokenSource(),method:"PATCH",data:s}),t.send().then(this._updateCachedResource.bind(this))):n.promisify(!0,{data:this.cache.retrieve(e.id)}))},i.prototype["delete"]=function(e,t){return"boolean"!=typeof t&&(t=!0),"string"!=typeof e?n.promisify(!1,"IngestAPI Resource delete requires a resource to be passed as a string."):this._deleteResource(e,!1,t)},i.prototype.permanentDelete=function(e,t){return"boolean"!=typeof t&&(t=!0),"string"!=typeof e?n.promisify(!1,"IngestAPI Resource delete requires a resource to be passed as a string."):this._deleteResource(e,!0,t)},i.prototype._deleteResource=function(e,t,s){var i,o=n.parseTokens(this.config.host+this.config.byId,{resource:this.config.resource,id:e});return t===!0&&(o+=this.config.deleteMethods.permanent),i=new r({url:o,async:s,token:this._tokenSource(),method:"DELETE"}),i.send().then(this._deleteCachedResource.bind(this,e))},i.prototype.search=function(e,t,s){var i,o;return"string"!=typeof e?n.promisify(!1,"IngestAPI Resource search requires search input to be passed as a string."):(i=n.parseTokens(this.config.host+this.config.search,{resource:this.config.resource,input:e}),s&&(i+="&filter=trashed"),o=new r({url:i,token:this._tokenSource(),headers:t}),o.send())},i.prototype.searchTrash=function(e,t){return this.search(e,t,!0)},i.prototype.count=function(){var e,t=n.parseTokens(this.config.host+this.config.all,{resource:this.config.resource});return e=new r({url:t,token:this._tokenSource(),method:"HEAD"}),e.send().then(this._handleCountResponse)},i.prototype.trashCount=function(){var e,t=n.parseTokens(this.config.host+this.config.trash,{resource:this.config.resource});return e=new r({url:t,token:this._tokenSource(),method:"HEAD"}),e.send().then(this._handleCountResponse)},i.prototype._handleCountResponse=function(e){return parseInt(e.headers("Resource-Count"),10)},i.prototype._updateCachedResource=function(e){return this.cache&&this.cache.enabled&&this.cache.save(e.data.id,e.data),e},i.prototype._updateCachedResources=function(e){var t,s=e.data,i=s.length;if(this.cache&&this.cache.enabled)for(t=0;i>t;t++)this.cache.save(s[t].id,s[t]);return e},i.prototype._deleteCachedResource=function(e,t){return this.cache&&this.cache.enabled&&this.cache.remove(e),t},e.exports=i},function(e,t,s){"use strict";function i(e){var t={thumbnail:"/<%=resource%>/<%=id%>/thumbnail",thumbnails:"/<%=resource%>/<%=id%>/thumbnails"};e=a(!0,{},t,e),o.call(this,e)}var o=s(12),r=s(3),n=s(9),a=s(2);i.prototype=Object.create(o.prototype),i.prototype.constructor=i,i.prototype.getThumbnails=function(e){var t,s;return"string"!=typeof e?n.promisify(!1,"IngestAPI PlaybackContent getThumbnails requires an id to be passed as a string."):(t=n.parseTokens(this.config.host+this.config.thumbnails,{resource:this.config.resource,id:e}),s=new r({url:t,token:this._tokenSource()}),s.send())},i.prototype.addExternalThumbnails=function(e,t){var s,i,o=[];return"string"!=typeof e?n.promisify(!1,"IngestAPI PlaybackContent addExternal requires an id to be passed as a string."):Array.isArray(t)||"string"==typeof t?(Array.isArray(t)?o=t:o.push(t),s=n.parseTokens(this.config.host+this.config.thumbnails,{resource:this.config.resource,id:e}),i=new r({method:"POST",url:s,token:this._tokenSource(),data:o}),i.send()):n.promisify(!1,"IngestAPI PlaybackContent addExternal requires images as a string or an array of strings.")},i.prototype.uploadThumbnail=function(e,t){var s,i,o;return"string"!=typeof e?n.promisify(!1,"IngestAPI PlaybackContent uploadThumbnail requires an id to be passed as a string."):t&&t instanceof File&&n.isImage(t)?(i=n.parseTokens(this.config.host+this.config.thumbnail,{resource:this.config.resource,id:e}),o=new FormData,o.append("image",t),s=new r({method:"POST",url:i,token:this._tokenSource(),data:o}),s.send()):n.promisify(!1,"IngestAPI PlaybackContent uploadThumbnail requires a valid image.")},e.exports=i},function(e,t,s){"use strict";function i(e){var t={currentUser:"/users/me",transfer:"/users/<%=oldId%>/transfer/<%=newId%>",revoke:"/revoke"};e=a(!0,{},t,e),o.call(this,e)}var o=s(12),r=s(3),n=s(9),a=s(2);i.prototype=Object.create(o.prototype),i.prototype.constructor=i,i.prototype.getCurrentUserInfo=function(){var e=new r({url:this.config.host+this.config.currentUser,token:this._tokenSource()});return e.send()},i.prototype.transferUserAuthorship=function(e,t){var s,i,o;return"string"!=typeof e?n.promisify(!1,'IngestAPI transferUserAuthorship requires "oldId" to be passed as a string.'):"string"!=typeof t?n.promisify(!1,'IngestAPI transferUserAuthorship requires "newId" to be passed as a string'):(s={oldId:e,newId:t},i=n.parseTokens(this.config.host+this.config.transfer,s),o=new r({url:i,token:this._tokenSource(),method:"PATCH"}),o.send())},i.prototype.revokeCurrentUser=function(){var e=new r({url:this.config.host+this.config.currentUser+this.config.revoke,token:this._tokenSource(),method:"DELETE"});return e.send()},e.exports=i},function(e,t,s){"use strict";function i(e){var t={keys:"/<%=resource%>/<%=networkId%>/keys",keysById:"/<%=resource%>/<%=networkId%>/keys/<%=keyId%>",invite:"/<%=resource%>/<%=networkId%>/invite"};e=a(!0,{},t,e),o.call(this,e)}var o=s(12),r=s(3),n=s(9),a=s(2);i.prototype=Object.create(o.prototype),i.prototype.constructor=i,i.prototype.linkUser=function(e,t){var s,i,o;return"string"!=typeof e?n.promisify(!1,'IngestAPI linkUser requires "networkId" to be passed as a string.'):"string"!=typeof t?n.promisify(!1,'IngestAPI linkUser requires "userId" to be passed as a string.'):(s={id:t},o=n.parseTokens(this.config.host+this.config.byId,{resource:this.config.resource,id:e}),i=new r({url:o,data:s,token:this._tokenSource(),method:"LINK"}),i.send())},i.prototype.unlinkUser=function(e,t){var s,i,o;return"string"!=typeof e?n.promisify(!1,'IngestAPI unlinkUser requires "networkId" to be passed as a string.'):"string"!=typeof t?n.promisify(!1,'IngestAPI unlinkUser requires "userId" to be passed as a string.'):(s={id:t},o=n.parseTokens(this.config.host+this.config.byId,{resource:this.config.resource,id:e}),i=new r({url:o,data:s,token:this._tokenSource(),method:"UNLINK"}),i.send())},i.prototype.inviteUser=function(e,t,s){var i,o,a;return"string"!=typeof e?n.promisify(!1,'IngestAPI inviteUser requires "networkId" to be passed as a string.'):"string"!=typeof t?n.promisify(!1,'IngestAPI inviteUser requires "email" to be passed as a string.'):"string"!=typeof s?n.promisify(!1,'IngestAPI inviteUser requires "name" to be passed as a string.'):(i={email:t,name:s},a=n.parseTokens(this.config.host+this.config.invite,{resource:this.config.resource,networkId:e}),o=new r({url:a,data:i,token:this._tokenSource(),method:"POST"}),o.send())},i.prototype.getSecureKeys=function(e){var t,s;return"string"!=typeof e?n.promisify(!1,'IngestAPI getSecureKeys requires "networkId" to be passed as a string.'):(s=n.parseTokens(this.config.host+this.config.keys,{resource:this.config.resource,networkId:e}),t=new r({url:s,token:this._tokenSource()}),t.send())},i.prototype.addSecureKey=function(e,t){var s,i;return"string"!=typeof e?n.promisify(!1,'IngestAPI addSecureKey requires "networkId" to be passed as a string.'):"object"!=typeof t?n.promisify(!1,'IngestAPI addSecureKey requires "data" to be passed as an object.'):"string"!=typeof t.key?n.promisify(!1,"IngestAPI addSecureKey requires that the key be a string in RSA public key format."):("string"!=typeof t.title&&(t.title=""),i=n.parseTokens(this.config.host+this.config.keys,{resource:this.config.resource,networkId:e}),s=new r({url:i,token:this._tokenSource(),method:"POST",data:t}),s.send())},i.prototype.getSecureKeyById=function(e,t){var s,i;return"string"!=typeof e?n.promisify(!1,'IngestAPI getSecureKeyById requires a "networkId" to be passed as a string.'):"string"!=typeof t?n.promisify(!1,'IngestAPI getSecureKeyById requires a "keyId" to be passed as a string.'):(s=n.parseTokens(this.config.host+this.config.keysById,{resource:this.config.resource,networkId:e,keyId:t}),i=new r({url:s,token:this._tokenSource()}),i.send())},i.prototype.updateSecureKey=function(e,t){var s,i;return"string"!=typeof e?n.promisify(!1,'IngestAPI updateSecureKeyById requires "networkId" to be passed as a string.'):"object"!=typeof t?n.promisify(!1,'IngestAPI updateSecureKeyById requires "data" to be passed as an object.'):"string"!=typeof t.id?n.promisify(!1,'IngestAPI updateSecureKeyById requires param "data.id" to be a string.'):("string"!=typeof t.title&&(t.title=""),s=n.parseTokens(this.config.host+this.config.keysById,{resource:this.config.resource,networkId:e,keyId:t.id}),i=new r({url:s,token:this._tokenSource(),method:"PATCH",data:t}),i.send())},i.prototype.deleteSecureKey=function(e,t){var s,i;return"string"!=typeof e?n.promisify(!1,'IngestAPI deleteSecureKeyById requires a "networkId" to be passed as a string.'):"string"!=typeof t?n.promisify(!1,'IngestAPI deleteSecureKeyById requires a "keyId" to be passed as a string.'):(s=n.parseTokens(this.config.host+this.config.keysById,{resource:this.config.resource,networkId:e,keyId:t}),i=new r({url:s,token:this._tokenSource(),method:"DELETE"}),i.send())},e.exports=i},function(e,t,s){"use strict";function i(e){var t={playlists:"/<%=resource%>/<%=id%>/playlists",variants:"/<%=resource%>/<%=id%>/variants",withVariants:"/<%=resource%>?filter=variants",missingVariants:"/<%=resource%>?filter=missing_variants"};e=a(!0,{},t,e),o.call(this,e)}var o=s(13),r=s(3),n=s(9),a=s(2);i.prototype=Object.create(o.prototype),i.prototype.constructor=i,i.prototype.getPlaylists=function(e){var t,s;return"string"!=typeof e?n.promisify(!1,"IngestAPI Resource getPlaylists requires a valid video id passed as a string."):(t=n.parseTokens(this.config.host+this.config.playlists,{resource:this.config.resource,id:e}),s=new r({url:t,token:this._tokenSource()}),s.send())},i.prototype.getVariants=function(e){var t,s;return"string"!=typeof e?n.promisify(!1,"IngestAPI Resource getPlaylists requires a valid video id passed as a string."):(t=n.parseTokens(this.config.host+this.config.variants,{resource:this.config.resource,id:e}),s=new r({url:t,token:this._tokenSource()}),s.send())},i.prototype.getVideosWithVariants=function(e){var t,s=n.parseTokens(this.config.host+this.config.withVariants,{resource:this.config.resource});return t=new r({url:s,token:this._tokenSource(),headers:e}),t.send().then(this._updateCachedResources.bind(this))},i.prototype.getVideosMissingVariants=function(e){var t,s=n.parseTokens(this.config.host+this.config.missingVariants,{resource:this.config.resource});return t=new r({url:s,token:this._tokenSource(),headers:e}),t.send().then(this._updateCachedResources.bind(this))},e.exports=i},function(e,t,s){function i(e){var t={};e=a(!0,{},t,e),o.call(this,e)}var o=s(12),r=s(3),n=s(9),a=s(2);i.prototype=Object.create(o.prototype),i.prototype.constructor=i,i.prototype.link=function(e,t){return this._linkVideos(!0,e,t)},i.prototype.unlink=function(e,t){return this._linkVideos(!1,e,t)},i.prototype._linkVideos=function(e,t,s){var i,o=[];if("boolean"!=typeof e)return n.promisify(!1,"IngestAPI Playlists link requires a valid link flag passed as a boolean.");if("string"!=typeof t)return n.promisify(!1,"IngestAPI Playlists link requires a valid playlistId passed as a string.");if(!s||!Array.isArray(s)&&"object"!=typeof s)return n.promisify(!1,"IngestAPI Playlists link requires a valid video passed as a valid object or array.");if(Array.isArray(s)?o=s:o.push(s),0===o.length)return n.promisify(!1,"IngestAPI Playlists link requires at least one video to link.");var a=n.parseTokens(this.config.host+this.config.byId,{resource:this.config.resource,id:t});return i=new r({method:e?"LINK":"UNLINK",url:a,token:this._tokenSource(),data:o}),i.send().then(this._updateCachedResources.bind(this))},e.exports=i},function(e,t,s){"use strict";function i(e){o.call(this,e)}var o=s(12),r=s(3),n=s(9);s(2);i.prototype=Object.create(o.prototype),i.prototype.constructor=i,i.prototype.add=function(e){var t,s;return"object"!=typeof e?n.promisify(!1,"IngestAPI Jobs `add` requires a resource passed as an object."):(t=n.parseTokens(this.config.host+this.config.all,{
resource:this.config.resource}),e.hasOwnProperty("video")&&"string"==typeof e.video&&this._deleteCachedResource(e.video),s=new r({url:t,token:this._tokenSource(),method:"POST",data:e}),s.send().then(this._updateCachedResource.bind(this)))},e.exports=i}])});
//# sourceMappingURL=ingest.js.map