'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.serialize = serialize;
exports.param = param;
exports.extend = extend;
var escape = encodeURIComponent;

function serialize(params, obj, traditional, scope) {
  var array = obj instanceof Array;
  for (var key in obj) {
    var value = obj[key];

    if (scope) key = traditional ? scope : scope + '[' + (array ? '' : key) + ']';
    // handle data in serializeArray() format
    if (!scope && array) params.add(value.name, value.value);else if (traditional ? value instanceof Array : typeof value === 'object') serialize(params, value, traditional, key);else params.add(key, value);
  }
}

function param(obj, traditional) {
  var params = [];
  params.add = function (k, v) {
    this.push(escape(k) + '=' + escape(v));
  };
  serialize(params, obj, traditional);
  return params.join('&').replace('%20', '+');
}

function extend(target) {
  var slice = Array.prototype.slice;
  slice.call(arguments, 1).forEach(function (source) {
    for (var key in source) if (source[key] !== undefined) target[key] = source[key];
  });
  return target;
}

// recurse into nested objects