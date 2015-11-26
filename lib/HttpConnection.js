'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _connection = require('./connection');

var _connection2 = _interopRequireDefault(_connection);

var _BaseConnection2 = require('./BaseConnection');

var _BaseConnection3 = _interopRequireDefault(_BaseConnection2);

var _util = require('./util');

var _ajax = require('./ajax');

var _ajax2 = _interopRequireDefault(_ajax);

var HttpConnection = (function (_BaseConnection) {
  function HttpConnection() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _classCallCheck(this, HttpConnection);

    _get(Object.getPrototypeOf(HttpConnection.prototype), 'constructor', this).apply(this, args);

    // 用于记录当前未关闭的请求
    this._request = [];
  }

  _inherits(HttpConnection, _BaseConnection);

  _createClass(HttpConnection, [{
    key: 'request',
    value: function request(message, options) {
      var _this = this;

      options = (0, _util.extend)({}, this.options, options);

      options.success = function (data, textStatus, jqXHR) {
        _this.trigger(_BaseConnection3['default'].EVENT_MESSAGE, data);
        _this.trigger(_BaseConnection3['default'].EVENT_RESPONSE, data);
      };

      options.error = function (jqXHR, textStatus, errorThrown) {
        _this.trigger(_BaseConnection3['default'].EVENT_ERROR, errorThrown);
      };

      options.complete = function () {
        var index = _this._request.indexOf(xhr);
        _this._request.splice(index, 1);
      };

      options.url = this.getAddress() + (message ? message : '');

      var xhr = (0, _ajax2['default'])(options);

      xhr && (xhr.onreadystatechange = (function (origFun) {
        return function () {
          if (xhr.readyState === 2) {

            // 发出了请求
            _this.trigger(_BaseConnection3['default'].EVENT_SEND);
            _this.trigger(_BaseConnection3['default'].EVENT_REQUEST);
          }
          origFun && origFun();
        };
      })(xhr.onreadystatechange));

      // 打开了连接
      this.trigger(_BaseConnection3['default'].EVENT_OPEN);

      this._request.push(xhr);

      xhr.onprogress = function (event) {
        _this.trigger(_BaseConnection3['default'].EVENT_PROGRESS, event);
      };

      return this;
    }
  }, {
    key: 'close',
    value: function close() {
      var _this2 = this;

      // 取消全部未结束的请求
      this._request.forEach(function (xhr, index) {
        xhr.abort();
        _this2._request.splice(index, 1);
      });

      this.trigger(_BaseConnection3['default'].EVENT_CLOSE);
      return this;
    }
  }]);

  return HttpConnection;
})(_BaseConnection3['default']);

exports['default'] = HttpConnection;
;

_connection2['default'].http = function (url, options, handler) {
  return new HttpConnection(url, options, handler, false);
};

_connection2['default'].https = function (url, options, handler) {
  return new HttpConnection(url, options, handler, true);
};
module.exports = exports['default'];