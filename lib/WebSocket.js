// WebSocket 依赖，node环境使用模块ws
'use strict';

if (typeof window !== 'undefined') {
  if (window.WebSocket) {
    module.exports = window.WebSocket;
  } else {
    console.log('当前浏览器不支持WebSocket');
  }
} else if (typeof WebSocket !== 'undefined') {
  module.exports = WebSocket;
} else {
  var wsDep = 'ws';
  module.exports = require(wsDep);
}