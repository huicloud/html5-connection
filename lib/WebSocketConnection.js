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

var _WebSocket = require('./WebSocket');

var _WebSocket2 = _interopRequireDefault(_WebSocket);

var WebSocketConnection = (function (_BaseConnection) {

  /**
   *
   * @param address
   * @param {{deferred: boolean}} options
   *  deferred: false 创建连接时马上连接websocket，默认
   *            true  延时在第一次请求时连接websocket
   */

  function WebSocketConnection(address, options, handler) {
    _classCallCheck(this, WebSocketConnection);

    _get(Object.getPrototypeOf(WebSocketConnection.prototype), 'constructor', this).apply(this, arguments);

    this._protocol = 'ws';
    this._ws = null;

    var deferred = options && options.deferred === true || false;

    if (deferred === false) {
      this._connect();
    }
  }

  _inherits(WebSocketConnection, _BaseConnection);

  _createClass(WebSocketConnection, [{
    key: 'getStatus',
    value: function getStatus() {
      return this._ws ? this._ws.readyState : _WebSocket2['default'].CLOSED;
    }
  }, {
    key: '_connect',
    value: function _connect() {
      var _this = this;

      // 连接创建websocket
      if (typeof _WebSocket2['default'] !== 'undefined') {
        this._ws = new _WebSocket2['default'](this.getAddress());

        // 避免WebSocket上没有状态静态值
        if (_WebSocket2['default'].OPEN === undefined) {
          _WebSocket2['default'].CONNECTING = this._ws.CONNECTING;
          _WebSocket2['default'].OPEN = this._ws.OPEN;
          _WebSocket2['default'].CLOSING = this._ws.CLOSING;
          _WebSocket2['default'].CLOSED = this._ws.CLOSED;
        }
        this._ws.binaryType = this.options.binaryType || this.options.dataType || 'arraybuffer';

        this._ws.addEventListener('open', function () {
          _this.trigger(_BaseConnection3['default'].EVENT_OPEN);
        });
        this._ws.addEventListener('error', function () {
          _this.trigger(_BaseConnection3['default'].EVENT_ERROR);
        });
        this._ws.addEventListener('close', function () {
          _this.trigger(_BaseConnection3['default'].EVENT_CLOSE);
        });
        this._ws.addEventListener('message', function (message) {
          _this.trigger(_BaseConnection3['default'].EVENT_MESSAGE, message.data);
          _this.trigger(_BaseConnection3['default'].EVENT_RESPONSE, message.data);
        });
      } else {
        throw Error('Don\'t support WebSocket');
      }
    }
  }, {
    key: 'request',
    value: function request(message, options) {
      var _this2 = this;

      message = message || '';
      if (this.getStatus() === _WebSocket2['default'].CLOSED) {
        this._connect();
      }

      if (this.getStatus() !== _WebSocket2['default'].OPEN) {
        this._ws.addEventListener('open', function () {
          _this2._ws.send(message);
          _this2.trigger(_BaseConnection3['default'].EVENT_SEND);
          _this2.trigger(_BaseConnection3['default'].EVENT_REQUEST);
        });
      } else {
        this._ws.send(message);
        this.trigger(_BaseConnection3['default'].EVENT_SEND);
        this.trigger(_BaseConnection3['default'].EVENT_REQUEST);
      }
      return this;
    }
  }, {
    key: 'close',
    value: function close() {
      if (this.getStatus() !== _WebSocket2['default'].CLOSED) {
        this._ws.close();
        this._ws = null;
      }
      return this;
    }
  }]);

  return WebSocketConnection;
})(_BaseConnection3['default']);

exports['default'] = WebSocketConnection;
;

_connection2['default'].ws = function (url, options, handler) {
  return new WebSocketConnection(url, options, handler, false);
};

_connection2['default'].wss = function (url, options, handler) {
  return new WebSocketConnection(url, options, handler, true);
};
module.exports = exports['default'];