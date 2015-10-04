(function () {
    /**
     * @file connectJs.js
     * @author hebo01@baidu.com
     */
    /**
     * API
     * new ConnectJs ( opts )
     * close
     * start
     * send
     * heartBeat
     * changeConnectType
     *
     * 需求： WebSocket 作为通讯优先使用方式，在断掉或者异常的情况下，使用轮询。
     * 需要保证 轮询接口与WebSocket接口 数据接口一致。
     * 统一通过 message事件传递给 调用者。
     * TODO问题： 通过配置一个轮询URL + 内部封装， 是否可以适用通用的轮询场景？
     *           如果不适用通用轮询场景 则开放给API( connect.on('polling', fn)) 给使用者自己组装轮询逻辑。
     *
     */
    var CONNECTING = WebSocket && WebSocket.CONNECTING;
    var OPEN = WebSocket && WebSocket.OPEN;
    var CLOSING = WebSocket && WebSocket.CLOSING;
    var CLOSED = WebSocket && WebSocket.CLOSED;
    var TRYRECONNECT = 5;
    var attrs = {
        // polling url
        pollingUrl: '',
        // WebSocket url
        socketUrl: '',
        // 心跳间隔
        heartBeatInterval: 3000,
        // 心跳数据
        heartBeatData: {},
        // 重连间隔（websocket)
        reconnectInterval: 30000,
        // 正在尝试重连
        tryConnect: false,
        // 最大可重连次数
        maxReconnectAttempts: 3,
        // 已重连次数
        reconnectAttempts: 0,
        // 轮询间隔
        pollingInterval: 30000,
        // 链接类型
        connectType: 'webSocket',
        // 当前状态
        readyState: -1,
        // WebSocket
        ws: null,
        //
        isActive: false,
        timer: null
    };
     
    var ConnectJs = jsmod.util.klass({
        get: function (attr) {
            return this.attrs[attr];
        },
        set: function (attr, value) {
            this.attrs[attr] = value;
        },
        initialize: function (config) {
            this.attrs = attrs;
            for (var key in config) {
                this.set(key, config[key]);
            }
        },
        isSupport: function () {
            return !!window.WebSocket ? 'webSocket' : 'polling';
        },

        /**
         * 判断设置是否包含这种类型
         * @param  {[type]}  type [description]
         * @return {Boolean}      [description]
         */
        hasConnectType: function (type) {
            var me = this;
            var connectType = me.get("connectType");

            if (connectType.indexOf(connectType) > -1) {
                return true;
            }
        },

        /**
         * 关闭连接(websocket)   TODO 关闭polling
         * @param {number} code 关闭代码
         * @param {string} reason 原因
         */
        close: function (code, reason) {
            var me = this;
            var ws = me.get('ws');

            if (me.hasConnectType('webSocket')) {
                // me.ws.close();
                if (typeof code === 'undefined') {
                    code = 1000;
                }
                ws.close(code, reason);
            }
            me.heartBeats(true);
            me.set('readyState', WebSocket.CLOSED);
            me.trigger('close');
        },
        /**
         * 传递消息
         * @param {Object} message 消息主体
         */
        message: function (message, type) {
            var me = this;
            if (me.get('readyState') ===  WebSocket.CLOSED) {
                return;
            }
            me.trigger('message', [message, type]);
        },
        /**
         * 发送数据 (WebSocket)
         * @param {Object} data 发送数据
         */
        send: function (data) {
            var me = this;
            var ws = me.get('ws');
            if (ws == null || ws === undefined) {
                throw Error('ws is not defined');
            }
            if (me.get('readyState') === WebSocket.CLOSED) {
                return;
            }
            data = data || me.get('heartBeatData');
            if (typeof(data) !== 'string') {
                data = JSON.stringify(data);
            }
            var flag = ws.send(data);
            me.trigger('send', flag);
        },
        /**
         * 开始连接
         */
        start: function () {
            var me = this;
            var isSupport = me.isSupport();
            var socketUrl = me.get('socketUrl');
            
            if (me.hasConnectType("webSocket") && isSupport === 'webSocket') {
                me.connectWithWebSocket();
            }

            if (me.hasConnectType('polling')) {
                me.connectWithPolling();
            }

            me.trigger('start');
        },
        /**
         * WebSocket Error
         * @param {Object} event Error event
         */
        webSocketError: function (event) {
            var me = this;
            var ws = me.get('ws');
            var reconnectAttempts = me.get('reconnectAttempts');
            var maxReconnectAttempts = me.get('maxReconnectAttempts');
            me.set('tryConnect', true);
            if (ws) {
                ws.close();
                me.set('ws', null);
            }
            if (reconnectAttempts >= maxReconnectAttempts) {
                me.set('tryConnect', false);
                // me.connectWithPolling();
                me.trigger('error', event);
            } else {
                me.webSocketReconnect();
            }
        },
        /**
         * WebSocket 重连尝试
         */
        webSocketReconnect: function () {
            var me = this;
            var reconnectInterval = me.get('reconnectInterval');
            var reconnectAttempts = me.get('reconnectAttempts');
            setTimeout(function () {
                reconnectAttempts++;
                me.connectWithWebSocket();
                me.set('reconnectAttempts', reconnectAttempts);
            }, reconnectInterval);
        },
        /**
         * WebSocket逻辑
         */
        connectWithWebSocket: function () {
            var me = this;
            var ws = me.get('ws');
            
            if (!ws || ws == null) {
                ws = new WebSocket(me.get('socketUrl'));
                me.set('ws', ws);
                ws.onopen = function () {
                    me.trigger('open');
                    me.set('readyState', WebSocket.OPEN);
                    me.heartBeats();
                };
                ws.onclose = function (closeEvent) {
                    me.trigger('close', closeEvent);
                    me.set('readyState', WebSocket.CLOSED);
                    me.heartBeats(true);
                    me.connectWithPolling();
                };
                ws.onmessage = function (event) {
                    me.message(event, "webSocket");
                };
                ws.onerror = function (event) {
                    me.webSocketError(event);
                };
            }
            me.trigger('webSocket');
        },
        /**
         * 心跳
         * @param {boolean} flag 是否关闭心跳
         */
        heartBeats: function (flag) {
            var me = this;
            var ws = me.get('ws');
            var timer = me.get('timer');
            if (flag) {
                clearInterval(timer);
                me.set('timer', null);
                return true;
            }
            // 模拟心跳
            if (ws) {
                timer = setInterval(function () {
                    if (ws.bufferedAmount === 0) {
                        me.send(JSON.stringify(me.get('heartBeatData')));
                    }
                    me.trigger('heartBeat');
                }, me.get('heartBeatInterval'));
                me.set('timer', timer);
            }
     
        },
        /**
         * 轮询逻辑
         */
        connectWithPolling: function () {
            var me = this;
            var url = me.get('pollingUrl');
            if (!url) {
                throw Error('need polling url');
            }
            if (me.get('tryConnect')) {
                return;
            }
            var pollingErrorTotalMax = 4;
            var pollingErrorTotal = 0;
            function executeAjax() {
                $.ajax({
                    url: url,
                    dataType: 'json',
                    type: 'GET',
                    cache: false,
                    success: function (rs) {
                        me.set('readyState', OPEN);
                        me.message(rs, "polling");
                        doPolling();
                    },
                    error: function () {
                        me.set('readyState', CLOSED);
                        pollingErrorTotal++;
                        if (pollingErrorTotal >= pollingErrorTotalMax) {
                            me.trigger('error', new Error('polling Error'));
                            return;
                        }
                        doPolling();
                    }
                });
            }
            var pollingInterval = me.get('pollingInterval');
            function doPolling() {
                setTimeout(function () {
                    executeAjax();
                }, pollingInterval);
            }
            executeAjax();
            me.set('readyState', CONNECTING);
            me.trigger('polling', me);
        },
        /**
         * 切换连接类型 WebSocket/polling
         * @param {string} type 类型
         */
        changeConnectType: function (type) {
            var me = this;
            var oldType = me.get('connectType');
            
            me.close();
            me.set('connectType', type);
            me.start();
            me.trigger('connectType', type);
        },
        // check self attrs
        test: function () {
            var me  = this;
            console.log(me.attrs);
        }
    }, null, [jsmod.util.Event]);
    
    jsmod.util.ConnectJs = ConnectJs;
}());