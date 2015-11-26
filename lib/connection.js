/**
 * 解析url，根据url中指定的协议创建对应的连接对象
 * @param url
 * @param options
 * @returns {*}
 */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _slicedToArray(arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }

function connection(url, options, handler) {
  if (typeof url !== 'string') {
    throw new Error('url is incorrect');
  }

  var _w$exec = /^((\w+):\/\/)?(.*)/.exec(url);

  var _w$exec2 = _slicedToArray(_w$exec, 4);

  var _w$exec2$2 = _w$exec2[2];
  var protocol = _w$exec2$2 === undefined ? 'http' : _w$exec2$2;
  var urlWithoutProtocol = _w$exec2[3];

  var func = connection[protocol];
  if (!func) {
    throw new Error('protocol "' + protocol + '" no support');
  }
  return func(urlWithoutProtocol, options, handler);
}

exports['default'] = connection;
module.exports = exports['default'];