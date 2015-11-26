// 判断环境，浏览器环境存在window对象
'use strict';

if (typeof window !== 'undefined') {

  // 不考虑IE6以下的ActiveX方式
  if (window.XMLHttpRequest) {
    module.exports = window.XMLHttpRequest;
  } else {
    console.log('当前浏览器不支持XMLHttpRequest');
  }
} else {

  // nodejs中使用xhr2模块
  var xmlhttprequestDep = 'xhr2';
  var xmlhttprequest = require(xmlhttprequestDep);
  module.exports = xmlhttprequest.XMLHttpRequest || xmlhttprequest;
}