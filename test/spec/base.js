/**
 * 基本功能（连接，请求和事件触发）
 */
describe('基本功能', function() {
  this.timeout(15000);

  var baseTest = function(address) {

    var conn;

    it('创建连接', function() {
      conn = connection(address);
      expect(conn).to.exist;
    });

    it('请求数据', function() {
      expect(function(){conn.request()}).to.not.throw(Error);
    });

    describe('触发事件', function() {

      beforeEach(function() {
        conn = connection(address);
      });

      function triggerEvent(type, done) {
        var errTimeout = setTimeout(function () {
          expect(false).to.be.true;
          done();
        }, 2000);

        conn.on(type, function() {
          clearTimeout(errTimeout);
          expect(true).to.be.true;
          done();
        });
      }

      it('open', function(done) {
        triggerEvent('open', done);
        conn.request();
      });

      it('request', function(done) {
        triggerEvent('request', done);
        conn.request();
      });

      it('response', function(done) {
        triggerEvent('response', done);
        conn.request('/');
      });
      it('close', function(done) {
        triggerEvent('close', done);
        conn.close();
      });
    });
  };

  describe('Http', function() {
    baseTest(TEST_HTTP_ADDRESS);
  });

  //describe('Https', function() {
  //  baseTest(TEST_HTTPS_ADDRESS);
  //});

  describe('ws', function() {
    baseTest(TEST_WS_ADDRESS);
  });

  //describe('wss', function() {
  //  baseTest(TEST_WSS_ADDRESS);
  //});
});