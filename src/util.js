var escape = encodeURIComponent

export function serialize(params, obj, traditional, scope){
  var array = (obj instanceof Array);
  for (var key in obj) {
    var value = obj[key];

    if (scope) key = traditional ? scope : scope + '[' + (array ? '' : key) + ']'
    // handle data in serializeArray() format
    if (!scope && array) params.add(value.name, value.value)
    // recurse into nested objects
    else if (traditional ? (value instanceof Array) : (typeof value === 'object'))
      serialize(params, value, traditional, key)
    else params.add(key, value)
  }
}

export function param(obj, traditional){
  var params = []
  params.add = function(k, v){ this.push(escape(k) + '=' + escape(v)) }
  serialize(params, obj, traditional)
  return params.join('&').replace('%20', '+')
}

export function extend(target) {
  var slice = Array.prototype.slice;
  slice.call(arguments, 1).forEach(function(source) {
    for (var key in source)
      if (source[key] !== undefined)
        target[key] = source[key]
  })
  return target
}
