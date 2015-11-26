/**
 * connection基类
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var BaseConnection = (function () {

  /**
   * 构造方法
   * @param {!string} address 连接地址
   * @param {!object} options 设置参数
   * @param {object=} handler 事件处理对象
   * @param {boolean=} [secure=false]
   */

  function BaseConnection(address, options, handler, secure) {
    _classCallCheck(this, BaseConnection);

    this._address = address;
    this.options = options || {};

    if (typeof handler === 'boolean') {
      this._secure = handler;
      this._handler = null;
    } else {
      this._secure = secure || false;
      this._handler = handler;
    }

    // 默认协议
    this._protocol = 'http';

    this._listenerMap = {};
  }

  _createClass(BaseConnection, [{
    key: 'getAddress',
    value: function getAddress() {
      return this.getProtocol() + '://' + this._address.replace(/^(\w+:\/\/)?/, '');
    }
  }, {
    key: 'getProtocol',
    value: function getProtocol() {
      return this._protocol + (this._secure ? 's' : '');
    }
  }, {
    key: 'request',
    value: function request(message, options) {}
  }, {
    key: 'send',
    value: function send(message, options) {
      this.request(message, options);
    }
  }, {
    key: 'close',
    value: function close() {}
  }, {
    key: 'on',

    /**
     * 事件监听接口
     */

    value: function on(type, listener) {
      if (typeof listener === 'function') {
        var listeners = this._listenerMap[type] || (this._listenerMap[type] = []);
        if (listeners.indexOf(listener) < 0) {
          listeners.push(listener);
        }
      }
      return this;
    }
  }, {
    key: 'off',
    value: function off(type, listener) {
      if (typeof listener === 'function') {
        var listeners = this._listenerMap[type] || (this._listenerMap[type] = []);
        var index = listeners.indexOf(listener);
        index >= 0 && listeners.splice(index, 1);
      }
      return this;
    }
  }, {
    key: 'trigger',
    value: function trigger(type) {
      var _this = this;

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var listeners = this._listenerMap[type];
      listeners && listeners.forEach(function (listener) {
        return listener.apply(_this, args);
      });

      // 同时触发handler中对应方法
      this._handler && typeof this._handler[type] === 'function' && this._handler[type].apply(this._handler, args);
      return this;
    }
  }]);

  return BaseConnection;
})();

BaseConnection.EVENT_OPEN = 'open';
BaseConnection.EVENT_CLOSE = 'close';
BaseConnection.EVENT_ERROR = 'error';
BaseConnection.EVENT_REQUEST = 'request';
BaseConnection.EVENT_SEND = 'send';
BaseConnection.EVENT_RESPONSE = 'response';
BaseConnection.EVENT_MESSAGE = 'message';
BaseConnection.EVENT_PROGRESS = 'progress';

exports['default'] = BaseConnection;
module.exports = exports['default'];