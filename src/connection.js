/**
 * 解析url，根据url中指定的协议创建对应的连接对象
 * @param url
 * @param options
 * @returns {*}
 */
function connection(url, options, handler) {
  if (typeof url !== 'string') {
    throw new Error('url is incorrect');
  }
  var [,,protocol='http', urlWithoutProtocol] = /^((\w+):\/\/)?(.*)/.exec(url);

  var func = connection[protocol];
  if (!func) {
    throw new Error('protocol "' + protocol + '" no support');
  }
  return func(urlWithoutProtocol, options, handler);
}

export default connection;