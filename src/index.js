// CC 视频的脚本
const CC_SCRIPT = 'http://p.bokecc.com/js/player/v20110712.js';
// CC 视频默认播放器的 URL
const CC_PLAYER_PREFIX = 'http://p.bokecc.com/player?siteid=FC8B2CFA72C44E05&';

let uid = 0;

// 默认的配置参数
const DEFAULT_OPTIONS = {
    width: 'auto',
    height: 'auto',
    playerid: '642FA1ABFCD4C9B0',
    playertype: 1,
    autoStart: false
};

function warn(msg) {
    typeof window.console === 'object' && window.console.warn && window.console.warn(msg);
}

function getScript(src, callback) {
    const head = document.getElementsByTagName('head')[0];
    const script = document.createElement('script');
    script.async = true;
    script.src = src;

    script.onload = script.onreadystatechange = function () {
        if (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete') {
            callback && callback();
            script.onload = script.onreadystatechange = null;
        }
    };

    head.insertBefore(script, head.firstChild);
}

// 加载 CC 视频的脚本
const loadPlayerScript = function () {
    const pending = false;
    const callbacks = [];

    return function (callback) {
        callbacks.push(callback);
        // 如果正在加载脚本，直接返回，防止重复加载脚本
        if (pending) {
            return;
        }

        getScript(CC_SCRIPT, function () {
            let fn;
            // 脚本加载完成后执行回调
            while (fn = callbacks.shift()) { // eslint-disable-line
                fn();
            }
        });
    };
}();

// 构造 CC 视频的 URL
function buildUrl(options) {
    const params = [];
    let key;

    for (key in options) {
        if (options.hasOwnProperty(key)) {
            let value = encodeURIComponent(options[key]);
            params.push(`${key}=${value}`);
        }
    }

    return CC_PLAYER_PREFIX + params.join('&');
}

// 当播放器初始化完成后会调用 on_cc_player_init 函数
// 注意多个播放器会调用同一个 on_cc_player_init 函数
function bindInit(fn) {
    const oldInitFn = window.on_cc_player_init;
    window.on_cc_player_init = function on_cc_player_init(vid, objectId) {
        if (typeof oldInitFn === 'function') {
            oldInitFn(vid, objectId);
        }

        fn(vid, objectId);
    };
}

function Player(container, options = {}) {
    if (!container) {
        throw new Error('参数 `container` 不能为空！');
    }

    // 如果是 jQuery 封装的 DOM 对象
    if (container.length && container.jquery) {
        this.container = container[0];
    } else if (typeof container === 'string') {
        // 如果不是，则将 container 当成选择器去页面中查找元素
        this.container = document.querySelector(container);
    } else {
        this.container = container;
    }

    if (!this.container) {
        throw new Error('没有在页面上找到参数 container 对应的元素。');
    }

    this.options = { ...DEFAULT_OPTIONS, ...options };
    // player 的 swf 对应的 id
    this.objectId = null;
    // 用来保存事件处理函数
    this._handlers = {};
    // CC 播放器原始的配置项
    this.config = {};
    this.uid = uid++;
    
    // 初始化播放器事件
    this._initPlayerEvent();
}

Player.prototype.play = function play(vid) {
    // 如果页面上没有 cc_js_Player，加载 CC Player Script
    if (!window.cc_js_Player) {
        loadPlayerScript(() => this.play(vid));
        return;
    }

    // 如果在 play 中指定了 vid，则使用该 vid
    this.options.vid = vid ? vid : this.options.vid;

    if (!this.options.vid) {
        throw new Error('`options.vid` 不能为空！');
    }

    const src = buildUrl(this.options);
    this._prepareVideoContainer(src);
    window.cc_js_Player.showPlayer();
};

Player.prototype.on = function on(event, handler) {
    if (typeof handler !== 'function') {
        throw new Error('`handler` 类型不正确！');
    }

    // 如果没有注册过 event，则初始化一下
    if (!this._handlers[event]) {
        this._handlers[event] = [];
    }

    this._handlers[event].push(handler);

    return this;
};

Player.prototype.trigger = function trigger(event, args = []) {
    const handlers = this._handlers[event];
    // 如果没有注册事件处理函数，直接返回
    if (!handlers) {
        return this;
    }

    let i;
    for (i = 0; i < handlers.length; i++) {
        let handler = handlers[i];
        handler.apply(this, args);
    }

    return this;
};

Player.prototype.setConfig = function setConfig(config = {}) {
    var swf = this.getSWF();

    // 更新 this.config 的值
    this.config = { ...this.config, ...config };

    // 如果已经存在 swf 对象
    if (swf) {
        swf.setConfig(this.config);
    }
};

Player.prototype.getSWF = function getSWF() {
    const id = this.objectId;
    // this.objectId 有可能为 null，只有当视频加载后，才会给它赋值
    if (!id) {
        return null;
    }

    if (window.document[id]) {
        return window.document[id];
    } else if (navigator.appName.indexOf('Microsoft') == -1) {
        if (document.embeds && document.embeds[id]) {
            return document.embeds[id];
        }
    } else {
        return document.getElementById(id);
    }
};

Player.prototype._initPlayerEvent = function _initPlayerEvent() {
    // 事件名参考 CC 的文档 http://dev.bokecc.com/#player_api_config
    const events = [
        'ready',
        'start',
        'pause',
        'resume',
        'stop',
        'seek',
        'buffering',
        'setquality',
        'volumechange',
        'playerror',
        'fullscreen'
    ];
    let i;

    for (i = 0; i < events.length; i++) {
        const event = events[i];
        // CC 默认会调用的 window 下全局函数的名称
        const defaultCallbackName = `on_spark_player_${event}`;
        const ccEventName = `on_player_${event}`;
        const ccEventCallbackName = `${ccEventName}_${this.uid}`;
        this.config[ccEventName] = ccEventCallbackName;

        window[ccEventCallbackName] = (...args) => {
            // 为了兼容，我们先调用一下默认的 callback
            if (typeof window[defaultCallbackName] === 'function') {
                window[defaultCallbackName].apply(null, args);
            }
            this.trigger(event, args);
        };
    }

    bindInit((vid, objectId) => {
        // 只处理和自己的 vid 相同的视频
        if (vid !== this.options.vid) {
            return;
        }

        this.objectId = objectId;
        this.setConfig();
    });
};

Player.prototype._prepareVideoContainer = function _prepareVideoContainer(src) {
    var playerEl = document.createElement('div');
    var script = document.createElement('script');

    // 根据 CC 播放代码的要求，将 type 设置成 `text/html`
    script.type = 'text/html';
    script.src = src;

    playerEl.appendChild(script);

    // 清空 this.container
    while (this.container.firstChild) {
        this.container.removeChild(this.container.firstChild);
    }

    this.container.appendChild(playerEl);
};

// CC 视频原生 API 提供的方法，具体文档参见 http://dev.bokecc.com/#player_api
// 此处给原始方法加了一层代理，方便使用
const NATIVE_METHODS = [
    'start',
    'pause',
    'resume',
    'seek',
    'getDuration',
    'getPosition',
    'getQualities',
    'setQuality',
    'setVolume',
    'normalScreen'
];

function proxyNativeMethods() {
    let i;

    for (i = 0; i < NATIVE_METHODS.length; i++) {
        let method = NATIVE_METHODS[i];
        Player.prototype[method] = function (...args) {
            const swf = this.getSWF();

            if (swf) {
                return swf[method].apply(swf, args);
            } else {
                warn('请确保在播放器的 `ready` 事件触发以后再调用 `' + method + '` 方法');
            }
        };
    }

}

proxyNativeMethods();

// 保存所有的 Player 的实例
const playerCache = [];
function getInstance(container) {
    let i;
    for (i = 0; i < playerCache.length; i++) {
        if (playerCache[i].container === container) {
            return playerCache[i];
        }
    }

    return null;
}

// 创建 Player 实例
function newInstance(container, options) {
    const instance = new Player(container, options);
    const player = { container, options, instance };

    playerCache.push(player);
    return player;
}

function init(container, options) {
    let player = getInstance(container);

    if (!player) {
        player = newInstance(container, options);
    }

    return player.instance;
}

module.exports = { init };
