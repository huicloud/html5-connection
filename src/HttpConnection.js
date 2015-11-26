import connection from './connection';
import BaseConnection from './BaseConnection';
import {extend} from './util';
import ajax from './ajax';

export default class HttpConnection extends BaseConnection {

  constructor(...args) {
    super(...args);

    // 用于记录当前未关闭的请求
    this._request = [];
  }

  request(message, options) {
    options = extend({}, this.options, options);

    options.success = (data, textStatus, jqXHR) => {
      this.trigger(BaseConnection.EVENT_MESSAGE, data);
      this.trigger(BaseConnection.EVENT_RESPONSE, data);
    };

    options.error = (jqXHR, textStatus, errorThrown) => {
      this.trigger(BaseConnection.EVENT_ERROR, errorThrown);
    };

    options.complete = () => {
      var index = this._request.indexOf(xhr);
      this._request.splice(index, 1);
    };

    options.url = this.getAddress() + (message ? message : '');

    var xhr = ajax(options);

    xhr && (xhr.onreadystatechange = ((origFun) => {
      return () => {
        if (xhr.readyState === 2) {

          // 发出了请求
          this.trigger(BaseConnection.EVENT_SEND);
          this.trigger(BaseConnection.EVENT_REQUEST);
        }
        origFun && origFun();
      };
    })(xhr.onreadystatechange));

    // 打开了连接
    this.trigger(BaseConnection.EVENT_OPEN);

    this._request.push(xhr);

    xhr.onprogress = (event) => {
      this.trigger(BaseConnection.EVENT_PROGRESS, event);
    };

    return this;
  }

  close() {

    // 取消全部未结束的请求
    this._request.forEach((xhr, index) => {
      xhr.abort();
      this._request.splice(index, 1);
    });

    this.trigger(BaseConnection.EVENT_CLOSE);
    return this;
  }
};

connection.http = function (url, options, handler) {
  return new HttpConnection(url, options, handler, false);
};

connection.https = function (url, options, handler) {
  return new HttpConnection(url, options, handler, true);
};
