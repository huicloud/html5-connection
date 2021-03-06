'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); }

var _XMLHttpRequest = require('./XMLHttpRequest');

var _XMLHttpRequest2 = _interopRequireDefault(_XMLHttpRequest);

var _util = require('./util');

/**
 * 模拟jquery的ajax接口
 */

/**
 * 得到ArrayBuffer类型的响应数据
 * @param xhr
 * @returns {ArrayBuffer}
 */
function getArrayBufferResponse(xhr) {
  if (typeof ArrayBuffer === 'undefined') {
    throw new Error('不支持ArrayBuffer类型');
  } else if (xhr.response instanceof ArrayBuffer) {
    return xhr.response;
  } else {

    var text = xhr.responseText;
    var length = text.length;
    var buf = new ArrayBuffer(length);
    var bufView = new Uint8Array(buf);
    for (var i = 0; i < length; i++) {

      // "& 0xff"，表示在每个字符的两个字节之中，只保留后一个字节，将前一个字节扔掉。原因是浏览器解读字符的时候，会把字符自动解读成Unicode的0xF700-0xF7ff区段。
      // http://www.ruanyifeng.com/blog/2012/09/xmlhttprequest_level_2.html
      bufView[i] = text.charCodeAt(i) & 255;
    }
    return buf;
  }
}

/**
 * 得到Blob类型的响应数据
 * @param xhr
 */
function getBlobResponse(xhr) {
  if (typeof Blob === 'undefined') {
    throw new Error('不支持Blob类型');
  } else if (xhr.response instanceof Blob) {
    return xhr.response;
  } else {
    var buf = getArrayBufferResponse(xhr);

    // TODO 未知类型
    return new Blob([buf]);
  }
}

// 判断如果$.ajax存在则直接使用$.ajax
if (typeof $ !== 'undefined' && typeof $.ajax === 'function' && typeof XDomainRequest === 'undefined') {
  var binaryTransport = function (options, originalOptions, jqXHR) {
    return {
      send: function send(headers, callback) {
        var data, type, url, xhr;
        xhr = options.xhr();

        url = options.url;
        type = options.type;
        data = options.data || null;
        xhr.onload = function () {

          var response = options.dataType === 'arraybuffer' ? getArrayBufferResponse(xhr) : getBlobResponse(xhr);

          var result = _defineProperty({}, options.dataType, response);
          return callback(xhr.status, xhr.statusText, result, xhr.getAllResponseHeaders());
        };
        xhr.onerror = 'error', function (err) {
          return callback(-1, err);
        };
        xhr.ontimeout = function (err) {
          return callback(-1, err);
        };

        xhr.open(type, url, true);

        // 因为IE的问题，只能将设置responseType的操作放在xhr.open之后
        // https://connect.microsoft.com/IE/feedback/details/795580/ie11-xmlhttprequest-incorrectly-throws-invalidstateerror-when-setting-responsetype
        // 判断是否支持设置responseType
        var supported = typeof xhr.responseType === 'string';

        // 支持二进制请求直接设置responseType
        if (supported) {

          // 响应类型默认arraybuffer，可以设置为blob（响应回来使用response取得数据）
          xhr.responseType = options.dataType;
        } else {

          // 不支持则尝试使用用户自定义的字符集方式（响应回来使用responseText取得数据）
          xhr.overrideMimeType ? xhr.overrideMimeType('text/plain; charset=x-user-defined') : xhr.setRequestHeader('Accept-Charset', 'x-user-defined');
        }

        for (var i in headers) {
          xhr.setRequestHeader(i, headers[i]);
        }

        return xhr.send(data);
      },
      abort: function abort() {
        return jqXHR.abort();
      }
    };
  };

  // 从jqXHR中暴露原生的xhr
  var generateXHRFun = $.ajaxSettings.xhr;

  // jquery强制支持异步跨域
  $.support.cors = true;

  $.ajaxSetup({
    xhr: function xhr() {
      var xhr = generateXHRFun.call(this);
      this.setXHR(xhr);
      return xhr;
    },
    beforeSend: function beforeSend(jqXHR, settings) {
      settings.setXHR = function (xhr) {
        xhr.abort = jqXHR.abort;
        jqXHR.xhr = xhr;
      };
    },
    crossDomain: true
  });

  $.ajaxTransport('+arraybuffer', binaryTransport);
  $.ajaxTransport('+blob', binaryTransport);

  module.exports = function ajax() {
    var jqXHR = $.ajax.apply($, [].slice.call(arguments));
    return jqXHR.xhr;
  };
} else {
  var jsonpID, nodejs, document, key, name, rscript, scriptTypeRE, xmlTypeRE, jsonType, htmlType, blankRE;
  var ajax;

  (function () {

    // trigger a custom event and return false if it was cancelled

    var triggerAndReturn = function (context, eventName, data) {
      //todo: Fire off some events
      //var event = $.Event(eventName)
      //$(context).trigger(event, data)
      return true; //!event.defaultPrevented
    };

    // trigger an Ajax "global" event

    var triggerGlobal = function (settings, context, eventName, data) {
      if (settings.global) return triggerAndReturn(context || document, eventName, data);
    };

    var ajaxStart = function (settings) {
      if (settings.global && ajax.active++ === 0) triggerGlobal(settings, null, 'ajaxStart');
    };

    var ajaxStop = function (settings) {
      if (settings.global && ! --ajax.active) triggerGlobal(settings, null, 'ajaxStop');
    };

    // triggers an extra global event "ajaxBeforeSend" that's like "ajaxSend" but cancelable

    var ajaxBeforeSend = function (xhr, settings) {
      var context = settings.context;
      if (settings.beforeSend.call(context, xhr, settings) === false || triggerGlobal(settings, context, 'ajaxBeforeSend', [xhr, settings]) === false) return false;

      triggerGlobal(settings, context, 'ajaxSend', [xhr, settings]);
    };

    var ajaxSuccess = function (data, xhr, settings) {
      var context = settings.context,
          status = 'success';
      settings.success.call(context, data, status, xhr);
      triggerGlobal(settings, context, 'ajaxSuccess', [xhr, settings, data]);
      ajaxComplete(status, xhr, settings);
    };

    // type: "timeout", "error", "abort", "parsererror"

    var ajaxError = function (error, type, xhr, settings) {
      var context = settings.context;
      settings.error.call(context, xhr, type, error);
      triggerGlobal(settings, context, 'ajaxError', [xhr, settings, error]);
      ajaxComplete(type, xhr, settings);
    };

    // status: "success", "notmodified", "error", "timeout", "abort", "parsererror"

    var ajaxComplete = function (status, xhr, settings) {
      var context = settings.context;
      settings.complete.call(context, xhr, status);
      triggerGlobal(settings, context, 'ajaxComplete', [xhr, settings]);
      ajaxStop(settings);
    };

    // Empty function, used as default callback

    var empty = function () {};

    var mimeToDataType = function (mime) {
      return mime && (mime == htmlType ? 'html' : mime == jsonType ? 'json' : scriptTypeRE.test(mime) ? 'script' : xmlTypeRE.test(mime) && 'xml') || 'text';
    };

    var appendQuery = function (url, query) {
      return (url + '&' + query).replace(/[&?]{1,2}/, '?');
    };

    // serialize payload and append it to the URL for GET requests

    var serializeData = function (options) {
      if (typeof options.data === 'object') options.data = (0, _util.param)(options.data);
      if (options.data && (!options.type || options.type.toUpperCase() == 'GET')) options.url = appendQuery(options.url, options.data);
    };

    // 修改自https://github.com/ForbesLindesay/ajax
    jsonpID = 0;
    nodejs = typeof window === 'undefined';
    document = !nodejs && window.document;
    rscript = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
    scriptTypeRE = /^(?:text|application)\/javascript/i;
    xmlTypeRE = /^(?:text|application)\/xml/i;
    jsonType = 'application/json';
    htmlType = 'text/html';
    blankRE = /^\s*$/;

    ajax = module.exports = function (options) {
      var settings = (0, _util.extend)({}, options || {});
      for (key in ajax.settings) if (settings[key] === undefined) settings[key] = ajax.settings[key];

      ajaxStart(settings);

      if (!settings.crossDomain) {
        settings.crossDomain = /^([\w-]+:)?\/\/([^\/]+)/.test(settings.url) && !nodejs && !!window.location && RegExp.$2 != window.location.host;
      }

      var dataType = settings.dataType,
          hasPlaceholder = /=\?/.test(settings.url);
      if (dataType == 'jsonp' || hasPlaceholder) {
        if (!hasPlaceholder) settings.url = appendQuery(settings.url, 'callback=?');
        return ajax.JSONP(settings);
      }

      if (!settings.url) settings.url = !nodejs && !!window.location && window.location.toString();
      serializeData(settings);

      var mime = settings.accepts[dataType],
          baseHeaders = {},
          protocol = /^([\w-]+:)\/\//.test(settings.url) ? RegExp.$1 : !nodejs && !!window.location && window.location.protocol,
          xhr = ajax.settings.xhr(),
          abortTimeout;

      if (!settings.crossDomain) baseHeaders['X-Requested-With'] = 'XMLHttpRequest';else if (typeof XDomainRequest !== 'undefined') {
        xhr = new XDomainRequest();
        xhr.onload = function () {
          xhr.readyState = 4;
          xhr.status = 200;
          xhr.onreadystatechange();
        };
        xhr.error = function () {
          xhr.readyState = 4;
          xhr.status = 400;
          xhr.onreadystatechange();
        };
      }
      if (mime) {
        baseHeaders['Accept'] = mime;
        if (mime.indexOf(',') > -1) mime = mime.split(',', 2)[0];
        xhr.overrideMimeType && xhr.overrideMimeType(mime);
      }
      if (settings.contentType || settings.data && settings.type.toUpperCase() != 'GET') baseHeaders['Content-Type'] = settings.contentType || 'application/x-www-form-urlencoded';
      settings.headers = (0, _util.extend)(baseHeaders, settings.headers || {});

      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          clearTimeout(abortTimeout);
          var result,
              error = false;
          if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304 || xhr.status == 0 && protocol == 'file:') {
            dataType = dataType || mimeToDataType(xhr.contentType || xhr.getResponseHeader && xhr.getResponseHeader('content-type'));

            try {
              if (dataType == 'script') (1, eval)(result);else if (dataType == 'xml') result = xhr.responseXML;else if (dataType == 'json') result = blankRE.test(xhr.responseText) ? null : JSON.parse(xhr.responseText);else if (dataType === 'arraybuffer') result = getArrayBufferResponse(xhr);else if (dataType === 'blob') result = getBlobResponse(xhr);else result = xhr.responseText;
            } catch (e) {
              error = e;
            }

            if (error) ajaxError(error, 'parsererror', xhr, settings);else ajaxSuccess(result, xhr, settings);
          } else {
            ajaxError(null, 'error', xhr, settings);
          }
        }
      };

      var async = 'async' in settings ? settings.async : true;
      xhr.open(settings.type, settings.url, async);

      if (dataType == 'arraybuffer' || dataType == 'blob') {

        // 因为IE的问题，只能将设置responseType的操作放在xhr.open之后
        // https://connect.microsoft.com/IE/feedback/details/795580/ie11-xmlhttprequest-incorrectly-throws-invalidstateerror-when-setting-responsetype
        // 判断是否支持设置responseType
        var supported = typeof xhr.responseType === 'string';

        // 支持二进制请求直接设置responseType
        if (supported) {

          // 响应类型默认arraybuffer，可以设置为blob（响应回来使用response取得数据）
          xhr.responseType = options.dataType;
        } else {

          // 不支持则尝试使用用户自定义的字符集方式（响应回来使用responseText取得数据）
          xhr.overrideMimeType ? xhr.overrideMimeType('text/plain; charset=x-user-defined') : xhr.setRequestHeader('Accept-Charset', 'x-user-defined');
        }
      }

      for (name in settings.headers) xhr.setRequestHeader(name, settings.headers[name]);

      if (ajaxBeforeSend(xhr, settings) === false) {
        xhr.abort();
        return false;
      }

      if (settings.timeout > 0) abortTimeout = setTimeout(function () {
        xhr.onreadystatechange = empty;
        xhr.abort();
        ajaxError(null, 'timeout', xhr, settings);
      }, settings.timeout);

      // avoid sending empty string (#319)
      xhr.send(settings.data ? settings.data : null);
      return xhr;
    };

    // Number of active Ajax requests
    ajax.active = 0;

    ajax.JSONP = function (options) {
      if (!('type' in options)) return ajax(options);

      var callbackName = 'jsonp' + ++jsonpID,
          script = document.createElement('script'),
          abort = function abort() {
        //todo: remove script
        //$(script).remove()
        if (!nodejs && callbackName in window) window[callbackName] = empty;
        ajaxComplete('abort', xhr, options);
      },
          xhr = { abort: abort },
          abortTimeout,
          head = document.getElementsByTagName('head')[0] || document.documentElement;

      if (options.error) script.onerror = function () {
        xhr.abort();
        options.error();
      };

      if (!nodejs) window[callbackName] = function (data) {
        clearTimeout(abortTimeout);
        //todo: remove script
        //$(script).remove()
        delete window[callbackName];
        ajaxSuccess(data, xhr, options);
      };

      serializeData(options);
      script.src = options.url.replace(/=\?/, '=' + callbackName);

      // Use insertBefore instead of appendChild to circumvent an IE6 bug.
      // This arises when a base node is used (see jQuery bugs #2709 and #4378).
      head.insertBefore(script, head.firstChild);

      if (options.timeout > 0) abortTimeout = setTimeout(function () {
        xhr.abort();
        ajaxComplete('timeout', xhr, options);
      }, options.timeout);

      return xhr;
    };

    ajax.settings = {
      // Default type of request
      type: 'GET',
      // Callback that is executed before request
      beforeSend: empty,
      // Callback that is executed if the request succeeds
      success: empty,
      // Callback that is executed the the server drops error
      error: empty,
      // Callback that is executed on request complete (both: error and success)
      complete: empty,
      // The context for the callbacks
      context: null,
      // Whether to trigger "global" Ajax events
      global: true,
      // Transport
      xhr: function xhr() {
        return new _XMLHttpRequest2['default']();
      },
      // MIME types mapping
      accepts: {
        script: 'text/javascript, application/javascript',
        json: jsonType,
        xml: 'application/xml, text/xml',
        html: htmlType,
        text: 'text/plain'
      },
      // Whether the request is to another domain
      crossDomain: false,
      // Default timeout
      timeout: 0
    };

    ajax.get = function (url, success) {
      return ajax({ url: url, success: success });
    };

    ajax.post = function (url, data, success, dataType) {
      if (typeof data === 'function') dataType = dataType || success, success = data, data = null;
      return ajax({ type: 'POST', url: url, data: data, success: success, dataType: dataType });
    };

    ajax.getJSON = function (url, success) {
      return ajax({ url: url, success: success, dataType: 'json' });
    };
  })();
}