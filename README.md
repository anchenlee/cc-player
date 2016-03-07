# CC Player

> 对 CC 视频播放器的二次封装，提供一些常用的 API 接口，方便使用

## 主要功能

- 支持通过视频 ID 来播放视频
- 支持监听播放器事件
- 支持调用 CC 视频原生播放器的方法

## 如何安装

### 1. 使用 npm 安装（推荐）

```sh
npm install cc-player --save
```

### 2. 通过 `<script>` 直接引用

```html
<script src="path/to/cc-player.min.js"></script>
```

## 使用方法

```js
// 通过 npm 安装的方式
var CCPlayer = require('cc-player');
var player = CCPlayer.init('#video-container', {
    width: 600,
    height: 400
});

player.play(vid);
```

```js
// 通过直接引用的方式会在 `window` 上添加一个变量 `CCPlayer`
// 直接使用该变量即可。
var player = CCPlayer.init('#video-container', {
    width: 600,
    height: 400
});

player.play(vid);
```

## API 文档

### `CCPlayer.init(container, options)`

初始化一个视频播放器。

参数：

- `container (DOMElement|jQuery|string)`: 必填。播放器的容器，可以是一个 DOM 节点元素，可以是一个 jQuery 的对象，
也可以是一个 DOM 选择器。
- `options (object)`: 必选。播放器的配置选项，请至少提供 `siteid`，否则导致移动端错误
  - `siteid`: 必选，站点 id，但是建议配置成各自的 `siteid`，有利于 CC 视频的统计播放信息
  - `playerid`: 可选，播放器的皮肤类型，请根据自身需要进行设置
  - `width`: 可选，视频宽度，默认是 `auto`
  - `height`: 可选，视频高度，默认是 `auto`
  - `playertype`: 可选，**暂不确定代表什么意思**，默认值是 `1`
  - `autoStart`: 可选，是否自动播放，默认值是 `false`
  - `vid`: 可选，视频的 id，默认为空

返回值：

播放器的实例。

### `player.play(vid)`

加载视频。

参数：

- `vid (string)`: 可选，如果设置了 `vid`，则播放 id 为 `vid` 的视频，如果没有指定 `vid`，则
根据 `init(container, options)` 中 `options` 配置的 `vid` 来加载视频

返回值：

播放器的实例。

### `player.on(eventName, handler)`

给播放器添加事件处理函数。具体支持的事件请参考下面的[事件列表](#事件列表)。

### `player.start()`

开始播放

### `player.pause()`

暂停播放

### `player.resume()`

恢复播放

### `player.seek(time)`

定位至指定时间，参数 `time`（单位：秒）

### `player.getDuration()`

获取视频片长（单位：秒）

### `player.getPosition()`

获取当前播放时间（单位：秒）

### `player.getQualities()`

获取当前视频可⽤清晰度列表

返回类型：Array

eg. `[{ value: "0", label: "普通" }, { value: "1", label: "清晰" }]`

### `player.setQuality(quality)`

设置清晰度

参数 `quality` 为 `getQualities` 方法获取的 `value` 值

### `player.setVolume(volume)`

设置音量

参数 `volume` 取值范围：[0-1]. eg. `setVolume(0.5)`

### `player.normalScreen()`

退出全屏

### `player.setConfig(config)`

配置播放器

参数 `config` 为配置对象，详细参照[播放器配置](http://dev.bokecc.com/#player_api_config)

### `player.getSWF()`

获取播放器的 flash object 对象

## 事件列表

### `ready`

播放器准备就绪后触发的事件

### `start`

开始播放时触发的事件

### `pause`

暂停播放时触发的事件

### `resume`

暂停后继续播放时触发的事件

### `stop`

播放结束后触发的事件

### `seek`

拖动播放时触发的事件。

事件处理函数的参数为 `from`, `to`。

  - `from`: 定位之前的时间点（单位 秒）
  - `to`: 定位指定的时间点（单位 秒）

### `buffering`

缓冲开始或结束时触发的事件

事件处理函数的参数：`flag`

`flag`，是否缓冲中； 取值：0, 否；1, 是

### `setquality`

清晰度改变时触发的事件

事件处理函数的参数：`quality`

`quality`，当前清晰度；取值：0, 普通；1, 清晰；2, 高清

### `volumechange`

音量改变时触发的事件

事件处理函数的参数：`vol`

`vol`，当前音量；取值范围：0 - 1

### `playerror`

当播放失败时的触发的事件

事件处理函数的参数：`code`

[错误码](http://dev.bokecc.com/#player_api_errorcode)

### `fullscreen`

全屏或退出全屏时触发的事件

事件处理函数的参数：`flag`。

`flag`，是否全屏；取值：0, 否；1, 是

## [CHANGELOG](CHANGELOG.md)

## LICENSE

[MIT](LICENSE)
