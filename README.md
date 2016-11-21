# 支持Http和WebSocket的连接模块
---

### 使用
1.global

    <script src="jquery.js"></script>
    <script src="connection.min.js"></script>
    <script>
        var conn = connection('ws://10.15.144.101/ws');
        conn.on('message', function(data) {
            ...
        });
        conn.request('/quote/dyna?qid=1&obj=SH000001&sub=0&output=json')
    </script>

2.requirejs

    <script src="require.js"></script>
    <script>
        require.config({
            paths: {
                jquery: 'jquery' // jquery路径
                connection: 'dist/connection.min' // connection路径
            }
        });
        require(['connection'], function(connection) {
            connection('http://10.15.144.101/quote/dyna').request('qid=1&obj=SH000001&sub=0&output=json').on('message', function(data) {...})
        });
    </script>
    
3.nodejs
安装

    npm install git+https://git@github.com/huicloud/html5-connection.git

使用
    
    var connection = require('html5-connection');
    ...
