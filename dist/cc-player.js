(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["CCPlayer"] = factory();
	else
		root["CCPlayer"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports) {

	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	// CC 视频的脚本
	var CC_SCRIPT = 'http://p.bokecc.com/js/player/v20110712.js';
	// CC 视频默认播放器的 URL
	var CC_PLAYER_PREFIX = 'http://p.bokecc.com/player?';

	var uid = 0;

	// 默认的配置参数
	var DEFAULT_OPTIONS = {
	    siteid: undefined, // 'FC8B2CFA72C44E05'
	    playerid: undefined, // '642FA1ABFCD4C9B0'
	    width: 'auto',
	    height: 'auto',
	    playertype: 1,
	    autoStart: false
	};

	function warn(msg) {
	    _typeof(window.console) === 'object' && window.console.warn && window.console.warn(msg);
	}

	function getScript(src, callback) {
	    var head = document.getElementsByTagName('head')[0];
	    var script = document.createElement('script');
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
	var loadPlayerScript = function () {
	    var pending = false;
	    var callbacks = [];

	    return function (callback) {
	        callbacks.push(callback);
	        // 如果正在加载脚本，直接返回，防止重复加载脚本
	        if (pending) {
	            return;
	        }

	        getScript(CC_SCRIPT, function () {
	            var fn = undefined;
	            // 脚本加载完成后执行回调
	            while (fn = callbacks.shift()) {
	                // eslint-disable-line
	                fn();
	            }
	        });
	    };
	}();

	// 构造 CC 视频的 URL
	function buildUrl(options) {
	    var params = [];
	    var key = undefined;

	    for (key in options) {
	        if (options.hasOwnProperty(key)) {
	            var value = encodeURIComponent(options[key]);
	            params.push(key + '=' + value);
	        }
	    }

	    return CC_PLAYER_PREFIX + params.join('&');
	}

	// 当播放器初始化完成后会调用 on_cc_player_init 函数
	// 注意多个播放器会调用同一个 on_cc_player_init 函数
	function bindInit(fn) {
	    var oldInitFn = window.on_cc_player_init;
	    window.on_cc_player_init = function on_cc_player_init(vid, objectId) {
	        if (typeof oldInitFn === 'function') {
	            oldInitFn(vid, objectId);
	        }

	        fn(vid, objectId);
	    };
	}

	function Player(container) {
	    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	    if (!container) {
	        throw new Error('参数 `container` 不能为空！');
	    }

	    // siteid 是必填的，否则在移动端会报错
	    if (!options.siteid) {
	        throw new Error('参数 `options.siteid` 不能为空！');
	    }

	    // 如果是 jQuery 封装的 DOM 对象
	    if (container.length && container.jquery) {
	        this.container = container[0];
	    } else if (typeof container === 'string') {
	        // 如果 container 是 string，则将 container 当成选择器去页面中查找元素
	        this.container = document.querySelector(container);
	    } else {
	        // 如果是其他的类型，直接将值赋给 this.container
	        this.container = container;
	    }

	    if (!this.container) {
	        throw new Error('没有在页面上找到参数 container 对应的元素。');
	    }

	    this.options = _extends({}, DEFAULT_OPTIONS, options);

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
	    var _this = this;

	    // 如果页面上没有 cc_js_Player，加载 CC Player Script
	    if (!window.cc_js_Player) {
	        loadPlayerScript(function () {
	            return _this.play(vid);
	        });
	        return;
	    }

	    // 如果在 play 中指定了 vid，则使用该 vid
	    this.options.vid = vid ? vid : this.options.vid;

	    if (!this.options.vid) {
	        throw new Error('`options.vid` 不能为空！');
	    }

	    var src = buildUrl(this.options);
	    this._prepareVideoContainer(src);

	    // 调用 CC 自家的 showPlayer() 方法来加载视频
	    window.cc_js_Player.showPlayer();

	    return this;
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

	Player.prototype.trigger = function trigger(event) {
	    var args = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

	    var handlers = this._handlers[event];
	    // 如果没有注册事件处理函数，直接返回
	    if (!handlers) {
	        return this;
	    }

	    var i = undefined;
	    for (i = 0; i < handlers.length; i++) {
	        var handler = handlers[i];
	        handler.apply(this, args);
	    }

	    return this;
	};

	Player.prototype.setConfig = function setConfig() {
	    var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	    var swf = this.getSWF();

	    // 更新 this.config 的值
	    this.config = _extends({}, this.config, config);

	    // 如果已经存在 swf 对象
	    if (swf) {
	        swf.setConfig(this.config);
	    }

	    return this;
	};

	Player.prototype.getSWF = function getSWF() {
	    var id = this.objectId;
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
	    var _this2 = this;

	    // 事件名参考 CC 的文档 http://dev.bokecc.com/#player_api_config
	    var events = ['ready', 'start', 'pause', 'resume', 'stop', 'seek', 'buffering', 'setquality', 'volumechange', 'playerror', 'fullscreen'];
	    var i = undefined;

	    var _loop = function _loop() {
	        var event = events[i];
	        // CC 默认会调用的 window 下全局函数的名称
	        var defaultCallbackName = 'on_spark_player_' + event;
	        var ccEventName = 'on_player_' + event;
	        var ccEventCallbackName = ccEventName + '_' + _this2.uid;
	        _this2.config[ccEventName] = ccEventCallbackName;

	        window[ccEventCallbackName] = function () {
	            for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	                args[_key] = arguments[_key];
	            }

	            // 为了兼容，我们先调用一下默认的 callback
	            if (typeof window[defaultCallbackName] === 'function') {
	                window[defaultCallbackName].apply(null, args);
	            }
	            _this2.trigger(event, args);
	        };
	    };

	    for (i = 0; i < events.length; i++) {
	        _loop();
	    }

	    bindInit(function (vid, objectId) {
	        // 只处理和自己的 vid 相同的视频
	        if (vid !== _this2.options.vid) {
	            return;
	        }

	        _this2.objectId = objectId;
	        _this2.setConfig();
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
	var NATIVE_METHODS = ['start', 'pause', 'resume', 'seek', 'getDuration', 'getPosition', 'getQualities', 'setQuality', 'setVolume', 'normalScreen'];

	function proxyNativeMethods() {
	    var i = undefined;

	    var _loop2 = function _loop2() {
	        var method = NATIVE_METHODS[i];
	        Player.prototype[method] = function () {
	            var swf = this.getSWF();

	            if (swf) {
	                for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
	                    args[_key2] = arguments[_key2];
	                }

	                return swf[method].apply(swf, args);
	            } else {
	                warn('请确保在播放器的 `ready` 事件触发以后再调用 `' + method + '` 方法');
	            }
	        };
	    };

	    for (i = 0; i < NATIVE_METHODS.length; i++) {
	        _loop2();
	    }
	}

	proxyNativeMethods();

	// 保存所有的 Player 的实例
	var playerCache = [];
	function getInstance(container) {
	    var i = undefined;
	    for (i = 0; i < playerCache.length; i++) {
	        if (playerCache[i].container === container) {
	            return playerCache[i];
	        }
	    }

	    return null;
	}

	// 创建 Player 实例
	function newInstance(container, options) {
	    var instance = new Player(container, options);
	    var player = { container: container, options: options, instance: instance };

	    playerCache.push(player);
	    return player;
	}

	function init(container, options) {
	    var player = getInstance(container);

	    if (!player) {
	        player = newInstance(container, options);
	    }

	    return player.instance;
	}

	module.exports = { init: init };

/***/ }
/******/ ])
});
;