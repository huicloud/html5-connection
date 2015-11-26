/**
 * connection基类
 */
class BaseConnection {

  /**
   * 构造方法
   * @param {!string} address 连接地址
   * @param {!object} options 设置参数
   * @param {object=} handler 事件处理对象
   * @param {boolean=} [secure=false]
   */
  constructor(address, options, handler, secure) {
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

  getAddress() {
    return this.getProtocol() + '://' + this._address.replace(/^(\w+:\/\/)?/, '');
  }

  getProtocol() {
    return this._protocol + (this._secure ? 's' : '');
  }

  request(message, options) {
  }

  send(message, options) {
    this.request(message, options);
  }

  close() {
  }

  /**
   * 事件监听接口
   */

  on(type, listener) {
    if (typeof listener === 'function') {
      var listeners = this._listenerMap[type] || (this._listenerMap[type] = []);
      if (listeners.indexOf(listener) < 0) {
        listeners.push(listener);
      }
    }
    return this;
  }

  off(type, listener) {
    if (typeof listener === 'function') {
      var listeners = this._listenerMap[type] || (this._listenerMap[type] = []);
      var index = listeners.indexOf(listener);
      index >= 0 && listeners.splice(index, 1);
    }
    return this;
  }

  trigger(type, ...args) {
    var listeners = this._listenerMap[type];
    listeners && listeners.forEach((listener) => listener.apply(this, args));

    // 同时触发handler中对应方法
    this._handler && typeof this._handler[type] === 'function' && this._handler[type].apply(this._handler, args);
    return this;
  }
}

BaseConnection.EVENT_OPEN = 'open';
BaseConnection.EVENT_CLOSE = 'close';
BaseConnection.EVENT_ERROR = 'error';
BaseConnection.EVENT_REQUEST = 'request';
BaseConnection.EVENT_SEND = 'send';
BaseConnection.EVENT_RESPONSE = 'response';
BaseConnection.EVENT_MESSAGE = 'message';
BaseConnection.EVENT_PROGRESS = 'progress';

export default BaseConnection;
